const {Router} = require('express');
const upload = require('../middlewares/multer.middleware');
const { checkIfAdmin } = require('../middlewares/user.middleware');
const { getQueries, createBlog, updateBlog, deleteBlog, createPlan, updatePlan, deletePlan } = require('../controllers/admin.controller');

const router = Router();

router.post('/postBlog', checkIfAdmin, upload.single('image'), createBlog);
router.get('/queries', checkIfAdmin, getQueries);
router.patch('/:blogId/updateBlog', checkIfAdmin, updateBlog);
router.delete('/:blogId/deleteBlog', checkIfAdmin, deleteBlog);
router.post('/createPlan', checkIfAdmin, upload.single('image'), createPlan);
router.patch('/:planId/updatePlan', checkIfAdmin, updatePlan);
router.delete('/:planId/deletePlan', checkIfAdmin, deletePlan);

module.exports = router;