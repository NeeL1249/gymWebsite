const { Router } = require('express');
const { checkIfUser } = require('../middlewares/user.middleware');
const { editProfile } = require('../controllers/user.controller');

const router = Router();



module.exports = router;
