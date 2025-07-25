const homeRouter = require('./home');
const userRouter = require('./user');
const meRouter = require('./me');
const taskRouter = require('./task');

function route(app){
    app.use('/', homeRouter);

    app.use('/', userRouter);

    app.use('/me', meRouter);

    app.use('/me/tasks', taskRouter);
}

module.exports = route;