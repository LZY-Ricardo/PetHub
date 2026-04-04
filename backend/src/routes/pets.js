const Router = require('koa-router');
const PetController = require('../controllers/PetController');
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');

const router = new Router({
  prefix: '/api/pets'
});

router.get('/', optionalAuthMiddleware, PetController.getPetList);
router.get('/statistics', authMiddleware, adminMiddleware, PetController.getStatistics);
router.get('/my-submissions', authMiddleware, PetController.getMyPetSubmissions);
router.get('/pending-submissions', authMiddleware, adminMiddleware, PetController.getPendingPetSubmissions);
router.get('/:id', optionalAuthMiddleware, PetController.getPetDetail);

router.post('/', authMiddleware, adminMiddleware, PetController.createPet);
router.post('/submissions', authMiddleware, PetController.createUserPetSubmission);

router.put('/:id', authMiddleware, adminMiddleware, PetController.updatePet);
router.put('/my-submissions/:id', authMiddleware, PetController.updateMyPetSubmission);
router.put('/submissions/:id/review', authMiddleware, adminMiddleware, PetController.reviewPetSubmission);

router.post('/my-submissions/:id/resubmit', authMiddleware, PetController.resubmitMyPetSubmission);

router.delete('/:id', authMiddleware, adminMiddleware, PetController.deletePet);

module.exports = router;
