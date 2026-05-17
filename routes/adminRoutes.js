const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Tuyến đường (Route) hiển thị trang Dashboard Quản trị
router.get('/', adminController.getDashboard);

module.exports = router;