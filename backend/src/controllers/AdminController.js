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

  async getAnnouncementList(ctx) {
    try {
      const { page = 1, pageSize = 10 } = ctx.query;
      const result = await AdminService.getAnnouncementList(page, pageSize);
      success(ctx, result, '获取成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async deleteAnnouncement(ctx) {
    try {
      const { id } = ctx.params;
      const result = await AdminService.deleteAnnouncement(id);
      success(ctx, result, '公告删除成功');
    } catch (err) {
      if (err.message.includes('ID无效')) {
        error(ctx, err.message, 400);
      } else if (err.message === '公告不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }
}

module.exports = new AdminController();
