const { Router } = require('express');
const { 
    queries, 
    registerUser, 
    loginUser, 
    editProfile, 
    changePassword, 
    forgetPassword, 
    resetPassword,
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
const { verifyToken, validateUser , checkIfCommentRelatedToUser , checkIfUserRegistered , checkIfUserExists , isUserVerified } = require('../middlewares/user.middleware');

const router = Router();

router.get('/getPlans', getPlans);
router.get('/getPlan/:planId', getPlan);
router.get('/getBlogs', getBlogs);
router.get('/getBlog/:blogId', getBlog);
router.post('/queries', queries);
router.patch('/editProfile', verifyToken, checkIfUserRegistered, isUserVerified, editProfile);
router.post('/register', validateUser, registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/forgetPassword', checkIfUserExists, forgetPassword);
router.post('/resetPassword', resetPassword);
router.patch('/changePassword', verifyToken, checkIfUserRegistered, isUserVerified, changePassword);
router.post('/commentBlog/:blogId', verifyToken, checkIfUserRegistered, isUserVerified, commentBlog);
router.post('/replyComment/:commentId', verifyToken, checkIfUserRegistered, isUserVerified, replyComment);
router.patch('/editComment/:commentId', verifyToken, checkIfUserRegistered, checkIfCommentRelatedToUser, isUserVerified, editComment);
router.delete('/deleteComment/:commentId', verifyToken, checkIfUserRegistered, checkIfCommentRelatedToUser, isUserVerified, deleteComment);
router.post('/logout', logoutUser);

module.exports = router;