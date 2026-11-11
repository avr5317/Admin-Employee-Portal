'use strict';
// Tests of the safety rules themselves. These do not start a database.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { assertInMemoryUri } = require('./helpers');
const { getJwtSecretProblem, JWT_SECRET_PLACEHOLDER } = require('../config/jwt');

const ROOT = path.join(__dirname, '..');
const PLACEHOLDER = 'replace-with-a-long-random-string';

// Runs a script in a child process with a minimal, explicit environment.
// cwd is an EMPTY temporary folder so dotenv (if a script loads it) can never find the
// project's .env, which these tests must never read.
function runInEmptyFolder(args, env) {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'api-test-cwd-'));
    try {
        return spawnSync(process.execPath, args, {
            cwd,
            env: { PATH: process.env.PATH, ...env },
            encoding: 'utf8',
            timeout: 20000,
        });
    } finally {
        fs.rmSync(cwd, { recursive: true, force: true });
    }
}

describe('JWT_SECRET startup check', () => {
    // MONGODB_URI points at a closed local port: the check must exit before any connection.
    const baseEnv = { MONGODB_URI: 'mongodb://127.0.0.1:1/never-used', PORT: '0' };

    it('the placeholder in the code matches .env.example', () => {
        const example = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
        assert.match(example, new RegExp(`^JWT_SECRET=${JWT_SECRET_PLACEHOLDER}$`, 'm'));
        assert.equal(JWT_SECRET_PLACEHOLDER, PLACEHOLDER);
    });

    it('server.js exits with code 1 when JWT_SECRET is missing', () => {
        const res = runInEmptyFolder([path.join(ROOT, 'server.js')], baseEnv);
        assert.equal(res.status, 1);
        assert.match(res.stderr, /JWT_SECRET is not set/);
    });

    it('server.js exits with code 1 for a 10-character secret and does not print it', () => {
        const secret = 'abcde12345';
        const res = runInEmptyFolder([path.join(ROOT, 'server.js')], { ...baseEnv, JWT_SECRET: secret });
        assert.equal(res.status, 1);
        assert.match(res.stderr, /too short/);
        assert.ok(!res.stderr.includes(secret) && !res.stdout.includes(secret));
    });

    it('server.js exits with code 1 for the .env.example placeholder and does not print it', () => {
        const res = runInEmptyFolder([path.join(ROOT, 'server.js')], { ...baseEnv, JWT_SECRET: PLACEHOLDER });
        assert.equal(res.status, 1);
        assert.match(res.stderr, /placeholder/);
        assert.ok(!res.stderr.includes(PLACEHOLDER) && !res.stdout.includes(PLACEHOLDER));
    });

    it('accepts a strong secret (32+ characters)', () => {
        assert.equal(getJwtSecretProblem('a'.repeat(32)), null);
        assert.equal(getJwtSecretProblem('a'.repeat(31)) !== null, true);
        assert.equal(getJwtSecretProblem('') !== null, true);
        assert.equal(getJwtSecretProblem(undefined) !== null, true);
    });
});

describe('the tests refuse unsafe databases', () => {
    it('only accepts a 127.0.0.1 in-memory URI on a non-default port', () => {
        assert.doesNotThrow(() => assertInMemoryUri('mongodb://127.0.0.1:41234/apitest'));

        const unsafe = [
            'mongodb://localhost:27017/jobportal',
            'mongodb://127.0.0.1:27017/jobportal',
            'mongodb://localhost:41234/apitest',
            'mongodb://db.example.com:41234/apitest',
            'mongodb+srv://user:pw@cluster0.example.mongodb.net/db',
            'mongodb://user:pw@127.0.0.1:41234/apitest',
            'mongodb://127.0.0.1:41234,db.example.com:27017/apitest',
            '',
            undefined,
        ];
        for (const uri of unsafe) {
            assert.throws(() => assertInMemoryUri(uri), /Refusing to run/, String(uri));
        }
    });

    for (const uri of ['mongodb://localhost:27017/jobportal', 'mongodb://example.test:27017/x', 'mongodb://127.0.0.1:41234/apitest']) {
        it(`startTestEnv() refuses to run when MONGODB_URI is set (${new URL(uri.replace('mongodb://', 'http://')).hostname})`, () => {
            const script = `
                require('./test/helpers').startTestEnv()
                    .then(() => { console.log('STARTED'); process.exit(0); })
                    .catch((e) => { console.error(e.message); process.exit(1); });
            `;
            const res = spawnSync(process.execPath, ['-e', script], {
                cwd: ROOT,
                env: { PATH: process.env.PATH, MONGODB_URI: uri },
                encoding: 'utf8',
                timeout: 20000,
            });
            assert.equal(res.status, 1);
            assert.match(res.stderr, /Refusing to run the tests: MONGODB_URI is set/);
            assert.ok(!res.stdout.includes('STARTED'));
            assert.ok(!res.stderr.includes(uri), 'the URI must not be printed');
        });
    }
});

describe('the app never reads .env', () => {
    it('loading app.js does not load dotenv', () => {
        const script = `
            process.env.JWT_SECRET = 'x'.repeat(40);
            require('./app');
            const loaded = Object.keys(require.cache).some((file) => /[\\\\/]node_modules[\\\\/]dotenv[\\\\/]/.test(file));
            console.log(loaded ? 'DOTENV_LOADED' : 'NO_DOTENV');
        `;
        const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'api-test-uploads-'));
        try {
            const res = spawnSync(process.execPath, ['-e', script], {
                cwd: ROOT,
                env: { PATH: process.env.PATH, UPLOAD_DIR: uploadDir },
                encoding: 'utf8',
                timeout: 20000,
            });
            assert.equal(res.status, 0, res.stderr);
            assert.equal(res.stdout.trim(), 'NO_DOTENV');
        } finally {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        }
    });

    it('only server.js and scripts/seed.js require dotenv', () => {
        const found = [];
        const requiresDotenv = /require\(\s*['"]dotenv(\/[^'"]*)?['"]\s*\)|from\s+['"]dotenv/;
        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                if (entry.name === 'node_modules' || entry.name === 'uploads') continue;
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (entry.name.endsWith('.js') && !full.includes(`${path.sep}test${path.sep}`)) {
                    if (requiresDotenv.test(fs.readFileSync(full, 'utf8'))) found.push(path.relative(ROOT, full));
                }
            }
        };
        walk(ROOT);
        assert.deepEqual(found.sort(), [path.join('scripts', 'seed.js'), 'server.js']);
    });
});
