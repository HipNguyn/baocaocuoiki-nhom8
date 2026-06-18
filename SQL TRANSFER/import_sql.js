const fs = require('fs');
const mongoose = require('mongoose');
const Question = require('./models/Question'); // Đảm bảo đường dẫn này trỏ đúng tới file Model của bạn

// 1. KẾT NỐI MONGODB (Sửa lại tên database cho đúng với máy bạn nhé)
const MONGO_URI = 'mongodb://songhiep2005_db_user:TeJzgHyTBzurskyr@ac-kqud5ha-shard-00-00.g4mrq0o.mongodb.net:27017,ac-kqud5ha-shard-00-01.g4mrq0o.mongodb.net:27017,ac-kqud5ha-shard-00-02.g4mrq0o.mongodb.net:27017/tn_hcm?ssl=true&replicaSet=atlas-71v5hj-shard-0&authSource=admin&appName=DuAnCuoiKi'; 

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Đã kết nối MongoDB!');
        importQuestions();
    })
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

async function importQuestions() {
    try {
        console.log('⏳ Đang đọc file tn_hcm.sql...');
        // Nhớ để file tn_hcm.sql cùng thư mục với file này nhé
        const sql = fs.readFileSync('tn_hcm.sql', 'utf8');

        // Regex siêu việt để bóc tách 1600+ câu hỏi từ câu lệnh INSERT INTO của SQL
        const regex = /\((\d+),\s*(\d+|NULL),\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'([A-D])',\s*('((?:[^'\\]|\\.)*)'|NULL),\s*'([^']+)'\)/g;

        let match;
        const questions = [];

        while ((match = regex.exec(sql)) !== null) {
            questions.push({
                chuong_id: match[2] === 'NULL' ? null : Number(match[2]),
                cauHoi: match[3].replace(/\\'/g, "'").replace(/\\n/g, "\n"),
                cauA: match[4].replace(/\\'/g, "'"),
                cauB: match[5].replace(/\\'/g, "'"),
                cauC: match[6].replace(/\\'/g, "'"),
                cauD: match[7].replace(/\\'/g, "'"),
                dapAn: match[8],
                muc_do: match[11]
            });
        }

        if (questions.length === 0) {
            console.log('⚠️ Không tìm thấy câu hỏi nào. Bạn kiểm tra lại xem file SQL có đúng không!');
            process.exit();
        }

        console.log(`🔍 Tìm thấy tổng cộng ${questions.length} câu hỏi. Đang bơm vào Database...`);

        // Bơm hàng loạt vào MongoDB
        await Question.insertMany(questions);
        
        console.log('🎉 THÀNH CÔNG RỰC RỠ! Đã chuyển toàn bộ dữ liệu sang MongoDB.');
        process.exit();

    } catch (error) {
        console.error('❌ Có lỗi xảy ra:', error);
        process.exit(1);
    }
}