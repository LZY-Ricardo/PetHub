const Router = require('koa-router');
const AdminController = require('../controllers/AdminController');
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

module.exports = router;
