const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    chuong_id: { type: Number, required: true }, // Số thứ tự chương (1 -> 6)
    cauHoi: { type: String, required: true },
    cauA: { type: String, required: true },
    cauB: { type: String, required: true },
    cauC: { type: String, required: true },
    cauD: { type: String, required: true },
    dapAn: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    giaiThich: { type: String, default: "" },
    muc_do: { type: String, required: true, enum: ['de', 'trung_binh', 'kho'] }
});

module.exports = mongoose.model('Question', questionSchema);