const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Tuyến đường trang chủ và chương học
router.get('/index', clientController.getIndex);
router.get('/chuong/:id', clientController.getChapter);

// Tuyến đường liên quan đến thi cử
router.get('/list_exams', clientController.getListExams);
router.get('/exam/:id', clientController.getExam);
router.post('/exam/:id/submit', clientController.postSubmitExam);
router.get('/result/:id', clientController.getResult);

// Tuyến đường trang cá nhân người dùng
router.get('/profile', clientController.getProfile);

module.exports = router;