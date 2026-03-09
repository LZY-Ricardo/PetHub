const Router = require('koa-router');
const ForumController = require('../controllers/ForumController');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');

const router = new Router({ prefix: '/api/forum' });

// Posts
router.get('/posts', ForumController.getPostList);
router.get('/posts/my', authMiddleware, ForumController.getMyContent);
router.get('/posts/:id', optionalAuthMiddleware, ForumController.getPostDetail);
router.post('/posts', authMiddleware, ForumController.createPost);
router.put('/posts/:id/category', authMiddleware, ForumController.updatePostCategory);
router.delete('/posts/:id', authMiddleware, ForumController.deletePost);

// Comments
router.get('/posts/:id/comments', ForumController.getComments);
router.post('/posts/:id/comments', authMiddleware, ForumController.createComment);
router.delete('/comments/:id', authMiddleware, ForumController.deleteComment);

// Likes
router.post('/posts/:id/like', authMiddleware, ForumController.toggleLike);

module.exports = router;
