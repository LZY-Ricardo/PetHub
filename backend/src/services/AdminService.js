const AdminDAO = require('../dao/AdminDAO');

/**
 * 管理后台服务
 */
class AdminService {
  async getDashboardStats() {
    return await AdminDAO.getDashboardStats();
  }
}

module.exports = new AdminService();
