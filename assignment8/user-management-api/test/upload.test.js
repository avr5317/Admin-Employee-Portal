'use strict';
const { describe, it, before, after, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { startTestEnv, makeUser, signToken, bearer, leaksSecrets, pngBuffer, listFiles } = require('./helpers');

const UUID_PNG = /^\/images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/;

describe('POST /user/uploadImage', () => {
    let t;
    let admin;
    let employee;
    let other;
    let adminToken;
    let employeeToken;

    const upload = (token, fileBuffer, { filename = 'photo.png', contentType = 'image/png', fields = {} } = {}) => {
        let req = t.request.post('/user/uploadImage');
        if (token) req = req.set(bearer(token));
        for (const [key, value] of Object.entries(fields)) req = req.field(key, value);
        if (fileBuffer) req = req.attach('image', fileBuffer, { filename, contentType });
        return req;
    };
    const reload = (user) => t.User.findById(user._id);
    const clearUploads = () => {
        for (const file of fs.readdirSync(t.uploadDir)) fs.rmSync(path.join(t.uploadDir, file));
    };

    before(async () => {
        t = await startTestEnv();
        // Uploads must go to a temporary folder, never the project's uploads/ folder
        assert.ok(t.uploadDir.startsWith(os.tmpdir()), 'upload folder must be temporary');
        admin = await makeUser(t, { email: 'admin@t.test', type: 'admin' });
        employee = await makeUser(t, { email: 'employee@t.test' });
        other = await makeUser(t, { email: 'other@t.test' });
        adminToken = signToken(t, admin);
        employeeToken = signToken(t, employee);
    });
    afterEach(async () => {
        mock.restoreAll();
        clearUploads();
        await t.User.updateMany({}, { $set: { imagePath: null } });
    });
    after(() => t.stop());

    describe('ownership', () => {
        it('an employee uploads for THEMSELVES with a server-generated name (201)', async () => {
            const res = await upload(employeeToken, pngBuffer());
            assert.equal(res.status, 201);
            assert.match(res.body.filePath, UUID_PNG);
            assert.equal(leaksSecrets(res), false);

            const files = listFiles(t.uploadDir);
            assert.equal(files.length, 1);
            assert.equal(`/images/${files[0]}`, res.body.filePath);
            assert.ok(!files[0].includes('employee'), 'the email must not be part of the file name');
            assert.equal((await reload(employee)).imagePath, res.body.filePath);
        });

        it('an employee who sends ANOTHER user\'s email gets their own image set; the email is ignored', async () => {
            const res = await upload(employeeToken, pngBuffer(), { fields: { email: other.email } });
            assert.equal(res.status, 201);
            assert.equal((await reload(employee)).imagePath, res.body.filePath);
            assert.equal((await reload(other)).imagePath, null);
        });

        it('an admin can set an image for ANY existing user by email', async () => {
            const res = await upload(adminToken, pngBuffer(), { fields: { email: other.email } });
            assert.equal(res.status, 201);
            assert.equal((await reload(other)).imagePath, res.body.filePath);
            assert.equal((await reload(admin)).imagePath, null);
        });

        it('an admin email is matched ignoring case and spaces', async () => {
            const res = await upload(adminToken, pngBuffer(), { fields: { email: `  ${other.email.toUpperCase()} ` } });
            assert.equal(res.status, 201);
            assert.equal((await reload(other)).imagePath, res.body.filePath);
        });

        it('an admin without an email uploads for their own account', async () => {
            const res = await upload(adminToken, pngBuffer());
            assert.equal(res.status, 201);
            assert.equal((await reload(admin)).imagePath, res.body.filePath);
        });

        it('an admin naming an unknown user gets 404 and no file is written', async () => {
            const res = await upload(adminToken, pngBuffer(), { fields: { email: 'nobody@t.test' } });
            assert.equal(res.status, 404);
            assert.deepEqual(listFiles(t.uploadDir), []);
        });

        it('requires a login (401) and writes nothing', async () => {
            const res = await upload(null, pngBuffer());
            assert.equal(res.status, 401);
            assert.deepEqual(listFiles(t.uploadDir), []);
        });

        it('a token for a deleted user is rejected (401) and writes nothing', async () => {
            const ghost = await makeUser(t, { email: 'ghost@t.test' });
            const token = signToken(t, ghost);
            await t.User.deleteOne({ _id: ghost._id });
            const res = await upload(token, pngBuffer());
            assert.equal(res.status, 401);
            assert.deepEqual(listFiles(t.uploadDir), []);
        });
    });

    describe('replacing an image', () => {
        it('the owner can replace their image and the old file is deleted', async () => {
            const first = await upload(employeeToken, pngBuffer());
            assert.equal(first.status, 201);
            const second = await upload(employeeToken, pngBuffer());
            assert.equal(second.status, 200);
            assert.notEqual(second.body.filePath, first.body.filePath);

            const files = listFiles(t.uploadDir);
            assert.deepEqual(files, [path.basename(second.body.filePath)]);
            assert.equal((await reload(employee)).imagePath, second.body.filePath);
        });
    });

    describe('file validation', () => {
        const rejected = [
            ['an HTML file labelled image/png', Buffer.from('<html><script>alert(1)</script></html>'), 'x.png', 'image/png'],
            ['an HTML file with an .html name', Buffer.from('<html></html>'), 'x.html', 'text/html'],
            ['an SVG labelled image/svg+xml', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>'), 'x.svg', 'image/svg+xml'],
            ['an SVG labelled image/png', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'x.png', 'image/png'],
            ['plain text labelled image/jpeg', Buffer.from('hello world'), 'x.jpg', 'image/jpeg'],
            ['an empty file', Buffer.alloc(0), 'x.png', 'image/png'],
        ];

        for (const [label, buffer, filename, contentType] of rejected) {
            it(`rejects ${label} with 400 and leaves no file`, async () => {
                const res = await upload(employeeToken, buffer, { filename, contentType });
                assert.equal(res.status, 400);
                assert.match(res.body.error, /Only PNG, JPEG, GIF and WebP/);
                assert.deepEqual(listFiles(t.uploadDir), []);
                assert.equal((await reload(employee)).imagePath, null);
            });
        }

        it('accepts JPEG, GIF and WebP by their real signature and stores the matching extension', async () => {
            const samples = [
                ['jpg', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0xff, 0xd9])],
                ['gif', Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff;', 'binary')],
                ['webp', Buffer.concat([Buffer.from('RIFF'), Buffer.from([20, 0, 0, 0]), Buffer.from('WEBPVP8 '), Buffer.alloc(12)])],
            ];
            for (const [ext, buffer] of samples) {
                const res = await upload(employeeToken, buffer, { filename: `whatever.bin`, contentType: 'application/octet-stream' });
                assert.ok([200, 201].includes(res.status), `${ext}: status ${res.status}`);
                assert.ok(res.body.filePath.endsWith(`.${ext}`), `${ext}: ${res.body.filePath}`);
            }
        });

        it('returns 400 when no file is sent', async () => {
            const res = await upload(employeeToken, null);
            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'No image file provided.');
        });

        it('rejects a file over 5 MB (413) and leaves no file', async () => {
            const big = Buffer.concat([pngBuffer(), Buffer.alloc(5 * 1024 * 1024 + 1024)]);
            const res = await upload(employeeToken, big);
            assert.equal(res.status, 413);
            assert.match(res.body.error, /5MB/);
            assert.deepEqual(listFiles(t.uploadDir), []);
        });

        it('accepts a file just under the limit', async () => {
            const nearLimit = Buffer.concat([pngBuffer(), Buffer.alloc(4 * 1024 * 1024)]);
            const res = await upload(employeeToken, nearLimit);
            assert.equal(res.status, 201);
        });
    });

    describe('file names and paths', () => {
        it('ignores a path-traversal email and client file name: nothing is written outside the upload folder', async () => {
            const evilNameInTmp = path.join(os.tmpdir(), 'evil.png');
            fs.rmSync(evilNameInTmp, { force: true });

            const asEmployee = await upload(employeeToken, pngBuffer(), {
                filename: '../../evil.png',
                fields: { email: '../../x' },
            });
            assert.equal(asEmployee.status, 201);
            assert.match(asEmployee.body.filePath, UUID_PNG);

            const asAdmin = await upload(adminToken, pngBuffer(), {
                filename: '../../evil.png',
                fields: { email: '../../x' },
            });
            assert.equal(asAdmin.status, 404);

            // only the one uuid-named file exists, and nothing escaped to the parent folders
            assert.deepEqual(listFiles(t.uploadDir), [path.basename(asEmployee.body.filePath)]);
            assert.equal(fs.existsSync(evilNameInTmp), false);
            assert.equal(fs.existsSync(path.join(t.uploadDir, '..', 'x')), false);
        });
    });

    describe('serving images', () => {
        it('serves an uploaded image as image/png with X-Content-Type-Options: nosniff', async () => {
            const up = await upload(employeeToken, pngBuffer());
            const res = await t.request.get(up.body.filePath);
            assert.equal(res.status, 200);
            assert.equal(res.headers['content-type'], 'image/png');
            assert.equal(res.headers['x-content-type-options'], 'nosniff');
        });
    });

    describe('failures', () => {
        it('a database failure AFTER the file was written deletes the file (500)', async () => {
            mock.method(t.User, 'updateOne', async () => {
                throw new Error('simulated database failure');
            });
            const res = await upload(employeeToken, pngBuffer());
            assert.equal(res.status, 500);
            assert.equal(res.body.error, 'An error occurred while uploading the image.');
            assert.deepEqual(listFiles(t.uploadDir), []);
        });
    });
});
