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

  async getAnnouncementList(page, pageSize) {
    return NotificationService.getAnnouncementList(page, pageSize);
  }

  async deleteAnnouncement(id) {
    return NotificationService.deleteAnnouncement(id);
  }
}

module.exports = new AdminService();
