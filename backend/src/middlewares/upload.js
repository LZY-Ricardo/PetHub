const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { error } = require('../utils/response');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * 确保目录存在
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * 统一文件类型校验
 */
const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('文件类型不支持，仅支持jpg/jpeg/png/webp'));
  }
  cb(null, true);
};

/**
 * 将multer中间件适配为Koa中间件
 */
const wrapMulter = (multerMiddleware) => async (ctx, next) => {
  try {
    await new Promise((resolve, reject) => {
      multerMiddleware(ctx.req, ctx.res, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await next();
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return error(ctx, '文件大小不能超过5MB', 400);
    }
    return error(ctx, err.message || '文件上传失败', 400);
  }
};

/**
 * 上传单张图片
 * @param {string} fieldName - 文件字段名
 * @param {string} subDir - 上传子目录
 */
const singleImageUpload = (fieldName, subDir) => {
  const uploadDir = path.join(__dirname, '../../uploads', subDir);
  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    }
  });

  const upload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: MAX_FILE_SIZE
    }
  });

  return wrapMulter(upload.single(fieldName));
};

module.exports = {
  ensureDir,
  singleImageUpload
};
