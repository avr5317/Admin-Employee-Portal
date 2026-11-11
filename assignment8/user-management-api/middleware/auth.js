// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_ALGORITHM } = require('../config/jwt');

// Verifies the Bearer token AND loads the user from the database.
// Returns { user } on success or { status, error } on failure.
// The role always comes from the database, never from the token, so a demoted
// or deleted user loses access immediately.
async function authenticate(req) {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
        return { status: 401, error: 'Authentication required. Provide a Bearer token.' };
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    } catch (error) {
        return { status: 401, error: 'Invalid or expired token.' };
    }

    let user;
    try {
        user = await User.findById(payload.id).select('email type').lean();
    } catch (error) {
        if (error.name === 'CastError') {
            return { status: 401, error: 'Invalid or expired token.' };
        }
        console.error('Auth lookup error:', error.message);
        return { status: 500, error: 'Could not verify your account. Please try again.' };
    }

    if (!user) {
        return { status: 401, error: 'This account no longer exists.' };
    }

    return { user: { id: user._id, email: user.email, type: user.type } };
}

// Requires "Authorization: Bearer <token>" for a user that still exists.
// Attaches { id, email, type } (type from the database) to req.user.
const requireAuth = async (req, res, next) => {
    const result = await authenticate(req);
    if (result.error) {
        return res.status(result.status).json({ error: result.error });
    }
    req.user = result.user;
    next();
};

// requireAuth plus type === 'admin' (checked against the database)
const requireAdmin = [
    requireAuth,
    (req, res, next) => {
        if (req.user.type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    }
];

// Guard for POST /user/create: an 'admin' account can only be created by a caller
// whose Bearer token belongs to an admin (checked in the database). There is no
// "first admin" exception: anonymous callers can never create an admin.
// The first admin is created with the seed script (npm run seed).
// Any failure => 403. Other account types stay public.
const guardAdminCreation = async (req, res, next) => {
    if (!req.body || req.body.type !== 'admin') {
        return next();
    }

    const result = await authenticate(req);
    if (result.user && result.user.type === 'admin') {
        return next();
    }

    return res.status(403).json({
        error: 'Only an admin can create admin accounts.'
    });
};

module.exports = { requireAuth, requireAdmin, guardAdminCreation };
