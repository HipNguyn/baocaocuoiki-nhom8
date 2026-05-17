const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    loai_de: { type: String, required: true, enum: ['theo_chuong', 'thi_thu'] },
    chuong_id: { type: Number, default: 0 },
    tieu_de: { type: String, required: true },
    mo_ta: { type: String, default: "" },
    thoi_gian: { type: Number, default: 45 }, // Tính theo số phút
    cau_hoi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = mongoose.model('Exam', examSchema);