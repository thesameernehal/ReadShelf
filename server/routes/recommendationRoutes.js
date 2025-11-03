// server/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const verifyToken = require('../routes/middleWare/verifyToken');

// Optional authentication — continues even if no token is sent
const tryVerifyToken = (req, res, next) => {
  verifyToken(req, {
    status: () => ({ json: () => next() }) // fallback: continue if unauthorized
  }, next);
};

// Allow both logged-in and guest users
router.get('/', tryVerifyToken, getRecommendations);

module.exports = router;
