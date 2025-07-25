const User =  require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwwt = require('jsonwebtoken');

class UserController{
    // [GET] /login
    login(req, res){
        res.render('login&register/login');
    }

    // [POST] /login
    loginUser(req, res, next){
       const userName = req.body.username;
       const passwordInput = req.body.password;
       User.findOne({ username: userName })
        .then(user => {
            if(!user){
                return res.status(401).render('login&register/login', {
                    error: 'Tài khoản hoặc mật khẩu không đúng. Vui lòng nhập lại!',
                })
            }
            // Kiểm tra mật khẩu
            return bcrypt.compare(passwordInput, user.password)
                .then(isMatch => {
                    if(!isMatch){
                        return res.status(401).render('login&register/login', {
                        error: 'Tài khoản hoặc mật khẩu không đúng. Vui lòng nhập lại!',
                        })
                    }
                    // Lưu thông tin người dùng vào session
                    req.session.user = {
                        id: user._id.toString(),
                        username: user.username,
                        fullname: user.fullname,
                    }
                    console.log(req.session.user);
                    req.session.save((error) => {
                        if(error){
                            console.log('Lỗi lưu session', error);
                        }
                        res.redirect('/me/dashboard');
                    });
                })
                .catch(next)
        })
        .catch(next);
    }

    // [GET] /register
    register(req, res, next){
        res.render('login&register/register');
    }

    // [POST] /register
    registerUser(req, res, next){
        const user = new User(req.body);
        // Kiểm tra xem username đã tồn tại hay chưa 
        User.findOne({ username: user.username })
            .then((exisinguser) => {
                if(exisinguser){
                   return res.status(400).render('login&register/register', {
                    error: 'Tài khoàn đã được sử dụng. Vui lòng nhập lại!',
                   })
                }
                // Nếu tài khoản chưa tồn tại, mã hoá mật khẩu
                return bcrypt.hash(user.password, saltRounds)
                    .then((hashedPassword) => {
                        // Lưu mật khẩu đã mã hoá vào user
                        user.password = hashedPassword;
                        // Lưu người dùng vào database
                        return user.save()
                    })
                    .then(() => {
                        res.render('login&register/login')
                    })
            })
            .catch(next);
    }

    // [GET] /logout
    logout(req, res, next){
      req.session.destroy((error) => {
        if(error){
            console.log(error);
            return res.status(500).send('Logout error!!!');
        }
        res.redirect('/login');
      });
    };
};

module.exports = new UserController();