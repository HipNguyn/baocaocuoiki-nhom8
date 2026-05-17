const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. Kết nối MongoDB thế cho MySQL
connectDB();

// 2. Thiết lập bộ tiền xử lý và phục vụ file tĩnh
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Cấu hình hệ thống quản lý phiên làm việc Session
app.use(session({
    secret: 'he_thong_on_thi_tutuong_hcm_mon_cnltud',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Hạn dùng 1 ngày
}));

// 4. Cấu hình Giao diện Engine EJS thay thế PHP thuần
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Inject biến session toàn cục vào EJS để làm thanh Header đăng nhập/đăng xuất
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// 5. Cấu hình các đầu Router API điều hướng phân quyền
app.use('/', clientRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

// Bắt lỗi 404 trang không tồn tại
app.use((req, res) => {
    res.status(404).render('error', { message: 'Trang yêu cầu không tìm thấy trên hệ thống!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang vận hành mượt mà tại địa chỉ: http://localhost:${PORT}`);
});