const { Router } = require('express');
const { registerUser, loginUser, getBlog, getBlogs, logoutUser } = require('../controllers/default.controller');
const { validateUser } = require('../middlewares/default.middleware');

const router = Router();

router.post('/register', registerUser);
router.post('/login', validateUser, loginUser);
router.get('/getBlogs', getBlogs);
router.get('/getBlog/:blogId', getBlog);
router.post('/logout', logoutUser);

module.exports = router;