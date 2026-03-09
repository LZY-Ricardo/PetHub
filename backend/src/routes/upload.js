const Router = require('koa-router');
const UploadController = require('../controllers/UploadController');
const { authMiddleware } = require('../middlewares/auth');
const { singleImageUpload } = require('../middlewares/upload');

const router = new Router({
  prefix: '/api/upload'
});

/**
 * @route POST /api/upload/image
 * @desc 通用图片上传
 * @access private
 */
router.post('/image', authMiddleware, singleImageUpload('file', 'tmp'), UploadController.uploadImage);

module.exports = router;
