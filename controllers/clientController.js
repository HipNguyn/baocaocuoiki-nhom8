const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const History = require('../models/History');
const User = require('../models/User');

// 1. Trang chủ - Danh sách chương học
exports.getIndex = async (req, res) => {
    try {
        const dsChuong = await Chapter.find().sort({ so_thu_tu: 1 });
        res.render('index', { session: req.session, dsChuong });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// 2. Chi tiết chương học - Danh sách bài học
exports.getChapter = async (req, res) => {
    try {
        const chuong = await Chapter.findOne({ so_thu_tu: req.params.id });
        if (!chuong) return res.redirect('/index');
        const dsBaiHoc = await Lesson.find({ chuong_id: chuong._id }).sort({ thu_tu: 1 });
        res.render('chuong', { session: req.session, chuong, dsBaiHoc });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// 3. Danh sách đề thi (Thi thử / Ôn tập theo chương)
exports.getListExams = async (req, res) => {
    try {
        const type = req.query.type || 'thi_thu';
        const chuong_id = parseInt(req.query.chuong_id) || 0;
        let data = [];
        let pageTitle = "Kho Đề Thi Thử Tổng Hợp";

        if (type === 'theo_chuong') {
            if (chuong_id > 0) {
                data = await Exam.find({ loai_de: 'theo_chuong', chuong_id });
                pageTitle = `Danh sách đề ôn tập - Chương ${chuong_id}`;
            } else {
                return res.redirect('/index');
            }
        } else {
            data = await Exam.find({ loai_de: 'thi_thu' });
        }
        res.render('list_exams', { session: req.session, type, chuong_id, data, pageTitle });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// 4. Giao diện phòng thi - Làm bài trắc nghiệm
exports.getExam = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const exam = await Exam.findById(req.params.id).populate('cau_hoi');
        if (!exam) return res.status(404).render('error', { message: 'Đề thi không tồn tại!' });
        res.render('exam', { session: req.session, exam });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// 5. Xử lý nộp bài thi - Chấm điểm và lưu lịch sử
exports.postSubmitExam = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ status: 'error', message: 'Hết phiên đăng nhập' });
        
        const examId = req.params.id;
        const { answers } = req.body; 

        const exam = await Exam.findById(examId).populate('cau_hoi');
        let correctCount = 0;
        const chi_tiet = [];

        exam.cau_hoi.forEach(q => {
            const userAns = answers.find(a => a.question_id === q._id.toString());
            const selected = userAns ? userAns.selected : null;
            const isCorrect = selected === q.dapAn;
            if (isCorrect) correctCount++;

            chi_tiet.push({
                cau_hoi_id: q._id,
                cau_tra_loi: selected,
                dung_sai: isCorrect
            });
        });

        const score = exam.cau_hoi.length > 0 ? (correctCount / exam.cau_hoi.length) * 10 : 0;
        const record = await History.create({
            nguoi_dung_id: req.session.userId,
            bai_thi_id: examId,
            ten_bai_thi: exam.tieu_de,
            diem_so: Math.round(score * 100) / 100,
            chi_tiet
        });

        res.json({ status: 'success', result_id: record._id });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// 6. Xem lại kết quả chi tiết của bài thi vừa làm
exports.getResult = async (req, res) => {
    try {
        const history = await History.findById(req.params.id)
            .populate('bai_thi_id')
            .populate('chi_tiet.cau_hoi_id');
        res.render('result', { session: req.session, history });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// 7. Trang cá nhân hồ sơ & Lịch sử làm bài thi
exports.getProfile = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        
        const user = await User.findById(req.session.userId);
        const histories = await History.find({ nguoi_dung_id: req.session.userId })
                                       .sort({ createdAt: -1 });
                                       
        res.render('profile', { session: req.session, user, histories });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// 8. Trang Ôn tập Lý thuyết (Hiển thị câu hỏi theo chương)
exports.getOnTapChuong = async (req, res) => {
    try {
        const chuong = await Chapter.findOne({ so_thu_tu: parseInt(req.params.id) });
        if (!chuong) return res.redirect('/index');
        
        const dsBaiHoc = await Lesson.find({ chuong_id: chuong._id }).sort({ thu_tu: 1 });
        
        res.render('chuong', { 
            session: req.session, 
            chuong,
            dsBaiHoc
        });
    } catch (err) {
        res.status(500).render('error', { message: err.message }); 
    }
};
