const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Trang Dashboard
router.get('/', adminController.getDashboard);

// Các API CRUD (Dùng để test Postman)
router.post('/question', adminController.createQuestion);        // Thêm
router.put('/question/:id', adminController.updateQuestion);     // Sửa
router.delete('/question/:id', adminController.deleteQuestion);  // Xóa

module.exports = router;