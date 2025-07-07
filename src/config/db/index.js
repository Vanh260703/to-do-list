// Khai báo database
require('dotenv').config();

const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/todolist');
        console.log('Kết nối đến database thành công!!!');
    } catch (error) {
        console.log('Kết nối thất bại. Vui lòng thử lại!!!');
    }
}

module.exports = { connect };
