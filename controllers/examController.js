const Exam = require('../models/Exam');
const Question = require('../models/Question');
const History = require('../models/History');

// Logic xử lý khi User bấm "Nộp bài" (Dịch từ exam.php)
exports.submitExam = async (req, res) => {
    try {
        const userId = req.session.userId;
        const examId = req.params.id;
        const userAnswers = req.body.answers; // Dạng [{question_id: '...', selected: 'A'}]

        // 1. Lấy thông tin bài thi và toàn bộ câu hỏi của nó
        const exam = await Exam.findById(examId).populate('cau_hoi');
        if (!exam) return res.status(404).json({ status: 'error', message: 'Đề thi không tồn tại' });

        let correctCount = 0;
        let detailsToSave = [];

        // 2. Chấm điểm server-side
        const correctAnswersMap = {};
        exam.cau_hoi.forEach(q => correctAnswersMap[q._id.toString()] = q.dapAn);

        userAnswers.forEach(ans => {
            const qid = ans.question_id;
            const selected = ans.selected;
            let isCorrect = false;

            if (correctAnswersMap[qid] && correctAnswersMap[qid] === selected) {
                isCorrect = true;
                correctCount++;
            }

            detailsToSave.push({
                cau_hoi_id: qid,
                cau_tra_loi: selected,
                dap_an_dung: correctAnswersMap[qid],
                dung_sai: isCorrect
            });
        });

        // 3. Tính điểm (Thang 10)
        let finalScore = (exam.cau_hoi.length > 0) ? (correctCount / exam.cau_hoi.length) * 10 : 0;
        finalScore = Math.round(finalScore * 100) / 100;

        // 4. Lưu lịch sử
        const newHistory = await History.create({
            nguoi_dung_id: userId,
            bai_thi_id: examId,
            ten_bai_thi: exam.tieu_de,
            diem_so: finalScore,
            chi_tiet: detailsToSave
        });

        // Trả về JSON để client gọi window.location.href = result...
        res.json({ status: 'success', result_id: newHistory._id });

    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};