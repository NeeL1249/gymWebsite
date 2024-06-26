const { Router } = require('express');
const { refreshToken } = require('../controllers/auth.controller');

const router = Router();

router.post('/refreshToken', refreshToken);

module.exports = router;