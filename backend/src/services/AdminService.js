const AdminDAO = require('../dao/AdminDAO');
const NotificationService = require('./NotificationService');

/**
 * 管理后台服务
 */
class AdminService {
  async getDashboardStats() {
    return await AdminDAO.getDashboardStats();
  }

  async publishAnnouncement(adminId, payload) {
    return NotificationService.broadcastSystemAnnouncement(adminId, payload);
  }
}

module.exports = new AdminService();
