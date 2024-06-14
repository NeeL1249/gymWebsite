const { Router } = require('express');
const { queries, registerUser, loginUser, changePassword, forgetPassword, getBlog, getBlogs, logoutUser } = require('../controllers/default.controller');
const { validateUser } = require('../middlewares/user.middleware');

const router = Router();

router.post('/register', registerUser);
router.post('/login', validateUser, loginUser);
router.post('/queries', queries);
router.post('/changePassword', changePassword);
router.post('/forgetPassword', forgetPassword);
router.get('/getBlogs', getBlogs);
router.get('/getBlog/:blogId', getBlog);
router.post('/logout', logoutUser);

module.exports = router;