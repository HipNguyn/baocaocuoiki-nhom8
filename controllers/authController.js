const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ================= TRANG ĐĂNG NHẬP =================
exports.getLogin = (req, res) => {
    if (req.session.userId) return res.redirect('/index');
    
    let successMsg = null;
    if (req.query.msg === 'registered') {
        successMsg = 'Đăng ký tài khoản thành công! Hãy đăng nhập.';
    }
    
    res.render('login', { error: null, success: successMsg });
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.render('login', { error: 'Tài khoản không tồn tại!', success: null });
        
        const isMatch = await bcrypt.compare(password, user.mat_khau);
        if (!isMatch) return res.render('login', { error: 'Mật khẩu không chính xác!', success: null });

        req.session.userId = user._id;
        req.session.userName = user.ho_va_ten;
        req.session.role = user.role;

        if (user.role === 'admin') res.redirect('/admin');
        else res.redirect('/index');
        
    } catch (err) {
        res.render('login', { error: 'Hệ thống gặp lỗi đăng nhập!', success: null });
    }
};

// ================= TRANG ĐĂNG KÝ =================
exports.getRegister = (req, res) => {
    if (req.session.userId) return res.redirect('/index');
    res.render('register', { session: req.session, error: null });
};

exports.postRegister = async (req, res) => {
    try {
        // [THÊM MỚI] Dòng in ra để bạn tự bắt bệnh trên Terminal
        console.log("Dữ liệu Body nhận được từ Thunder Client:", req.body);

        // [THÊM MỚI] Rào chắn 1: Bắt lỗi gửi sai định dạng (Thunder Client gửi sai tab)
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.render('register', { session: req.session, error: 'Server không nhận được dữ liệu! Vui lòng chọn tab Form-encode trong Thunder Client.' });
        }

        const { ho_va_ten, email, mat_khau, xac_nhan_mat_khau } = req.body;

        // [THÊM MỚI] Rào chắn 2: Đảm bảo có mật khẩu mới đem đi mã hóa
        if (!mat_khau || !email) {
            return res.render('register', { session: req.session, error: 'Vui lòng điền đầy đủ Email và Mật khẩu!' });
        }

        if (mat_khau !== xac_nhan_mat_khau) {
            return res.render('register', { session: req.session, error: 'Mật khẩu xác nhận không khớp!' });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.render('register', { session: req.session, error: 'Email này đã được sử dụng!' });
        }

        const hashedPassword = await bcrypt.hash(mat_khau, 10);

        await User.create({ 
            ho_va_ten: ho_va_ten, 
            email: email, 
            mat_khau: hashedPassword,
            role: 'user' 
        });

        res.redirect('/login?msg=registered');

    } catch (err) {
        res.status(500).render('register', { session: req.session, error: 'Lỗi Server: ' + err.message });
    }
};

// ================= ĐĂNG XUẤT =================
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};