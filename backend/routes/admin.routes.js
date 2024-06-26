const {Router} = require('express');
const upload = require('../middlewares/multer.middleware');
const { checkIfAdmin } = require('../middlewares/user.middleware');
const { verifyToken } = require('../middlewares/user.middleware');
const { getQueries, createBlog, updateBlog, deleteBlog, createPlan, updatePlan, deletePlan, createChallenges, updateChallenges, deleteChallenges } = require('../controllers/admin.controller');

const router = Router();

router.post('/postBlog', verifyToken, checkIfAdmin, upload.single('image'), createBlog);
router.get('/queries', verifyToken, checkIfAdmin, getQueries);
router.patch('/:blogId/updateBlog', verifyToken, checkIfAdmin, updateBlog);
router.delete('/:blogId/deleteBlog', verifyToken, checkIfAdmin, deleteBlog);
router.post('/createPlan', verifyToken, checkIfAdmin, upload.single('image'), createPlan);
router.patch('/:planId/updatePlan', verifyToken, checkIfAdmin, updatePlan);
router.delete('/:planId/deletePlan', verifyToken, checkIfAdmin, deletePlan);
router.post('/createChallenges', verifyToken, checkIfAdmin, upload.single('image'), createChallenges);
router.patch('/:challengeId/updateChallenges', verifyToken, checkIfAdmin, updateChallenges);
router.delete('/:challengeId/deleteChallenges', verifyToken, checkIfAdmin, deleteChallenges);

module.exports = router;