const Router = require('koa-router');
const LostPetController = require('../controllers/LostPetController');
const { authMiddleware } = require('../middlewares/auth');

const router = new Router({ prefix: '/api/lost-pets' });

router.get('/', LostPetController.getLostList);
router.get('/my', authMiddleware, LostPetController.getMyLostPets);
router.get('/:id', LostPetController.getLostDetail);
router.post('/', authMiddleware, LostPetController.createLostPet);
router.put('/:id', authMiddleware, LostPetController.updateLostPet);
router.delete('/:id', authMiddleware, LostPetController.deleteLostPet);
router.patch('/:id/found', authMiddleware, LostPetController.markAsFound);

module.exports = router;
