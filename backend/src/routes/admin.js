const Router = require('koa-router');
const AdminController = require('../controllers/AdminController');
const BoardingController = require('../controllers/BoardingController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = new Router({
  prefix: '/api/admin'
});

/**
 * @route GET /api/admin/dashboard
 * @desc 获取管理仪表盘统计
 * @access private (admin)
 */
router.get('/dashboard', authMiddleware, adminMiddleware, AdminController.getDashboardStats);

/**
 * @route POST /api/admin/notifications/broadcast
 * @desc 管理员发布系统公告
 * @access private (admin)
 */
router.post('/notifications/broadcast', authMiddleware, adminMiddleware, AdminController.publishAnnouncement);
router.get('/notifications', authMiddleware, adminMiddleware, AdminController.getAnnouncementList);
router.delete('/notifications/:id', authMiddleware, adminMiddleware, AdminController.deleteAnnouncement);
router.get('/boarding-applications', authMiddleware, adminMiddleware, BoardingController.getAdminApplicationList);
router.get('/boarding-applications/:id', authMiddleware, adminMiddleware, BoardingController.getAdminApplicationDetail);
router.patch('/boarding-applications/:id/review', authMiddleware, adminMiddleware, BoardingController.reviewApplication);
router.patch('/boarding-applications/:id/check-in', authMiddleware, adminMiddleware, BoardingController.checkInApplication);
router.patch('/boarding-applications/:id/complete', authMiddleware, adminMiddleware, BoardingController.completeApplication);
router.patch('/boarding-applications/:id/cancel', authMiddleware, adminMiddleware, BoardingController.cancelApplicationByAdmin);

module.exports = router;
