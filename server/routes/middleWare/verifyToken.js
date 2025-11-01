// server/routes/middleware/verifyToken.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
        console.log('🔐 Incoming Auth Header:', authHeader);

        // Try to extract token:
        // 1) Authorization: "Bearer <token>"
        // 2) Authorization: "<token>" (raw)
        // 3) x-access-token or token header
        let token = null;

        if (authHeader && typeof authHeader === 'string') {
            const parts = authHeader.split(' ').filter(Boolean);
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                token = parts[1];
            } else if (parts.length === 1 && parts[0].length > 10) {
                // sometimes frontend might send raw token string as Authorization
                token = parts[0];
            }
        }

        token = token || req.headers['x-access-token'] || req.headers['token'] || req.query.token || null;

        if (!token) {
            console.warn('❌ Token format invalid or missing');
            return res.status(401).json({ message: 'Unauthorized: Token missing or invalid format' });
        }

        const secret = process.env.JWT_SECRET || 'secretkey';
        const decoded = jwt.verify(token, secret);

        const userId = decoded.id || decoded.userId || decoded._id;
        req.user = { id: userId, raw: decoded };
        req.userId = userId;

        console.log('✅ verifyToken succeeded for userId:', userId);
        next();
    } catch (err) {
        console.error('verifyToken error:', err && err.message ? err.message : err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
