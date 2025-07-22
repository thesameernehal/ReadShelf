
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied : No token provided' });
    }

    try {
        const decode = jwt.verify(token, readshelfsecretkey);

        req.user = decode;
        next(); // continue to route handler 
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
}

module.exports = verifyToken; 