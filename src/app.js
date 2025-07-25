const express = require('express');
require('dotenv').config();
const session = require('express-session');
const methodOverride = require('method-override');
const moment = require('moment');
const app = express();
const { engine } = require('express-handlebars');
const path = require('path');
require('./cron/handleAllTaskExpiry');
const PORT = process.env.PORT || 3000;

const db = require('./config/db');
const route = require('./routes')

db.connect()

app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình session
app.use(session({
    secret: 'Vietanh123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // Session tồn tại 1 ngày
        secure: false 
    }
}))

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    // Đảm bảo session được lưu nếu có thay đổi
    if (req.session.user) {
        req.session.save(err => {
            if (err) console.error('Session save error:', err);
            next();
        });
    } else {
        next();
    }
});

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {
            CheckCompletedTask: (done, total) => {
                if (total === 0) return 'Không có công việc nào';
                if (done === 0) return '🔴 Bạn chưa hoàn thành công việc nào';
                if (done < total) return `🟡 Đã hoàn thành ${done}/${total}`;
                return '🟢 Hoàn thành tất cả 🎉';
            },
            
            eq: (a, b) => {
                return a === b;
            },

            formatDate1: (date) => {
                return moment(date).format('DD-MM-YYYY HH:mm')
            },

            formatDate2: (date) => {
                return moment(date).format('YYYY-MM-DD');
            },

            calculateOverdueDays: (dueDate) => {
            if (!dueDate) return 'Không xác định';

            const due = new Date(dueDate);
            if (isNaN(due.getTime())) return 'Ngày không hợp lệ';

            const now = new Date();
            const diffTime = now - due;

            if (diffTime <= 0) return 0;

            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
            }
        }
    }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));


route(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

});
