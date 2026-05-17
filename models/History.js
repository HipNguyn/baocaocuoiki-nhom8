const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    nguoi_dung_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bai_thi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    ten_bai_thi: { type: String, required: true },
    diem_so: { type: Number, required: true },
    chi_tiet: [{
        cau_hoi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        cau_tra_loi: { type: String, default: null }, // Đáp án user chọn
        dung_sai: { type: Boolean, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);