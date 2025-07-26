const User =  require('../models/User');

class HomeController{
    // [GET] /
    home(req, res){
        res.render('login&register/login');
    }
}

module.exports = new HomeController();