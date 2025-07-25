const User = require('../models/User');
const ActivityLog = require('../models/ActivityLogs');
const mongoose = require('mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');


class MeController {
    // [GET] /me/dashboard
    dashboard(req, res, next) {
    const userId = res.locals.user.id;

    User.findById(userId)
        .then((user) => {
        const stats = {
            inDay: { total: 0, completed: 0 },
            inWeek: { total: 0, completed: 0 },
            inMonth: { total: 0, completed: 0 }
        };

        user.todos.forEach((todo) => {
            if (todo.inDay && todo.deleted === false) {
            stats.inDay.total++;
            if (todo.completed) stats.inDay.completed++;
            } else if (todo.inWeek && todo.deleted === false) {
            stats.inWeek.total++;
            if (todo.completed) stats.inWeek.completed++;
            } else if (todo.inMonth && todo.deleted === false) {
            stats.inMonth.total++;
            if (todo.completed) stats.inMonth.completed++;
            }
        });

        const tasksSummary = [
            {
            label: 'Công việc trong ngày',
            icon: '📅',
            count: stats.inDay.total,
            completed: stats.inDay.completed,
            showCompleted: stats.inDay.completed > 0,
            route: '/me/task-in-day',
            theme: 'primary'
            },
            {
            label: 'Công việc trong tuần',
            icon: '📆',
            count: stats.inWeek.total,
            completed: stats.inWeek.completed,
            showCompleted: stats.inWeek.completed > 0,
            route: '/me/task-in-week',
            theme: 'success'
            },
            {
            label: 'Công việc trong tháng',
            icon: '🗓️',
            count: stats.inMonth.total,
            completed: stats.inMonth.completed,
            showCompleted: stats.inMonth.completed > 0,
            route: '/me/task-in-month',
            theme: 'warning'
            }
        ];

        // Notification logic - kiểm tra trạng thái hoàn thành
        if (!req.session.completionTracking) {
            req.session.completionTracking = {
                inDay: false,
                inWeek: false,
                inMonth: false
            };
        }

        let toastMessage = null;
        
        // Tạo key unique cho mỗi trạng thái hoàn thành
        const currentlyComplete = {
            inDay: stats.inDay.total > 0 && stats.inDay.total === stats.inDay.completed,
            inWeek: stats.inWeek.total > 0 && stats.inWeek.total === stats.inWeek.completed,
            inMonth: stats.inMonth.total > 0 && stats.inMonth.total === stats.inMonth.completed
        };
        
        const completionStateKey = JSON.stringify(currentlyComplete);
        
        // Ưu tiên hiển thị theo thứ tự: ngày -> tuần -> tháng
        if (currentlyComplete.inDay && !req.session.completionTracking.inDay) {
            toastMessage = '🎉 Chúc mừng! Bạn đã hoàn thành tất cả công việc trong ngày.';
            req.session.completionTracking.inDay = true;
        } else if (currentlyComplete.inWeek && !req.session.completionTracking.inWeek) {
            toastMessage = '🎉 Chúc mừng! Bạn đã hoàn thành tất cả công việc trong tuần.';
            req.session.completionTracking.inWeek = true;
        } else if (currentlyComplete.inMonth && !req.session.completionTracking.inMonth) {
            toastMessage = '🎉 Chúc mừng! Bạn đã hoàn thành tất cả công việc trong tháng.';
            req.session.completionTracking.inMonth = true;
        }

        // Reset tracking nếu không còn hoàn thành 100%
        if (!currentlyComplete.inDay) req.session.completionTracking.inDay = false;
        if (!currentlyComplete.inWeek) req.session.completionTracking.inWeek = false;
        if (!currentlyComplete.inMonth) req.session.completionTracking.inMonth = false;

        const totalCompleted =
            stats.inDay.completed + stats.inWeek.completed + stats.inMonth.completed;

        const totalTasks =
            stats.inDay.total + stats.inWeek.total + stats.inMonth.total;

        const totalUncompleted = totalTasks - totalCompleted;

        

        // Placeholder
        const percentLastMonth = 90;

        // PercentInMonth
        let percentThisMonth; 
        let taskCompletedInMonth = 0;
        let allTaskInMonth = 0 ;
        const now = new Date();
        user.todos.forEach((task) =>{
            if(task.completedAt){
                const date = new Date(task.completedAt);
                if(date.getMonth() === now.getMonth()){
                    taskCompletedInMonth++;
                }
            }
            const date = new Date(task.createdAt);
            if(date.getMonth() === now.getMonth()){
                allTaskInMonth++
            }
        })
    
        if(allTaskInMonth > 0){
            percentThisMonth = Math.round((taskCompletedInMonth / allTaskInMonth) * 100)
        }


        const renderData = {
            fullname: user.fullname,
            tasksSummary,
            percentThisMonth,
            percentLastMonth,
            totalCompleted,
            totalUncompleted,
            // compareMessage,
        }

        if(toastMessage){
            renderData.toastMessage = JSON.stringify(toastMessage);
        }

        res.render('me/dashboard', renderData);
        })
        .catch(next);
    }


        // [GET] /me/add_new_task
        addNewTask(req, res, next){
            console.log("User trong res.locals:", res.locals.user);
            res.render('me/addtask', {
                user: res.locals.user,
            });
        }

        // [POST] /me/add
        add(req, res, next){
            const userId = res.locals.user.id;
            const {taskType, content} = req.body;
            const newTask = {
                _id: new mongoose.Types.ObjectId(),
                content,
                completed: false,
                isValid: true,
                inDay: false,
                inWeek: false,
                inMonth: false,
                deadline: null,
                status: 'pending',
            };

            const now = new Date()
            if (taskType === 'inDay') {
                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);
                newTask.inDay = true;
                newTask.deadline = endOfDay;
            } else if (taskType === 'inWeek') {
                const dayOfWeek = now.getDay(); // 0 = CN
                const daysToEnd = 7 - dayOfWeek;
                const endOfWeek = new Date(now);
                endOfWeek.setDate(now.getDate() + daysToEnd);
                endOfWeek.setHours(23, 59, 59, 999);
                newTask.inWeek = true;
                newTask.deadline = endOfWeek;
            } else if (taskType === 'inMonth') {
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                newTask.inMonth = true;
                newTask.deadline = endOfMonth;
            }

            User.findById(userId)
                .then((user) => {
                    user.todos.push(newTask);
                    const log = new ActivityLog({
                        user: user._id,
                        taskID: newTask._id,
                        action: 'create',
                        message: `Tạo task mới: ${newTask.content}`,
                    })
                    // Lưu song song cả log và user
                    return Promise.all([user.save(), log.save()]);
                })
                .then(() => {
                    res.redirect('/me/add_new_task');
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        message: 'Không thể thêm nhiệm vụ mới',
                    })
                })

        }

        // [PUT] /me/complete/:id
        completed(req, res, next){
            const userId = res.locals.user.id;
            const id = req.params.id;
            User.findById(userId)
                .then((user) => {
                    const task = user.todos.id(id);
                    if(!task) {
                        return res.status(404).json({
                            success: false,
                            message: 'Không tìm thấy task',
                        });
                    };

                    task.completed = true;
                    task.status = 'complete';

                    const log = new ActivityLog({
                        user: userId,
                        taskID: id,
                        action: 'complete',
                        message: `Hoàn thành ${task.content}`,
                    })

                    return Promise.all([log.save(), user.save()]);
                })
                .then(() => {
                    res.redirect(req.get('referer') || '/me/dashboard');
                })
                .catch(next);
        }

    // [DELETE] /me/delete/:id 
    deleted(req, res, next){
        const userId = res.locals.user.id;
        const id = req.params.id
         User.findById(userId)
            .then((user) => {
                  const task = user.todos.id(id);
                    if(!task) {
                        return res.status(404).json({
                            success: false,
                            message: 'Không tìm thấy task',
                        });
                    };

                    task.deleted = true;

                    const log = new ActivityLog({
                        user: userId,
                        taskID: id,
                        action: 'delete',
                        message: `Xóa ${task.content}`,
                    })

                    return Promise.all([log.save(), user.save()]);
            })
            .then(() => {
                res.redirect('/me/dashboard');
            })
            .catch(next);
    }

    // [GET] /me/task-in-day 
    taskInDay(req, res, next){
        const userID = res.locals.user.id;
        let todos = [];
        User.findById(userID)
            .then((user) => {
                (user.todos).forEach((todo) => {
                    if(todo.inDay === true && todo.deleted === false){
                        todos.push(todo);
                    }
                });
                res.status(200).render('me/task-in-day', {
                    todos: mutipleMongooseToObject(todos),
                }); 
            })
            .catch((error) => {
                res.status(500).json({
                    message: "Không thể truy cập!!",
                    success: false,
                    error: error.message
                });
            }); 
        }

        // [GET] /me/task-in-week
    taskInWeek(req, res, next){
        const userID = res.locals.user.id;
        let todos = [];
        User.findById(userID)
            .then((user) => {
                (user.todos).forEach((todo) => {
                    if(todo.inWeek === true && todo.deleted === false){
                        todos.push(todo);
                    }
                });
                res.status(200).render('me/task-in-week', {
                    todos: mutipleMongooseToObject(todos),
                }); 
            })
            .catch((error) => {
                res.status(500).json({
                    message: "Không thể truy cập!!",
                    success: false,
                    error: error.message
                });
            }); 
        }

        // [GET] /me/task-in-month
    taskInMonth(req, res, next){
        const userID = res.locals.user.id;
        let todos = [];
        User.findById(userID)
            .then((user) => {
                (user.todos).forEach((todo) => {
                    if(todo.inMonth === true && todo.deleted === false){
                        todos.push(todo);
                    }
                });
                res.status(200).render('me/task-in-month', {
                    todos: mutipleMongooseToObject(todos),
                });
            })
            .catch((error) => {
                res.status(500).json({
                    message: "Không thể truy cập!!",
                    success: false,
                    error: error.message
                });
            }); 
        }

    // [GET] /me/profile
    profile(req, res, next){
        const userId = res.locals.user.id;
        const now = new Date();
        User.findById(userId)
            .then((user) => {
                const createUserAt = new Date(user.createdAt);

                const joinDate = createUserAt.getFullYear(); 
                const createMonth = createUserAt.getMonth();
                const createDate = createUserAt.getDate();

                const yearNow = now.getFullYear();
                const monthNow = now.getMonth();
                const dateNow = now.getDate();

                // Tổng số ngày hoạt động = 365.(yearNow - user.joinDate) + 30.(monthNow - createMonth) + dateNow - createDate
                const activeDays = ( 365 *( yearNow - joinDate) ) + ( 30 * (monthNow - createMonth) ) + ( dateNow - createDate);

                let completedTasks = 0;
                let pendingTasks = 0;
                user.todos.forEach(task => {
                    if(task.completed){
                        completedTasks++;
                    }else{
                        pendingTasks++;
                    }
                })

                res.render('me/profile', {
                    user: {
                        ...user.toObject(),
                        activeDays,
                        completedTasks,
                        pendingTasks,
                        joinDate,
                    }
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

    // [GET] /me/manager-task
    managerTask(req, res, next){
        const userID = res.locals.user.id;
        let deletedCount = 0;
        let overdueCount = 0;
        let overdueTasks = [];
        let deletedTasks = [];
        User.findById(userID)
            .then((user) => {
                user.todos.forEach((task) => {
                    if(task.deleted === true){
                        deletedCount++;
                        deletedTasks.push(task.toObject());
                    }
                    if(task.status === 'overdue' && task.deleted === false){
                        overdueCount++;
                        overdueTasks.push(task.toObject());
                    }

                    

                }) 
                // Tổng số task cần xử lý
                const totalCount = deletedCount + overdueCount;


                res.render('me/taskoverdue&deleted', {
                    overdueTasks,
                    deletedTasks,
                    deletedCount,
                    overdueCount,
                    totalCount,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    message: "Không thể truy cập!!",
                    success: false,
                    error: error.message
                });
            }); 
    };

    // [GET] /me/histort-log
    historyLog(req, res, next){
        const userID = res.locals.user.id;
        ActivityLog.find({user: userID}).sort({ createdAt: -1 }).lean()
            .then((logs) => {
                res.render('me/history-log', {
                    logs,
                })
            })
    }

    // [POST] /me/logs/clear
    clearLog(req, res, next){
        const userID = res.locals.user.id;
        ActivityLog.deleteMany({user: userID})
            .then(() => {
                res.redirect('/me/dashboard');
            })
            .catch(next);
    }
}

module.exports = new MeController();