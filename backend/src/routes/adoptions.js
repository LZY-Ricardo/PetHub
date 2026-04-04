const Router = require('koa-router');
const AdoptionController = require('../controllers/AdoptionController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = new Router({ prefix: '/api/adoptions' });

// 获取所有申请（管理员）
router.get('/', authMiddleware, adminMiddleware, AdoptionController.getApplicationList);
router.get('/stats', authMiddleware, adminMiddleware, AdoptionController.getApplicationStats);

// 获取我的申请
router.get('/my', authMiddleware, AdoptionController.getMyApplications);
router.get('/:id', authMiddleware, adminMiddleware, AdoptionController.getApplicationDetail);

// 提交申请
router.post('/', authMiddleware, AdoptionController.createApplication);

// 审核申请（管理员）
router.put('/:id/review', authMiddleware, adminMiddleware, AdoptionController.reviewApplication);

module.exports = router;
