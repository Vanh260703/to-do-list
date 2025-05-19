const express = require('express');
require('dotenv').config();
const session = require('express-session');
const app = express();
const { engine } = require('express-handlebars');
const path = require('path');
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
    }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));


route(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

});
