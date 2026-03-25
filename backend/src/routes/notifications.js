const Router = require('koa-router');
const NotificationController = require('../controllers/NotificationController');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router({ prefix: '/api/notifications' });

router.get('/', authMiddleware, NotificationController.getNotificationList);
router.get('/unread-count', authMiddleware, NotificationController.getUnreadCount);
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);

module.exports = router;
