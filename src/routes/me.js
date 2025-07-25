const express = require('express');
const router = express.Router();
const Authentication = require('../middlewares/Authentication');
const meController = require('../app/controllers/MeController');


router.get('/dashboard', Authentication, meController.dashboard);

router.get('/add_new_task', Authentication, meController.addNewTask);

router.get('/task-in-day', Authentication, meController.taskInDay);

router.get('/task-in-week', Authentication, meController.taskInWeek);

router.get('/task-in-month', Authentication, meController.taskInMonth);


router.post('/add', Authentication, meController.add);

router.put('/complete/:id', Authentication, meController.completed)

router.delete('/delete/:id', Authentication, meController.deleted);

router.get('/profile', Authentication, meController.profile);

router.get('/manager-task', Authentication, meController.managerTask);

router.get('/history-log', Authentication, meController.historyLog);

router.post('/logs/clear', Authentication, meController.clearLog);


router.post('/saveInformation', Authentication, meController.saveInformation);

module.exports = router;