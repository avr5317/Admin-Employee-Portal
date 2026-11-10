// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Requires "Authorization: Bearer <token>"; attaches the decoded payload to req.user
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// requireAuth plus type === 'admin'
const requireAdmin = [
    requireAuth,
    (req, res, next) => {
        if (req.user.type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    }
];

// Guard for POST /user/create: creating an 'admin' account needs a valid admin
// Bearer token, except the very first admin (when no admin exists yet).
// Missing/invalid/non-admin token => 403. Other account types stay public.
const guardAdminCreation = async (req, res, next) => {
    try {
        if (!req.body || req.body.type !== 'admin') {
            return next();
        }

        const adminExists = await User.exists({ type: 'admin' });
        if (!adminExists) {
            return next(); // bootstrap: first admin
        }

        const [scheme, token] = (req.headers.authorization || '').split(' ');
        if (scheme === 'Bearer' && token) {
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                if (payload.type === 'admin') {
                    return next();
                }
            } catch (error) {
                // fall through to 403
            }
        }

        return res.status(403).json({
            error: 'Only an admin can create admin accounts.'
        });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
};

module.exports = { requireAuth, requireAdmin, guardAdminCreation };
