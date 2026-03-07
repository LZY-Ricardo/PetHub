const Router = require('koa-router');
const PetController = require('../controllers/PetController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = new Router({
  prefix: '/api/pets'
});

/**
 * @route GET /api/pets
 * @desc 获取宠物列表
 * @access public
 */
router.get('/', PetController.getPetList);

/**
 * @route GET /api/pets/statistics
 * @desc 获取统计数据
 * @access private (admin)
 */
router.get('/statistics', authMiddleware, adminMiddleware, PetController.getStatistics);

/**
 * @route GET /api/pets/:id
 * @desc 获取宠物详情
 * @access public
 */
router.get('/:id', PetController.getPetDetail);

/**
 * @route POST /api/pets
 * @desc 创建宠物
 * @access private (admin)
 */
router.post('/', authMiddleware, adminMiddleware, PetController.createPet);

/**
 * @route PUT /api/pets/:id
 * @desc 更新宠物信息
 * @access private (admin)
 */
router.put('/:id', authMiddleware, adminMiddleware, PetController.updatePet);

/**
 * @route DELETE /api/pets/:id
 * @desc 删除宠物
 * @access private (admin)
 */
router.delete('/:id', authMiddleware, adminMiddleware, PetController.deletePet);

module.exports = router;
