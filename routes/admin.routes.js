const {Router} = require('express');
const { checkIfAdmin } = require('../middlewares/user.middleware');
const { createBlog, updateBlog, deleteBlog } = require('../controllers/admin.controller');

const router = Router();

router.post('/postBlog', checkIfAdmin, createBlog);
router.patch('/:blogId/updateBlog', checkIfAdmin, updateBlog);
router.delete('/:blogId/deleteBlog', checkIfAdmin, deleteBlog);

module.exports = router;