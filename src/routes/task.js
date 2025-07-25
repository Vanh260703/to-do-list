const express = require('express');
const router = express.Router();
const Authentication = require('../middlewares/Authentication');
const meController = require('../app/controllers/MeController');
const taskController = require('../app/controllers/TaskController');

router.get('/edit/:id', taskController.edit);

router.put('/update/:id', taskController.update);

router.patch('/:id/complete', taskController.complete);

router.delete('/:id', taskController.deleted);

router.delete('/:id/permanent', taskController.forceDeleted);

module.exports = router;