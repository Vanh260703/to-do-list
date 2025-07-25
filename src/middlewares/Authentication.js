function Authentication(req, res, next){
    // Kiếm tra session của user 
    if(req.session && req.session.user){
        res.locals.user = req.session.user; // Gán user vào res.locals
        return next();
    }

    return res.status(403).render('error/403');
}

module.exports = Authentication;