const User = require('../models/User');
const ActivityLog = require('../models/ActivityLogs');

class TaskController {
    // [GET] /me/tasks/edit/:id
    edit(req, res, next){
        const userID = res.locals.user.id;
        const taskID = req.params.id;
        User.findById(userID)
            .then((user) => {
                user.todos.forEach((task) => {
                    if(task.id === taskID){
                        res.render('me/task_details/edit', {
                            task: task.toObject()
                        });
                    }
                })
            })
            .catch(next);
    }

    // [PUT] /me/tasks/update/:id
    update(req, res, next){
        const userID = res.locals.user.id;
        const taskID = req.params.id;
        const {content, taskType} = req.body;
        const now = new Date();
        User.findById(userID)
            .then((user) => {
                user.todos.forEach((task) => {
                    if(task.id === taskID){
                       task.inDay = false;
                       task.inWeek = false;
                       task.inMonth = false;
                       task.content = content;
                       switch (taskType) {
                        case 'inDay':
                            const endOfDay = new Date(now);
                            endOfDay.setHours(23, 59, 59, 999);
                            task.deadline = endOfDay; 
                            task.status = 'pending';
                            task.inDay = true;
                            break;
                        case 'inWeek':
                            const dayOfWeek = now.getDay(); // 0 = CN
                            const daysToEnd = 7 - dayOfWeek;
                            const endOfWeek = new Date(now);
                            endOfWeek.setDate(now.getDate() + daysToEnd);
                            endOfWeek.setHours(23, 59, 59, 999);
                            task.deadline = endOfWeek;
                            task.status = 'pending';
                            task.inWeek = true;
                            break;
                        case 'inMonth':
                            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                            task.deadline = endOfWeek;
                            task.status = 'pending';
                            task.inMonth = true;
                            break;
                        default:
                            res.json('Có lỗi!!!');
                            break;
                       }
                       return user.save();
                    }
                })
            })
            .then(() => {
                res.redirect('/me/manager-task');
            })
            .catch(next);
    }

    // [PATCH] /me/tasks/:id/complete
    complete(req, res, next) {
    const userID = res.locals.user.id;
    const taskID = req.params.id;

    User.findById(userID)
        .then(user => {
        const task = user.todos.id(taskID); // Lấy subdocument
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task không tồn tại' });
        }

        task.status = 'completed';
        task.completed = true;

        return user.save().then(() => {
            res.json({ success: true, message: 'Đã cập nhật task thành công' });
        });
        })
        .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        });
    }

    // [DELETE] /me/tasks/:id
    deleted(req, res, next){
        const userID = res.locals.user.id;
        const taskID = req.params.id;
        const reason = req.body.reason;

        User.findById(userID)
            .then((user) => {
                const task = user.todos.id(taskID);
                if(!task){
                    return res.status(404).json({ success: false, message: 'Task không tồn tại' });
                }
                task.deleted = true;
                task.reason = reason || 'Không có lý do';
                const log = new ActivityLog({
                    user: userID,
                    taskID: taskID,
                    action: 'delete',
                    message: `Xóa task ${task.content}. Lý do: ${reason}`,
                })

                return Promise.all([user.save(), log.save()]);
            })
            .then(() => {
                res.json({ success: true, message: 'Đã xóa task thành công!' });
            })
            .catch(err => {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
            });
    }

    // [FORCE DELETE] /me/tasks/:id/permanent
    forceDeleted(req, res, next){
        const userID = res.locals.user.id;
        const taskID = req.params.id;

        User.findById(userID)
            .then((user) => {
                const task = user.todos.id(taskID);
                if(!task)  return res.status(404).json({ success: false, message: 'Task không tồn tại' });

                user.todos.pull({ _id: taskID });


                const log = new ActivityLog({
                    user: userID,
                    taskID: taskID,
                    action: 'force-delete',
                    message: `Nhiệm vụ ${task.content} đã được xóa vĩnh viễn`,
                })

                return Promise.all([user.save(), log.save()]);
            })
            .then(() => {
                res.json({ success: true, message: 'Đã xóa task vĩnh viễn!' });
            })
            .catch(err => {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
            });
    }
}

module.exports = new TaskController();