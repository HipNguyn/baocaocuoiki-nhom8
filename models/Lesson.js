const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    chuong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    ten_bai: { type: String, required: true },
    thu_tu: { type: Number, required: true },
    video_url: { type: String, default: "" },
    noi_dung: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);