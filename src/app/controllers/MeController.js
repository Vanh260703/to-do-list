const User = require('../models/User');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');


class MeController {
    // [GET] /me/home
    home(req, res, next){
        const userId = res.locals.user.id;
        User.findById(userId)
            .then((user) => {
                res.render('home', {
                    user: user,
                    fullname: user.fullname,
                    todos: mutipleMongooseToObject(user.todos),
                })
            })
            .catch(next)
    }

    // [POST] /me/add
    add(req, res, next){
        const userId = res.locals.user.id;
        const content = req.body.content;
        console.log(content);
        User.findById(userId)
            .then((user) => {
                user.todos.push({ content });
                return user.save();
            })
            .then(() => {
                res.redirect('/me/');
            })
            .catch(next);
    }

    // [GET] /me/complete/:id
    complete(req, res, next){
        const userId = res.locals.user.id;
        const id = req.params.id;
        console.log(id);
        User.findById(userId)
            .then((user) => {
                for(let i = 0; i < user.todos.length; i++){
                    if(user.todos[i]._id.toString() === id){
                        user.todos[i].completed = true;
                        return user.save();
                    }
                }
            })
            .then(() => {
                res.redirect('/me/');
            })
            .catch(next);
    }

    // [GET] /me/delete/:id 
    delete(req, res, next){
        const userId = res.locals.user.id;
        const id = req.params.id
         User.findById(userId)
            .then((user) => {
                for(let i = 0; i < user.todos.length; i++){
                    if(user.todos[i]._id.toString() === id){
                        user.todos.splice(i, 1);
                        return user.save();
                    }
                }
            })
            .then(() => {
                res.redirect('/me/');
            })
            .catch(next);
    }

    // [GET] /me/profile
    profile(req, res, next){
        const userId = res.locals.user.id;
        User.findById(userId)
            .then((user) => {
               res.render('profile', {
                user: user.toObject(),
                fullname: user.fullname,
               })
            })
            .catch(next)
    }

    // [POST] /me/saveInformation
    saveInformation(req, res, next){
        const userId = res.locals.user.id;
        User.findById(userId)
            .then(user => {
               user.fullname = req.body.fullname;
               user.email = req.body.email;
               return user.save();
            })
            .then(() => {
                res.redirect('/me');
            })
            .catch(next)
    }

}

module.exports = new MeController();