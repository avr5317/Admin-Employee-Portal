'use strict';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { startTestEnv, makeUser, signToken, bearer } = require('./helpers');

describe('jobs', () => {
    let t;
    let adminToken;
    let employeeToken;
    const job = { companyName: 'Acme Co', jobTitle: 'Engineer', description: 'Build things.', salary: 90000 };

    before(async () => {
        t = await startTestEnv();
        const admin = await makeUser(t, { email: 'admin@t.test', type: 'admin' });
        const employee = await makeUser(t, { email: 'employee@t.test' });
        adminToken = signToken(t, admin);
        employeeToken = signToken(t, employee);
    });
    after(() => t.stop());

    it('an admin creates a job (201) and it appears in GET /api/jobs', async () => {
        const created = await t.request.post('/api/create/job').set(bearer(adminToken)).send(job);
        assert.equal(created.status, 201);
        assert.equal(created.body.job.jobTitle, 'Engineer');
        assert.equal(created.body.job.salary, 90000);

        const list = await t.request.get('/api/jobs').set(bearer(employeeToken));
        assert.equal(list.status, 200);
        assert.ok(list.body.jobs.some((j) => j._id === created.body.job._id));
    });

    it('creating a job with a missing field is 400', async () => {
        const res = await t.request
            .post('/api/create/job')
            .set(bearer(adminToken))
            .send({ companyName: 'Acme Co', jobTitle: 'No salary', description: 'x' });
        assert.equal(res.status, 400);
        assert.equal(await t.Job.countDocuments({ jobTitle: 'No salary' }), 0);
    });

    it('an employee cannot create a job (403) and nothing is saved', async () => {
        const res = await t.request
            .post('/api/create/job')
            .set(bearer(employeeToken))
            .send({ ...job, jobTitle: 'Sneaky' });
        assert.equal(res.status, 403);
        assert.equal(await t.Job.countDocuments({ jobTitle: 'Sneaky' }), 0);
    });

    it('an admin deletes a job (200); deleting it again is 404', async () => {
        const created = await t.request.post('/api/create/job').set(bearer(adminToken)).send({ ...job, jobTitle: 'Temp' });
        const id = created.body.job._id;

        const first = await t.request.delete(`/api/delete/job/${id}`).set(bearer(adminToken));
        assert.equal(first.status, 200);
        assert.equal(await t.Job.countDocuments({ _id: id }), 0);

        const second = await t.request.delete(`/api/delete/job/${id}`).set(bearer(adminToken));
        assert.equal(second.status, 404);
    });

    it('an employee cannot delete a job (403) and the job stays', async () => {
        const created = await t.request.post('/api/create/job').set(bearer(adminToken)).send({ ...job, jobTitle: 'Keep me' });
        const id = created.body.job._id;

        const res = await t.request.delete(`/api/delete/job/${id}`).set(bearer(employeeToken));
        assert.equal(res.status, 403);
        assert.equal(await t.Job.countDocuments({ _id: id }), 1);
    });

    it('a malformed job id is 400', async () => {
        for (const bad of ['not-an-id', '123', '%7B%24ne%7D']) {
            const res = await t.request.delete(`/api/delete/job/${bad}`).set(bearer(adminToken));
            assert.equal(res.status, 400, `id "${bad}"`);
            assert.equal(res.body.error, 'Invalid job ID.');
        }
    });

    it('a well-formed id that does not exist is 404', async () => {
        const res = await t.request
            .delete(`/api/delete/job/${new mongoose.Types.ObjectId()}`)
            .set(bearer(adminToken));
        assert.equal(res.status, 404);
    });

    it('GET /api/jobs without a token is 401', async () => {
        assert.equal((await t.request.get('/api/jobs')).status, 401);
    });
});
