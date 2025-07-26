// Khai báo database
require('dotenv').config();

const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Kết nối đến database thành công!!!');
    } catch (error) {
        console.log('Kết nối thất bại. Vui lòng thử lại!!!');
    }
}

module.exports = { connect };
