const User = require('../models/User');
const Question = require('../models/Question');
const History = require('../models/History');
const Exam = require('../models/Exam');

// Hàm hiển thị trang chủ Dashboard Admin
exports.getDashboard = async (req, res) => {
    try {
        // Kiểm tra bảo mật: Khách hoặc User thường thì đuổi về trang chủ
        if (!req.session.userId || req.session.role !== 'admin') {
            return res.redirect('/index');
        }

        // Truy vấn lấy dữ liệu từ Database
        const users = await User.find().sort({ createdAt: -1 });
        const questions = await Question.find().sort({ _id: -1 }).limit(50); // Lấy 50 câu mới nhất
        const histories = await History.find().populate('nguoi_dung_id').sort({ createdAt: -1 }).limit(20);

        // Đếm tổng số lượng cho các ô thống kê
        const stats = {
            totalUsers: await User.countDocuments(),
            totalQuestions: await Question.countDocuments(),
            totalExams: await Exam.countDocuments(),
            totalHistories: await History.countDocuments()
        };

        // Gửi dữ liệu ra file giao diện
        res.render('admin/dashboard', { 
            session: req.session, 
            users, 
            questions, 
            histories, 
            stats 
        });
    } catch (err) {
        res.status(500).send('Lỗi Server: ' + err.message);
    }
};