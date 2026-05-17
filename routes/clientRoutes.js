const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get(['/', '/index'], clientController.getIndex);
router.get('/chuong/:id', clientController.getChapter);
router.get('/list_exams', clientController.getListExams);
router.get('/exam/:id', clientController.getExam);
router.post('/exam/:id/submit', clientController.postSubmitExam);
router.get('/result/:id', clientController.getResult);

module.exports = router;