const Router = require('koa-router');
const AuthController = require('../controllers/AuthController');
const UploadController = require('../controllers/UploadController');
const { authMiddleware } = require('../middlewares/auth');
const { singleImageUpload } = require('../middlewares/upload');

const router = new Router({
  prefix: '/api/auth'
});

/**
 * @route POST /api/auth/register
 * @desc 用户注册
 * @access public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc 用户登录
 * @access public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/user
 * @desc 获取当前用户信息
 * @access private
 */
router.get('/user', authMiddleware, AuthController.getUserInfo);

/**
 * @route GET /api/auth/user/stats
 * @desc 获取当前用户账号统计
 * @access private
 */
router.get('/user/stats', authMiddleware, AuthController.getUserStats);

/**
 * @route PUT /api/auth/user
 * @desc 更新用户信息
 * @access private
 */
router.put('/user', authMiddleware, AuthController.updateUserInfo);

/**
 * @route POST /api/auth/change-password
 * @desc 修改密码
 * @access private
 */
router.post('/change-password', authMiddleware, AuthController.changePassword);

/**
 * @route POST /api/auth/avatar
 * @desc 上传头像
 * @access private
 */
router.post('/avatar', authMiddleware, singleImageUpload('avatar', 'avatar'), UploadController.uploadAvatar);

module.exports = router;
