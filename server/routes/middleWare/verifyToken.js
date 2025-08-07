const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log("🔐 Incoming Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ Token format invalid or missing");
        return res.status(401).json({ message: 'Access denied: Invalid token format' });
    }

    const token = authHeader.split(' ')[1]; // correct way to extract token
    console.log("🧪 Extracted Token:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token Decoded:", decoded);

        req.user = decoded;
        next(); // continue to route handler 
    } catch (err) {
        console.log("❌ Token verification failed:", err.message);
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

module.exports = verifyToken;
