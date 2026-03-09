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
}

module.exports = new AdminController();
