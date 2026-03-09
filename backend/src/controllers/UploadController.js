const fs = require('fs');
const path = require('path');
const UserService = require('../services/UserService');
const { ensureDir } = require('../middlewares/upload');
const { success, error } = require('../utils/response');

const getFileUrl = (ctx, category, filename) => `${ctx.origin}/uploads/${category}/${filename}`;

/**
 * 文件上传控制器
 */
class UploadController {
  /**
   * 上传用户头像
   */
  async uploadAvatar(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const file = ctx.req.file;

      if (!file) {
        return error(ctx, '请选择头像文件', 400);
      }

      const avatarUrl = getFileUrl(ctx, 'avatar', file.filename);
      await UserService.updateAvatar(userId, avatarUrl);

      success(ctx, { avatar: avatarUrl }, '上传成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  /**
   * 通用图片上传
   */
  async uploadImage(ctx) {
    try {
      const file = ctx.req.file;
      const type = ctx.req.body?.type || 'common';
      const allowedTypes = ['avatar', 'pet', 'lost', 'forum', 'common'];

      if (!file) {
        return error(ctx, '请选择图片文件', 400);
      }

      if (!allowedTypes.includes(type)) {
        return error(ctx, '无效的图片类型', 400);
      }

      const targetDir = path.join(__dirname, '../../uploads', type);
      ensureDir(targetDir);

      const targetPath = path.join(targetDir, file.filename);
      fs.renameSync(file.path, targetPath);

      const url = getFileUrl(ctx, type, file.filename);
      success(ctx, { url }, '上传成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new UploadController();
