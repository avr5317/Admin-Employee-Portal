'use strict';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestEnv, makeUser, signToken, bearer, leaksSecrets, pngBuffer, PASSWORD } = require('./helpers');

describe('input validation and secret leaks', () => {
    let t;
    let admin;
    let adminToken;
    let employeeToken;

    before(async () => {
        t = await startTestEnv();
        admin = await makeUser(t, { email: 'admin@t.test', type: 'admin' });
        const employee = await makeUser(t, { email: 'employee@t.test' });
        adminToken = signToken(t, admin);
        employeeToken = signToken(t, employee);
    });
    after(() => t.stop());

    describe('operator injection is rejected with 400', () => {
        const operator = { $ne: '' };

        it('login: email as an object', async () => {
            const res = await t.request.post('/user/login').send({ email: operator, password: 'x' });
            assert.equal(res.status, 400);
            assert.equal(res.body.token, undefined);
        });

        it('login: password as an object', async () => {
            const res = await t.request.post('/user/login').send({ email: admin.email, password: operator });
            assert.equal(res.status, 400);
        });

        it('login: email and password as numbers or arrays', async () => {
            assert.equal((await t.request.post('/user/login').send({ email: 123, password: PASSWORD })).status, 400);
            assert.equal((await t.request.post('/user/login').send({ email: [admin.email], password: PASSWORD })).status, 400);
        });

        it('register: email, name and password as objects', async () => {
            const base = { fullName: 'New Person', email: 'new@t.test', password: PASSWORD };
            for (const field of ['fullName', 'email', 'password']) {
                const res = await t.request.post('/user/register').send({ ...base, [field]: operator });
                assert.equal(res.status, 400, field);
            }
            assert.equal(await t.User.countDocuments({ email: 'new@t.test' }), 0);
        });

        it('create: email as an array and type as an object', async () => {
            const base = { fullName: 'New Person', email: 'new2@t.test', password: PASSWORD, type: 'employee' };
            assert.equal((await t.request.post('/user/create').send({ ...base, email: ['a@b.test'] })).status, 400);
            assert.equal((await t.request.post('/user/create').send({ ...base, type: operator })).status, 400);
        });

        it('edit: email as an object does not touch any user', async () => {
            const before = await t.User.find().lean();
            const res = await t.request.put('/user/edit').set(bearer(adminToken)).send({ email: operator, fullName: 'Hacked' });
            assert.equal(res.status, 400);
            assert.deepEqual(await t.User.find().lean(), before);
        });

        it('delete: email as an object deletes nobody', async () => {
            const count = await t.User.countDocuments();
            const res = await t.request.delete('/user/delete').set(bearer(adminToken)).send({ email: operator });
            assert.equal(res.status, 400);
            assert.equal(await t.User.countDocuments(), count);
        });

        it('upload: an admin\'s email field as an object (email[$ne]=x) is 400 and writes nothing', async () => {
            const res = await t.request
                .post('/user/uploadImage')
                .set(bearer(adminToken))
                .field('email[$ne]', 'x')
                .attach('image', pngBuffer(), { filename: 'a.png', contentType: 'image/png' });
            assert.equal(res.status, 400);
            assert.match(res.body.error, /plain text/);
            assert.equal((await t.User.findOne({ email: admin.email })).imagePath, null);
        });

        it('the error never echoes the submitted value back', async () => {
            const res = await t.request.post('/user/login').send({ email: { $ne: 'SECRET-MARKER-123' }, password: 'x' });
            assert.equal(res.status, 400);
            assert.ok(!JSON.stringify(res.body).includes('SECRET-MARKER-123'));
        });
    });

    describe('no response contains a password or hash', () => {
        it('checks every endpoint that returns user data', async () => {
            const responses = {
                login: await t.request.post('/user/login').send({ email: admin.email, password: PASSWORD }),
                loginFail: await t.request.post('/user/login').send({ email: admin.email, password: 'wrong' }),
                register: await t.request.post('/user/register').send({ fullName: 'Leak Check', email: 'leak@t.test', password: PASSWORD }),
                registerDup: await t.request.post('/user/register').send({ fullName: 'Leak Check', email: 'leak@t.test', password: PASSWORD }),
                create: await t.request.post('/user/create').send({ fullName: 'Leak Check', email: 'leak2@t.test', password: PASSWORD, type: 'employee' }),
                users: await t.request.get('/user/users').set(bearer(adminToken)),
                getAll: await t.request.get('/user/getAll').set(bearer(adminToken)),
                edit: await t.request.put('/user/edit').set(bearer(adminToken)).send({ email: 'leak@t.test', fullName: 'Leak Edited' }),
                upload: await t.request
                    .post('/user/uploadImage')
                    .set(bearer(employeeToken))
                    .attach('image', pngBuffer(), { filename: 'a.png', contentType: 'image/png' }),
                del: await t.request.delete('/user/delete').set(bearer(adminToken)).send({ email: 'leak2@t.test' }),
                jobs: await t.request.get('/api/jobs').set(bearer(employeeToken)),
                forbidden: await t.request.get('/user/users').set(bearer(employeeToken)),
                unauthorized: await t.request.get('/user/users'),
                notFound: await t.request.get('/no/such/route'),
            };

            for (const [name, res] of Object.entries(responses)) {
                assert.equal(leaksSecrets(res), false, `${name} (status ${res.status}) leaked a password or hash`);
            }
            // sanity: the checks above did exercise real successes
            assert.equal(responses.login.status, 200);
            assert.equal(responses.users.status, 200);
            assert.equal(responses.upload.status, 201);
        });
    });

    describe('CORS', () => {
        it('allows only the default client origin and does not enable credentials', async () => {
            const res = await t.request.get('/').set('Origin', 'http://localhost:5173');
            assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
            assert.equal(res.headers['access-control-allow-credentials'], undefined);

            const other = await t.request.get('/').set('Origin', 'http://evil.test');
            assert.notEqual(other.headers['access-control-allow-origin'], 'http://evil.test');
        });
    });
});
