const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware chặn nếu không phải quản trị viên
const isAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'admin') return next();
    res.redirect('/login');
};

router.use(isAdmin);

router.get('/', adminController.getDashboard);
router.post('/mix-chapter', adminController.postMixChapter);
router.post('/mix-mock', adminController.postMixMockTest);

// Questions CRUD
router.get('/questions', adminController.getQuestions);
router.post('/questions/save', adminController.postSaveQuestion);
router.post('/questions/delete', adminController.postDeleteQuestion);

// Chapters CRUD
router.get('/chapters', adminController.getChapters);
router.post('/chapters/save-chapter', adminController.postSaveChapter);
router.post('/chapters/save-lesson', adminController.postSaveLesson);

// Users CRUD
router.get('/users', adminController.getUsers);
router.post('/users/save', adminController.postSaveUser);
router.post('/users/delete', adminController.postDeleteUser);

module.exports = router;