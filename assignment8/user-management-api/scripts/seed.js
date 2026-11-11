// scripts/seed.js
// Local development sample data. Safe to run repeatedly (idempotent).
// REFUSES to run unless MONGODB_URI points at localhost or 127.0.0.1.
//
// Usage: npm run seed
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Job = require('../models/Job');

const SAMPLE_PASSWORD = 'Passw0rd!';
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const IMAGE_DIR = path.join(__dirname, '..', 'uploads', 'images');

// ---------- safety check ----------
// Returns the list of hosts in a mongodb:// URI, or null if the URI is not understood.
// mongodb+srv:// is always a remote (DNS-seedlist) deployment, so it is never accepted.
function getHosts(uri) {
    const match = /^mongodb:\/\/([^/?]+)/.exec(uri || '');
    if (!match) return null;
    const authority = match[1].slice(match[1].lastIndexOf('@') + 1); // drop credentials
    return authority.split(',').map((hostPort) => hostPort.replace(/:\d*$/, '').toLowerCase());
}

function assertLocalDatabase(uri) {
    const hosts = getHosts(uri);
    if (!uri) {
        console.error('❌ MONGODB_URI is not set. Set it in .env to a local database. Nothing was changed.');
        process.exit(1);
    }
    if (!hosts || !hosts.every((h) => LOCAL_HOSTS.includes(h))) {
        console.error('❌ Refusing to seed: MONGODB_URI must point at localhost or 127.0.0.1.');
        console.error(`   Host(s) found: ${hosts ? hosts.join(', ') : '(unrecognized URI format)'}`);
        console.error('   This script is for local development only. Nothing was changed.');
        process.exit(1);
    }
}

// ---------- data ----------
// Partner companies are User records WITH an imagePath: the Companies page lists
// users that have an image (name = fullName, description = email, image = /images/<file>).
const COMPANIES = [
    { fullName: 'Northwind Analytics', email: 'hello@northwind-analytics.portal.test', color: '#1565c0' },
    { fullName: 'Bluepeak Logistics', email: 'hello@bluepeak-logistics.portal.test', color: '#00838f' },
    { fullName: 'Cedarwood Health', email: 'hello@cedarwood-health.portal.test', color: '#2e7d32' },
    { fullName: 'Lumen Robotics', email: 'hello@lumen-robotics.portal.test', color: '#6a1b9a' },
    { fullName: 'Harborview Finance', email: 'hello@harborview-finance.portal.test', color: '#ef6c00' },
    { fullName: 'Summit Ridge Energy', email: 'hello@summit-ridge-energy.portal.test', color: '#c62828' }
];

const JOBS = [
    ['Northwind Analytics', 'Data Analyst', 'Turn raw customer data into dashboards and weekly insights for product teams. Strong SQL and a good eye for visualization required.', 82000],
    ['Northwind Analytics', 'Machine Learning Engineer', 'Build and deploy forecasting models that power our retail analytics platform. Experience with Python and model monitoring preferred.', 135000],
    ['Bluepeak Logistics', 'Operations Coordinator', 'Coordinate daily shipments between warehouses and carriers, resolve delays, and keep delivery records accurate.', 56000],
    ['Bluepeak Logistics', 'Fleet Software Developer', 'Develop route-planning tools used by our dispatch team. You will work on a Node.js and React stack with a small, friendly team.', 112000],
    ['Cedarwood Health', 'Registered Nurse', 'Provide patient care in our outpatient clinic, working with physicians to deliver compassionate, high-quality treatment.', 78000],
    ['Cedarwood Health', 'Healthcare Data Engineer', 'Maintain secure data pipelines that connect clinic systems to reporting tools while following healthcare privacy standards.', 124000],
    ['Lumen Robotics', 'Robotics Software Engineer', 'Write real-time control software for warehouse robots in C++ and Python, from simulation through to hardware testing.', 138000],
    ['Lumen Robotics', 'QA Test Engineer', 'Design and run test plans for robot firmware and fleet management software, and automate regression tests.', 89000],
    ['Harborview Finance', 'Financial Analyst', 'Prepare monthly forecasts and variance reports for senior leadership. Strong spreadsheet skills and attention to detail needed.', 74000],
    ['Harborview Finance', 'Frontend Developer', 'Build accessible, responsive interfaces for our customer banking portal using React and a shared component library.', 105000],
    ['Summit Ridge Energy', 'Solar Project Manager', 'Plan and deliver commercial solar installations on time and on budget, coordinating engineers, suppliers and local permits.', 98000],
    ['Summit Ridge Energy', 'Customer Support Specialist', 'Help customers understand their energy usage and billing, and escalate technical issues to the field team.', 52000]
];

// ---------- helpers ----------
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function initials(name) {
    return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// Small generated placeholder (initials on a colored background). Nothing is downloaded.
function writePlaceholderImage(company) {
    const fileName = `${slugify(company.fullName)}-seed.svg`;
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">` +
        `<rect width="400" height="200" fill="${company.color}"/>` +
        `<text x="200" y="118" font-family="Arial, Helvetica, sans-serif" font-size="72" ` +
        `font-weight="bold" fill="#ffffff" text-anchor="middle">${initials(company.fullName)}</text>` +
        `</svg>\n`;
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    fs.writeFileSync(path.join(IMAGE_DIR, fileName), svg);
    return `/images/${fileName}`;
}

async function main() {
    const uri = process.env.MONGODB_URI;
    assertLocalDatabase(uri);

    await mongoose.connect(uri);
    console.log(`✅ Connected to local MongoDB (${getHosts(uri).join(', ')})`);

    const summary = { users: { created: 0, updated: 0 }, companies: { created: 0, existing: 0 }, jobs: { created: 0, existing: 0 } };

    // Sample logins: password is (re)set on every run so the printed logins always work.
    const sampleHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);
    const sampleUsers = [
        { fullName: 'Sample Admin', email: 'admin@portal.test', type: 'admin' },
        { fullName: 'Sample Employee', email: 'employee@portal.test', type: 'employee' }
    ];
    for (const u of sampleUsers) {
        const res = await User.updateOne(
            { email: u.email },
            { $set: { fullName: u.fullName, type: u.type, password: sampleHash } },
            { upsert: true }
        );
        res.upsertedCount ? summary.users.created++ : summary.users.updated++;
    }

    // Partner companies: users with an image. Their password is random and never printed,
    // so these accounts cannot be logged into. Existing records are left unchanged.
    for (const c of COMPANIES) {
        const imagePath = writePlaceholderImage(c);
        const randomHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
        const res = await User.updateOne(
            { email: c.email },
            { $setOnInsert: { fullName: c.fullName, type: 'employee', password: randomHash, imagePath } },
            { upsert: true }
        );
        res.upsertedCount ? summary.companies.created++ : summary.companies.existing++;
    }

    // Jobs: upsert by companyName + jobTitle. Existing jobs are left unchanged.
    const now = Date.now();
    for (let i = 0; i < JOBS.length; i++) {
        const [companyName, jobTitle, description, salary] = JOBS[i];
        const res = await Job.updateOne(
            { companyName, jobTitle },
            { $setOnInsert: { description, salary, createdAt: new Date(now - i * 60 * 1000) } },
            { upsert: true }
        );
        res.upsertedCount ? summary.jobs.created++ : summary.jobs.existing++;
    }

    console.log('\nSeed summary');
    console.log(`  Sample users:       ${summary.users.created} created, ${summary.users.updated} already existed (password reset)`);
    console.log(`  Partner companies:  ${summary.companies.created} created, ${summary.companies.existing} already existed`);
    console.log(`  Jobs:               ${summary.jobs.created} created, ${summary.jobs.existing} already existed`);
    console.log(`  Placeholder images: written to uploads/images (${COMPANIES.length} files)`);
    console.log('\nSample logins (local development only)');
    console.log(`  Admin:    admin@portal.test     / ${SAMPLE_PASSWORD}`);
    console.log(`  Employee: employee@portal.test  / ${SAMPLE_PASSWORD}`);

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error('❌ Seed failed:', err.message);
    try { await mongoose.disconnect(); } catch (e) { /* ignore */ }
    process.exit(1);
});
