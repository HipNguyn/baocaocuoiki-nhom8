const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    if (req.session.userId) return res.redirect('/index');
    res.render('login', { error: null, success: null });
};

exports.postRegister = async (req, res) => {
    try {
        const { fullname, email, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.render('login', { error: 'Mật khẩu xác nhận không khớp!', success: null });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.render('login', { error: 'Email này đã được đăng ký sử dụng!', success: null });
        }
        const hashedPref = await bcrypt.hash(password, 10);
        await User.create({ ho_va_ten: fullname, email, mat_khau: hashedPref });
        res.render('login', { error: null, success: 'Đăng ký tài khoản thành công! Hãy đăng nhập.' });
    } catch (err) {
        res.render('login', { error: 'Lỗi đăng ký: ' + err.message, success: null });
    }
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

        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/index');
        }
    } catch (err) {
        res.render('login', { error: 'Hệ thống gặp lỗi đăng nhập!', success: null });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};