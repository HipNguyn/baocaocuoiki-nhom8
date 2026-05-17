const User = require('../models/User');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const bcrypt = require('bcryptjs');

exports.getDashboard = async (req, res) => {
    const stats = {
        users: await User.countDocuments(),
        questions: await Question.countDocuments(),
        exams: await Exam.countDocuments()
    };
    res.render('admin/dashboard', { session: req.session, stats, message: null, msgType: null });
};

// CƠ CHẾ TRỘN ĐỀ THI THEO CHƯƠNG & THI THỬ (CHUYỂN TỪ TẬP TIN PHP SANG MONGOOSE)
exports.postMixChapter = async (req, res) => {
    const chapId = parseInt(req.body.chapter_id);
    try {
        const exams = await Exam.find({ chuong_id: chapId }).limit(6);
        if (exams.length < 6) throw new Error(`Chương ${chapId} cần phải tạo sẵn 6 vỏ đề thi trước.`);

        // Lấy toàn bộ bể chứa câu hỏi dựa theo mức độ phân tầng dữ liệu
        const poolDe = await Question.find({ chuong_id: chapId, muc_do: 'de' });
        const poolTB = await Question.find({ chuong_id: chapId, muc_do: 'trung_binh' });
        const poolKho = await Question.find({ chuong_id: chapId, muc_do: 'kho' });

        for (let exam of exams) {
            // Trộn xáo trộn mảng câu hỏi
            const shuffledDe = poolDe.sort(() => 0.5 - Math.random()).slice(0, 13);
            const shuffledTB = poolTB.sort(() => 0.5 - Math.random()).slice(0, 14);
            const shuffledKho = poolKho.sort(() => 0.5 - Math.random()).slice(0, 13);

            exam.cau_hoi = [...shuffledDe.map(q => q._id), ...shuffledTB.map(q => q._id), ...shuffledKho.map(q => q._id)];
            await exam.save();
        }

        const stats = { users: await User.countDocuments(), questions: await Question.countDocuments(), exams: await Exam.countDocuments() };
        res.render('admin/dashboard', { session: req.session, stats, message: `Đã làm mới và trộn thành công 6 đề thi thuộc Chương ${chapId}!`, msgType: 'success' });
    } catch (err) {
        const stats = { users: await User.countDocuments(), questions: await Question.countDocuments(), exams: await Exam.countDocuments() };
        res.render('admin/dashboard', { session: req.session, stats, message: err.message, msgType: 'error' });
    }
};

exports.postMixMockTest = async (req, res) => {
    try {
        const mockExams = await Exam.find({ loai_de: 'thi_thu' });
        if (mockExams.length === 0) throw new Error("Vui lòng khởi tạo các vỏ đề thi thử hệ thống trước!");

        const structure = { 1: 7, 2: 7, 3: 7, 4: 7, 5: 6, 6: 6 };

        for (let exam of mockExams) {
            let combinedQuestions = [];
            for (let chapId in structure) {
                const limit = structure[chapId];
                const pool = await Question.find({ chuong_id: parseInt(chapId) });
                const chosen = pool.sort(() => 0.5 - Math.random()).slice(0, limit);
                combinedQuestions = combinedQuestions.concat(chosen.map(q => q._id));
            }
            exam.cau_hoi = combinedQuestions.sort(() => 0.5 - Math.random());
            await exam.save();
        }
        const stats = { users: await User.countDocuments(), questions: await Question.countDocuments(), exams: await Exam.countDocuments() };
        res.render('admin/dashboard', { session: req.session, stats, message: "Hệ thống đã xáo trộn và làm mới toàn bộ kho đề thi thử tổng hợp!", msgType: 'success' });
    } catch (err) {
        const stats = { users: await User.countDocuments(), questions: await Question.countDocuments(), exams: await Exam.countDocuments() };
        res.render('admin/dashboard', { session: req.session, stats, message: err.message, msgType: 'error' });
    }
};

// QUAN LÝ NGÂN HÀNG CÂU HỎI
exports.getQuestions = async (req, res) => {
    const chapter = parseInt(req.query.chapter) || 1;
    const search = req.query.search ? req.query.search.trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    let queryCondition = { chuong_id: chapter };
    if (search) {
        queryCondition.cauHoi = new RegExp(search, 'i');
    }

    const totalRows = await Question.countDocuments(queryCondition);
    const totalPages = Math.ceil(totalRows / limit);
    const questions = await Question.find(queryCondition)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    let editQuestion = null;
    if (req.query.edit) {
        editQuestion = await Question.findById(req.query.edit);
    }

    res.render('admin/questions', { session: req.session, questions, chapter, search, page, totalPages, totalRows, editQuestion, message: null, msgType: null });
};

exports.postSaveQuestion = async (req, res) => {
    try {
        const { edit_id, chuong_id, muc_do, dapAn, cauHoi, cauA, cauB, cauC, cauD, giaiThich } = req.body;
        if (edit_id) {
            await Question.findByIdAndUpdate(edit_id, { chuong_id: parseInt(chuong_id), muc_do, dapAn, cauHoi, cauA, cauB, cauC, cauD, giaiThich });
        } else {
            await Question.create({ chuong_id: parseInt(chuong_id), muc_do, dapAn, cauHoi, cauA, cauB, cauC, cauD, giaiThich });
        }
        res.redirect('/admin/questions?chapter=' + chuong_id);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.postDeleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.body.id);
        res.redirect('/admin/questions?chapter=' + req.body.chapter_id);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// QUẢN LÝ CHƯƠNG & BÀI HỌC
exports.getChapters = async (req, res) => {
    const chapters = await Chapter.find().sort({ so_thu_tu: 1 });
    let editChapter = req.query.view === 'edit_chapter' ? await Chapter.findById(req.query.id) : null;
    let editLesson = req.query.view === 'edit_lesson' ? await Lesson.findById(req.query.id) : null;
    let addLessonForChapter = req.query.add_lesson_for || 0;

    // Lấy bài học đi kèm
    const mappedChapters = [];
    for (let ch of chapters) {
        const lessons = await Lesson.find({ chuong_id: ch._id }).sort({ thu_tu: 1 });
        mappedChapters.push({ ...ch._doc, lessons });
    }

    res.render('admin/chapters', { session: req.session, chapters: mappedChapters, allChaptersRaw: chapters, editChapter, editLesson, addLessonForChapter, view: req.query.view || 'list', message: null, msgType: null });
};

exports.postSaveChapter = async (req, res) => {
    const { id, so_thu_tu, ten_chuong, noi_dung } = req.body;
    if (id) {
        await Chapter.findByIdAndUpdate(id, { so_thu_tu: parseInt(so_thu_tu), ten_chuong, noi_dung });
    } else {
        await Chapter.create({ so_thu_tu: parseInt(so_thu_tu), ten_chuong, noi_dung });
    }
    res.redirect('/admin/chapters');
};

exports.postSaveLesson = async (req, res) => {
    const { lesson_id, chuong_id, ten_bai, thu_tu, video_url, noi_dung } = req.body;
    if (lesson_id) {
        await Lesson.findByIdAndUpdate(lesson_id, { chuong_id, ten_bai, thu_tu: parseInt(thu_tu), video_url, noi_dung });
    } else {
        await Lesson.create({ chuong_id, ten_bai, thu_tu: parseInt(thu_tu), video_url, noi_dung });
    }
    res.redirect('/admin/chapters');
};

// QUẢN LÝ NGƯỜI DÙNG
exports.getUsers = async (req, res) => {
    const search = req.query.search ? req.query.search.trim() : '';
    let condition = {};
    if (search) {
        condition.$or = [{ ho_va_ten: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    }
    const users = await User.find(condition).sort({ _id: -1 });
    let editUser = req.query.edit ? await User.findById(req.query.edit) : null;

    res.render('admin/users', { session: req.session, users, editUser, search, totalRows: users.length, message: null, msgType: null });
};

exports.postSaveUser = async (req, res) => {
    const { edit_id, ho_va_ten, email, role, mat_khau } = req.body;
    if (edit_id) {
        let updateData = { ho_va_ten, email, role };
        if (mat_khau) updateData.mat_khau = await bcrypt.hash(mat_khau, 10);
        await User.findByIdAndUpdate(edit_id, updateData);
    } else {
        const hashPass = await bcrypt.hash(mat_khau, 10);
        await User.create({ ho_va_ten, email, role, mat_khau: hashPass });
    }
    res.redirect('/admin/users');
};

exports.postDeleteUser = async (req, res) => {
    if (req.body.id === req.session.userId) return res.status(400).send("Không thể tự xóa chính mình!");
    await User.findByIdAndDelete(req.body.id);
    res.redirect('/admin/users');
};