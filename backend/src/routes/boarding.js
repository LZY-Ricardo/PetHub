const Router = require('koa-router');
const BoardingController = require('../controllers/BoardingController');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router({
  prefix: '/api/boarding-applications'
});

router.post('/', authMiddleware, BoardingController.createApplication);
router.get('/my', authMiddleware, BoardingController.getMyApplications);
router.get('/:id', authMiddleware, BoardingController.getApplicationDetail);
router.patch('/:id/cancel', authMiddleware, BoardingController.cancelApplication);

module.exports = router;
