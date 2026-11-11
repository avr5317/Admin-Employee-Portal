'use strict';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { startTestEnv, makeUser, signToken, login, bearer, leaksSecrets, PASSWORD } = require('./helpers');

describe('authentication and roles', () => {
    let t;
    let admin;
    let employee;

    before(async () => {
        t = await startTestEnv();
        admin = await makeUser(t, { email: 'admin@t.test', type: 'admin' });
        employee = await makeUser(t, { email: 'employee@t.test', type: 'employee' });
    });
    after(() => t.stop());

    describe('POST /user/login', () => {
        it('succeeds and returns { message, user, token } without a password', async () => {
            const res = await t.request.post('/user/login').send({ email: admin.email, password: PASSWORD });
            assert.equal(res.status, 200);
            assert.equal(res.body.message, 'Login successful');
            assert.equal(res.body.user.email, admin.email);
            assert.equal(res.body.user.type, 'admin');
            assert.equal(typeof res.body.token, 'string');
            assert.equal(leaksSecrets(res), false);
        });

        it('returns an HS256 token with id, email and type that expires in one day', async () => {
            const res = await t.request.post('/user/login').send({ email: employee.email, password: PASSWORD });
            const decoded = t.jwt.decode(res.body.token, { complete: true });
            assert.equal(decoded.header.alg, 'HS256');
            assert.equal(decoded.payload.id, String(employee._id));
            assert.equal(decoded.payload.email, employee.email);
            assert.equal(decoded.payload.type, 'employee');
            assert.equal(decoded.payload.exp - decoded.payload.iat, 24 * 60 * 60);
        });

        it('rejects a wrong password with 401', async () => {
            const res = await t.request.post('/user/login').send({ email: admin.email, password: 'Wrong123!' });
            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Invalid email or password.');
            assert.equal(res.body.token, undefined);
        });

        it('gives the same 401 for an unknown email (no account enumeration)', async () => {
            const res = await t.request.post('/user/login').send({ email: 'nobody@t.test', password: PASSWORD });
            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Invalid email or password.');
        });

        it('returns 400 when email or password is missing', async () => {
            const noPassword = await t.request.post('/user/login').send({ email: admin.email });
            const noEmail = await t.request.post('/user/login').send({ password: PASSWORD });
            const noBody = await t.request.post('/user/login');
            assert.equal(noPassword.status, 400);
            assert.equal(noEmail.status, 400);
            assert.equal(noBody.status, 400);
        });
    });

    describe('token checks (GET /api/jobs needs any logged-in user)', () => {
        it('returns 401 with no token', async () => {
            const res = await t.request.get('/api/jobs');
            assert.equal(res.status, 401);
            assert.match(res.body.error, /Authentication required/);
        });

        it('returns 401 for a garbage token', async () => {
            const res = await t.request.get('/api/jobs').set(bearer('not.a.token'));
            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Invalid or expired token.');
        });

        it('returns 401 for the wrong scheme', async () => {
            const res = await t.request.get('/api/jobs').set('Authorization', `Basic ${signToken(t, employee)}`);
            assert.equal(res.status, 401);
        });

        it('returns 401 for an expired token', async () => {
            const res = await t.request.get('/api/jobs').set(bearer(signToken(t, employee, { expiresIn: -10 })));
            assert.equal(res.status, 401);
        });

        it('returns 401 for a token signed with a different secret', async () => {
            const forged = signToken(t, admin, { secret: crypto.randomBytes(32).toString('hex') });
            const res = await t.request.get('/user/users').set(bearer(forged));
            assert.equal(res.status, 401);
        });

        it('returns 401 for a token signed with another algorithm (HS256 is pinned)', async () => {
            const hs512 = signToken(t, admin, { algorithm: 'HS512' });
            const res = await t.request.get('/user/users').set(bearer(hs512));
            assert.equal(res.status, 401);
        });

        it('returns 401 for a token whose id is malformed', async () => {
            const token = t.jwt.sign({ id: 'not-an-id', type: 'admin' }, process.env.JWT_SECRET, { algorithm: 'HS256' });
            const res = await t.request.get('/user/users').set(bearer(token));
            assert.equal(res.status, 401);
        });

        it('returns 401 for a token for a user that was deleted', async () => {
            const ghost = await makeUser(t, { email: 'ghost@t.test' });
            const token = signToken(t, ghost);
            assert.equal((await t.request.get('/api/jobs').set(bearer(token))).status, 200);

            await t.User.deleteOne({ _id: ghost._id });

            const res = await t.request.get('/api/jobs').set(bearer(token));
            assert.equal(res.status, 401);
            assert.match(res.body.error, /no longer exists/);
        });

        it('returns 401 for a deleted ADMIN on admin routes too', async () => {
            const gone = await makeUser(t, { email: 'gone-admin@t.test', type: 'admin' });
            const token = signToken(t, gone);
            assert.equal((await t.request.get('/user/users').set(bearer(token))).status, 200);

            await t.User.deleteOne({ _id: gone._id });

            assert.equal((await t.request.get('/user/users').set(bearer(token))).status, 401);
        });

        it('lets a logged-in employee list jobs (200)', async () => {
            const res = await t.request.get('/api/jobs').set(bearer(signToken(t, employee)));
            assert.equal(res.status, 200);
            assert.ok(Array.isArray(res.body.jobs));
        });
    });

    describe('role comes from the database, not the token', () => {
        it('a demoted admin loses access immediately (token still unexpired)', async () => {
            const boss = await makeUser(t, { email: 'boss@t.test', type: 'admin' });
            const bossToken = await login(t, boss.email);
            assert.equal((await t.request.get('/user/users').set(bearer(bossToken))).status, 200);

            const demote = await t.request
                .put('/user/edit')
                .set(bearer(signToken(t, admin)))
                .send({ email: boss.email, type: 'employee' });
            assert.equal(demote.status, 200);

            const after = await t.request.get('/user/users').set(bearer(bossToken));
            assert.equal(after.status, 403);
            assert.equal(after.body.error, 'Admin access required.');
            // still a valid employee for login-only routes
            assert.equal((await t.request.get('/api/jobs').set(bearer(bossToken))).status, 200);
        });

        it('an employee token that claims type "admin" is still an employee', async () => {
            const forged = t.jwt.sign(
                { id: String(employee._id), email: employee.email, type: 'admin' },
                process.env.JWT_SECRET,
                { algorithm: 'HS256', expiresIn: '1h' }
            );
            const res = await t.request.get('/user/users').set(bearer(forged));
            assert.equal(res.status, 403);
        });

        it('a promoted employee gains admin access immediately', async () => {
            const rising = await makeUser(t, { email: 'rising@t.test', type: 'employee' });
            const token = signToken(t, rising);
            assert.equal((await t.request.get('/user/users').set(bearer(token))).status, 403);

            await t.User.updateOne({ _id: rising._id }, { $set: { type: 'admin' } });

            assert.equal((await t.request.get('/user/users').set(bearer(token))).status, 200);
        });
    });

    describe('an employee gets 403 on every admin route', () => {
        const fakeJobId = String(new mongoose.Types.ObjectId());
        const adminRoutes = [
            ['post', '/api/create/job', { companyName: 'A', jobTitle: 'B', description: 'C', salary: 1 }],
            ['delete', `/api/delete/job/${fakeJobId}`, undefined],
            ['get', '/user/users', undefined],
            ['get', '/user/getAll', undefined],
            ['put', '/user/edit', { email: 'x@t.test', fullName: 'Changed' }],
            ['delete', '/user/delete', { email: 'x@t.test' }],
        ];

        for (const [method, path, body] of adminRoutes) {
            it(`${method.toUpperCase()} ${path.replace(fakeJobId, ':id')}`, async () => {
                let req = t.request[method](path).set(bearer(signToken(t, employee)));
                if (body) req = req.send(body);
                const res = await req;
                assert.equal(res.status, 403);
                assert.equal(res.body.error, 'Admin access required.');
            });

            it(`${method.toUpperCase()} ${path.replace(fakeJobId, ':id')} without a token is 401`, async () => {
                let req = t.request[method](path);
                if (body) req = req.send(body);
                const res = await req;
                assert.equal(res.status, 401);
            });
        }
    });

    describe('GET /user/getAll is admin-only', () => {
        it('401 anonymous, 403 employee, 200 admin (no passwords)', async () => {
            assert.equal((await t.request.get('/user/getAll')).status, 401);
            assert.equal((await t.request.get('/user/getAll').set(bearer(signToken(t, employee)))).status, 403);

            const res = await t.request.get('/user/getAll').set(bearer(signToken(t, admin)));
            assert.equal(res.status, 200);
            assert.ok(res.body.users.length >= 2);
            assert.equal(leaksSecrets(res), false);
        });
    });
});
