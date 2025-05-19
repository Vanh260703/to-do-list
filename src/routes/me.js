const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');


router.get('/', meController.home);

router.post('/add', meController.add);

router.get('/complete/:id', meController.complete)

router.get('/delete/:id', meController.delete);

router.get('/profile', meController.profile);

router.post('/saveInformation', meController.saveInformation);

module.exports = router;