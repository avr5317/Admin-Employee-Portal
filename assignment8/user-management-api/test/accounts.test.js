'use strict';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestEnv, makeUser, signToken, bearer, leaksSecrets, PASSWORD } = require('./helpers');

const newUser = (email, extra = {}) => ({ fullName: 'New Person', email, password: PASSWORD, ...extra });

// The database starts EMPTY (no admin at all) so the "no first-admin bootstrap" rule is tested.
describe('registration and admin creation', () => {
    let t;

    before(async () => {
        t = await startTestEnv();
    });
    after(() => t.stop());

    describe('POST /user/register', () => {
        it('always creates an employee, even with "type":"admin" in the body', async () => {
            const res = await t.request.post('/user/register').send(newUser('reg1@t.test', { type: 'admin' }));
            assert.equal(res.status, 201);
            assert.equal(res.body.user.type, 'employee');
            assert.equal(leaksSecrets(res), false);

            const stored = await t.User.findOne({ email: 'reg1@t.test' });
            assert.equal(stored.type, 'employee');
            assert.equal(await t.User.countDocuments({ type: 'admin' }), 0);
        });

        it('stores a bcrypt hash, not the password, and the new user can log in', async () => {
            await t.request.post('/user/register').send(newUser('reg2@t.test'));
            const stored = await t.User.findOne({ email: 'reg2@t.test' });
            assert.notEqual(stored.password, PASSWORD);
            assert.match(stored.password, /^\$2[aby]\$/);

            const res = await t.request.post('/user/login').send({ email: 'reg2@t.test', password: PASSWORD });
            assert.equal(res.status, 200);
        });

        it('rejects a duplicate email, ignoring case (409)', async () => {
            await t.request.post('/user/register').send(newUser('dupe@t.test'));
            const again = await t.request.post('/user/register').send(newUser('DUPE@t.test'));
            assert.equal(again.status, 409);
            assert.equal(await t.User.countDocuments({ email: 'dupe@t.test' }), 1);
        });

        it('rejects a weak password, a bad email and missing fields (400)', async () => {
            const weak = await t.request.post('/user/register').send(newUser('weak@t.test', { password: 'weak' }));
            const badEmail = await t.request.post('/user/register').send(newUser('not-an-email'));
            const missing = await t.request.post('/user/register').send({ email: 'm@t.test' });
            assert.equal(weak.status, 400);
            assert.equal(badEmail.status, 400);
            assert.equal(missing.status, 400);
        });
    });

    describe('POST /user/create', () => {
        it('anonymous create of an admin is 403 when the database has NO admin', async () => {
            assert.equal(await t.User.countDocuments({ type: 'admin' }), 0);

            const res = await t.request.post('/user/create').send(newUser('first@t.test', { type: 'admin' }));
            assert.equal(res.status, 403);
            assert.equal(res.body.error, 'Only an admin can create admin accounts.');
            assert.equal(await t.User.countDocuments({ type: 'admin' }), 0);
            assert.equal(await t.User.countDocuments({ email: 'first@t.test' }), 0);
        });

        it('a garbage token cannot create an admin either (403)', async () => {
            const res = await t.request
                .post('/user/create')
                .set(bearer('garbage'))
                .send(newUser('garbage@t.test', { type: 'admin' }));
            assert.equal(res.status, 403);
            assert.equal(await t.User.countDocuments({ type: 'admin' }), 0);
        });

        it('anonymous create of an employee is still allowed (201)', async () => {
            const res = await t.request.post('/user/create').send(newUser('plain@t.test', { type: 'employee' }));
            assert.equal(res.status, 201);
            assert.equal(leaksSecrets(res), false);
        });

        it('an invalid type is 400', async () => {
            const res = await t.request.post('/user/create').send(newUser('weird@t.test', { type: 'superuser' }));
            assert.equal(res.status, 400);
        });

        it('with an admin in the database: anonymous is still 403', async () => {
            await makeUser(t, { email: 'admin@t.test', type: 'admin' });
            const res = await t.request.post('/user/create').send(newUser('anon-admin@t.test', { type: 'admin' }));
            assert.equal(res.status, 403);
            assert.equal(await t.User.countDocuments({ email: 'anon-admin@t.test' }), 0);
        });

        it('an employee token creating an admin is 403', async () => {
            const employee = await t.User.findOne({ email: 'plain@t.test' });
            const res = await t.request
                .post('/user/create')
                .set(bearer(signToken(t, employee)))
                .send(newUser('emp-made-admin@t.test', { type: 'admin' }));
            assert.equal(res.status, 403);
            assert.equal(await t.User.countDocuments({ email: 'emp-made-admin@t.test' }), 0);
        });

        it('an admin token can create an admin (201)', async () => {
            const admin = await t.User.findOne({ email: 'admin@t.test' });
            const res = await t.request
                .post('/user/create')
                .set(bearer(signToken(t, admin)))
                .send(newUser('second-admin@t.test', { type: 'admin' }));
            assert.equal(res.status, 201);
            assert.equal((await t.User.findOne({ email: 'second-admin@t.test' })).type, 'admin');
        });

        it('a token for an admin who was deleted cannot create an admin (403)', async () => {
            const doomed = await makeUser(t, { email: 'doomed@t.test', type: 'admin' });
            const token = signToken(t, doomed);
            await t.User.deleteOne({ _id: doomed._id });

            const res = await t.request
                .post('/user/create')
                .set(bearer(token))
                .send(newUser('by-ghost@t.test', { type: 'admin' }));
            assert.equal(res.status, 403);
            assert.equal(await t.User.countDocuments({ email: 'by-ghost@t.test' }), 0);
        });

        it('a demoted admin token cannot create an admin (403)', async () => {
            const demoted = await makeUser(t, { email: 'demoted@t.test', type: 'admin' });
            const token = signToken(t, demoted);
            await t.User.updateOne({ _id: demoted._id }, { $set: { type: 'employee' } });

            const res = await t.request
                .post('/user/create')
                .set(bearer(token))
                .send(newUser('by-demoted@t.test', { type: 'admin' }));
            assert.equal(res.status, 403);
        });
    });

    describe('admin user management', () => {
        it('PUT /user/edit and DELETE /user/delete work for an admin and never return a password', async () => {
            const admin = await t.User.findOne({ email: 'admin@t.test' });
            const token = signToken(t, admin);
            await t.request.post('/user/register').send(newUser('editme@t.test'));

            const edit = await t.request.put('/user/edit').set(bearer(token)).send({ email: 'editme@t.test', fullName: 'Edited Name' });
            assert.equal(edit.status, 200);
            assert.equal(leaksSecrets(edit), false);
            assert.equal((await t.User.findOne({ email: 'editme@t.test' })).fullName, 'Edited Name');

            const del = await t.request.delete('/user/delete').set(bearer(token)).send({ email: 'editme@t.test' });
            assert.equal(del.status, 200);
            assert.equal(leaksSecrets(del), false);
            assert.equal(await t.User.countDocuments({ email: 'editme@t.test' }), 0);

            const missing = await t.request.delete('/user/delete').set(bearer(token)).send({ email: 'editme@t.test' });
            assert.equal(missing.status, 404);
        });

        it('GET /user/users never returns a password or hash', async () => {
            const admin = await t.User.findOne({ email: 'admin@t.test' });
            const res = await t.request.get('/user/users').set(bearer(signToken(t, admin)));
            assert.equal(res.status, 200);
            assert.equal(leaksSecrets(res), false);
        });
    });
});
