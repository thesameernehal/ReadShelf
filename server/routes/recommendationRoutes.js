// this define the API endpoint GET /api/recommendations

const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const verifyToken = require('../routes/middleWare/verifyToken')


// Making protected route - only logged in users can access recommendations
router.get('/', verifyToken, getRecommendations);

module.exports = router; 