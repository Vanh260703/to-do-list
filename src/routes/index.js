const homeRouter = require('./home');
const userRouter = require('./user');
const meRouter = require('./me');

function route(app){
    app.use('/', homeRouter);

    app.use('/', userRouter);

    app.use('/me', meRouter);
}

module.exports = route;