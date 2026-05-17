const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Đã đổi localhost thành 127.0.0.1 ở dòng bên dưới
        const conn = await mongoose.connect('mongodb+srv://songhiep2005_db_user:TeJzgHyTBzurskyr@duancuoiki.g4mrq0o.mongodb.net/tn_hcm');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;