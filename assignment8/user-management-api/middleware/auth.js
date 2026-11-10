// middleware/auth.js
const jwt = require('jsonwebtoken');

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

module.exports = { requireAuth, requireAdmin };
