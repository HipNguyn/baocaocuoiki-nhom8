const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    so_thu_tu: { type: Number, required: true, unique: true },
    ten_chuong: { type: String, required: true },
    noi_dung: { type: String, default: "" }
});

module.exports = mongoose.model('Chapter', chapterSchema);