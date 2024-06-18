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
    getPlan } = require('../controllers/default.controller');
const { validateUser , checkIfCommentRelatedToUser , checkIfUserRegistered , checkIfUserExists } = require('../middlewares/user.middleware');

const router = Router();

router.get('/getPlans', getPlans);
router.get('/getPlan/:planId', getPlan);
router.get('/getBlogs', getBlogs);
router.get('/getBlog/:blogId', getBlog);
router.post('/queries', queries);
router.patch('/editProfile', checkIfUserRegistered, editProfile);
router.post('/register', registerUser);
router.post('/login', validateUser, loginUser);
router.post('/forgetPassword', checkIfUserExists, forgetPassword);
router.post('/changePassword', checkIfUserRegistered, changePassword);
router.post('/commentBlog/:blogId', checkIfUserRegistered, commentBlog);
router.post('/replyComment/:commentId', checkIfUserRegistered, replyComment);
router.patch('/editComment/:commentId', checkIfUserRegistered, checkIfCommentRelatedToUser, editComment);
router.delete('/deleteComment/:commentId', checkIfUserRegistered, checkIfCommentRelatedToUser, deleteComment);
router.post('/logout', logoutUser);

module.exports = router;