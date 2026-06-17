const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Đã đổi localhost thành 127.0.0.1 ở dòng bên dưới
        const conn = await mongoose.connect('mongodb://songhiep2005_db_user:TeJzgHyTBzurskyr@ac-kqud5ha-shard-00-00.g4mrq0o.mongodb.net:27017,ac-kqud5ha-shard-00-01.g4mrq0o.mongodb.net:27017,ac-kqud5ha-shard-00-02.g4mrq0o.mongodb.net:27017/tn_hcm?ssl=true&replicaSet=atlas-71v5hj-shard-0&authSource=admin&appName=DuAnCuoiKi');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;