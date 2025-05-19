const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');

router.get('/login', userController.login);

router.post('/login', userController.loginUser);

router.get('/register', userController.register);

router.post('/register', userController.registerUser);

router.get('/logout', userController.logout);

module.exports = router;