'use strict';
// Shared test helpers (not a test file: `npm test` only runs test/*.test.js).
//
// Safety rules enforced here:
// - The tests set their own throwaway JWT_SECRET and never load dotenv / read .env.
// - The tests only ever talk to a temporary in-memory MongoDB (mongodb-memory-server).
// - If MONGODB_URI is set in the environment at all, the tests refuse to run.
// - Uploaded files go to a temporary folder, never to the project's uploads/ folder.

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PASSWORD = 'Passw0rd!';

// The in-memory server listens on 127.0.0.1 with a random port. Real MongoDB's default
// port (27017) and any other host are never accepted.
function assertInMemoryUri(uri) {
    const match = /^mongodb:\/\/127\.0\.0\.1:(\d+)\/[A-Za-z0-9_-]*$/.exec(uri || '');
    if (!match || match[1] === '27017') {
        throw new Error('Refusing to run: the database is not the temporary in-memory MongoDB.');
    }
}

function assertNoExternalDatabaseConfigured() {
    if (process.env.MONGODB_URI) {
        throw new Error(
            'Refusing to run the tests: MONGODB_URI is set in the environment. ' +
            'The tests only use a temporary in-memory MongoDB. Unset MONGODB_URI and try again.'
        );
    }
}

// Call once per test file, from before().
async function startTestEnv() {
    assertNoExternalDatabaseConfigured();

    // Throwaway settings, set BEFORE the app is loaded
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    delete process.env.CLIENT_ORIGIN;
    const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'api-test-uploads-'));
    process.env.UPLOAD_DIR = uploadDir;

    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('apitest');
    assertInMemoryUri(uri);

    const mongoose = require('mongoose');
    await mongoose.connect(uri);

    const app = require('../app');
    const request = require('supertest')(app);
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const Job = require('../models/Job');

    return {
        app,
        request,
        jwt,
        User,
        Job,
        uploadDir,
        async stop() {
            await mongoose.disconnect();
            await mongod.stop();
            fs.rmSync(uploadDir, { recursive: true, force: true });
        },
    };
}

let hashPromise;
// bcrypt with a low cost keeps the tests fast; compare() works with any cost.
const passwordHash = () => {
    hashPromise = hashPromise || require('bcrypt').hash(PASSWORD, 4);
    return hashPromise;
};

// Inserts a user directly into the database.
async function makeUser(t, { email, type = 'employee', fullName = 'Test Person' }) {
    return t.User.create({ fullName, email, type, password: await passwordHash() });
}

// Signs a token the same way the app does (HS256), for a user document.
function signToken(t, user, options = {}) {
    return t.jwt.sign(
        { id: String(user._id), email: user.email, type: user.type },
        options.secret || process.env.JWT_SECRET,
        { algorithm: options.algorithm || 'HS256', expiresIn: options.expiresIn ?? '1h' }
    );
}

async function login(t, email) {
    const res = await t.request.post('/user/login').send({ email, password: PASSWORD });
    return res.body.token;
}

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// True if the response contains a password field or a bcrypt hash anywhere.
function leaksSecrets(res) {
    const text = JSON.stringify(res.body) + (res.text || '');
    return /"password"\s*:/.test(text) || /\$2[aby]\$\d\d\$/.test(text);
}

// A real, minimal PNG
function pngBuffer() {
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
    );
}

const listFiles = (dir) => fs.readdirSync(dir).sort();

module.exports = {
    PASSWORD,
    assertInMemoryUri,
    assertNoExternalDatabaseConfigured,
    startTestEnv,
    makeUser,
    signToken,
    login,
    bearer,
    leaksSecrets,
    pngBuffer,
    listFiles,
};
