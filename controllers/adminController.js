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

// ================= PHẦN API CRUD (CHO THUNDER CLIENT TEST) =================

// [CREATE] - API Thêm mới câu hỏi
exports.createQuestion = async (req, res) => {
    try {
        // Đã bổ sung hứng đầy đủ 4 đáp án và mức độ để khớp với CSDL
        const { chuong_id, cauHoi, cauA, cauB, cauC, cauD, dapAn, muc_do } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!chuong_id || !cauHoi || !cauA || !cauB || !cauC || !cauD || !dapAn || !muc_do) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin câu hỏi và các đáp án!" });
        }
        
        const newQuestion = await Question.create({ 
            chuong_id, cauHoi, cauA, cauB, cauC, cauD, dapAn, muc_do 
        });
        res.status(201).json({ message: "✅ Thêm câu hỏi thành công!", data: newQuestion });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};

// [UPDATE] - API Sửa câu hỏi
exports.updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { chuong_id, cauHoi, cauA, cauB, cauC, cauD, dapAn, muc_do } = req.body;
        
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId, 
            { chuong_id, cauHoi, cauA, cauB, cauC, cauD, dapAn, muc_do }, 
            { new: true }
        );
        
        if (!updatedQuestion) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi này!" });
        }
        res.json({ message: "✅ Cập nhật câu hỏi thành công!", data: updatedQuestion });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};

// [DELETE] - API Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const deletedQuestion = await Question.findByIdAndDelete(questionId);
        
        if (!deletedQuestion) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi này!" });
        }
        res.json({ message: "✅ Xóa câu hỏi thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};