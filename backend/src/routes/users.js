const Router = require('koa-router');
const UserController = require('../controllers/UserController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = new Router({
  prefix: '/api/users'
});

/**
 * @route GET /api/users/admin-accounts
 * @desc 获取管理员账户列表
 * @access private (admin)
 */
router.get('/admin-accounts', authMiddleware, adminMiddleware, UserController.getAdminAccountList);

/**
 * @route GET /api/users
 * @desc 获取用户列表
 * @access private (admin)
 */
router.get('/', authMiddleware, adminMiddleware, UserController.getUserList);

/**
 * @route PUT /api/users/:id/status
 * @desc 更新用户状态
 * @access private (admin)
 */
router.put('/:id/status', authMiddleware, adminMiddleware, UserController.updateUserStatus);

module.exports = router;
