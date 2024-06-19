const { Router } = require('express');
const { 
    queries, 
    registerUser, 
    loginUser, 
    editProfile, 
    changePassword, 
    forgetPassword, 
    getBlog, 
    getBlogs, 
    logoutUser, 
    commentBlog, 
    editComment, 
    replyComment, 
    deleteComment, 
    getPlans, 
    getPlan,
    verifyEmail } = require('../controllers/default.controller');
const { validateUser , checkIfCommentRelatedToUser , checkIfUserRegistered , checkIfUserExists , isUserVerified } = require('../middlewares/user.middleware');

const router = Router();

router.get('/getPlans', getPlans);
router.get('/getPlan/:planId', getPlan);
router.get('/getBlogs', getBlogs);
router.get('/getBlog/:blogId', getBlog);
router.post('/queries', queries);
router.patch('/editProfile', checkIfUserRegistered, isUserVerified, editProfile);
router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', validateUser, loginUser);
router.post('/forgetPassword', checkIfUserExists, forgetPassword);
router.patch('/changePassword', checkIfUserRegistered, isUserVerified, changePassword);
router.post('/commentBlog/:blogId', checkIfUserRegistered, isUserVerified, commentBlog);
router.post('/replyComment/:commentId', checkIfUserRegistered, isUserVerified, replyComment);
router.patch('/editComment/:commentId', checkIfUserRegistered, checkIfCommentRelatedToUser, isUserVerified, editComment);
router.delete('/deleteComment/:commentId', checkIfUserRegistered, checkIfCommentRelatedToUser, isUserVerified, deleteComment);
router.post('/logout', logoutUser);

module.exports = router;