// config/jwt.js
// Central JWT settings so signing and verifying always agree.

const JWT_ALGORITHM = 'HS256';
const JWT_MIN_SECRET_LENGTH = 32;

// Must match the JWT_SECRET placeholder in .env.example
const JWT_SECRET_PLACEHOLDER = 'replace-with-a-long-random-string';

// Returns a problem description, or null if the secret is acceptable.
// It never includes the secret itself.
function getJwtSecretProblem(secret) {
    if (!secret) {
        return 'JWT_SECRET is not set.';
    }
    if (secret === JWT_SECRET_PLACEHOLDER) {
        return 'JWT_SECRET is still the placeholder from .env.example.';
    }
    if (secret.length < JWT_MIN_SECRET_LENGTH) {
        return `JWT_SECRET is too short (minimum ${JWT_MIN_SECRET_LENGTH} characters).`;
    }
    return null;
}

// Call once at startup. Exits with code 1 on a missing, short or placeholder secret.
function assertJwtSecret() {
    const problem = getJwtSecretProblem(process.env.JWT_SECRET);
    if (problem) {
        console.error(`❌ ${problem}`);
        console.error('   Set a strong JWT_SECRET in .env. Generate one with: openssl rand -hex 32');
        process.exit(1);
    }
}

module.exports = { JWT_ALGORITHM, JWT_MIN_SECRET_LENGTH, JWT_SECRET_PLACEHOLDER, getJwtSecretProblem, assertJwtSecret };
