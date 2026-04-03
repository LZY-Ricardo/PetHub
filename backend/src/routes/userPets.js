const Router = require('koa-router');
const UserPetController = require('../controllers/UserPetController');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router({
  prefix: '/api/user-pets'
});

router.get('/', authMiddleware, UserPetController.getMyPetList);
router.get('/:id', authMiddleware, UserPetController.getMyPetDetail);
router.post('/', authMiddleware, UserPetController.createMyPet);
router.put('/:id', authMiddleware, UserPetController.updateMyPet);
router.delete('/:id', authMiddleware, UserPetController.deleteMyPet);

module.exports = router;
