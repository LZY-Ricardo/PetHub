const AdminService = require('../services/AdminService');
const { success, error } = require('../utils/response');

/**
 * 管理后台控制器
 */
class AdminController {
  async getDashboardStats(ctx) {
    try {
      const stats = await AdminService.getDashboardStats();
      success(ctx, stats, '获取成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async publishAnnouncement(ctx) {
    try {
      const adminId = ctx.state.user.userId;
      const result = await AdminService.publishAnnouncement(adminId, ctx.request.body || {});
      success(ctx, result, '公告发布成功');
    } catch (err) {
      if (
        err.message.includes('不能为空') ||
        err.message.includes('无效')
      ) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }
}

module.exports = new AdminController();
