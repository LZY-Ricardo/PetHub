const NotificationDAO = require('../dao/NotificationDAO');
const SystemAnnouncementDAO = require('../dao/SystemAnnouncementDAO');

class NotificationService {
  async getNotificationList(userId, page, pageSize, unreadOnly, type) {
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const sizeNum = Number(pageSize) > 0 ? Number(pageSize) : 10;
    const typeValue = type || null;

    return NotificationDAO.getNotificationList(userId, pageNum, sizeNum, unreadOnly, typeValue);
  }

  async getUnreadCount(userId) {
    return NotificationDAO.getUnreadCount(userId);
  }

  async markAsRead(userId, notificationId) {
    const id = Number(notificationId);
    if (!id) {
      throw new Error('通知ID无效');
    }

    const updated = await NotificationDAO.markAsRead(userId, id);
    return { success: updated };
  }

  async markAllAsRead(userId) {
    const affected = await NotificationDAO.markAllAsRead(userId);
    return { affected };
  }

  async createNotification(payload) {
    if (!payload?.userId || !payload?.title || !payload?.content) {
      throw new Error('通知参数不完整');
    }

    return NotificationDAO.createNotification(payload);
  }

  async notifyAdmins(payload) {
    const adminIds = await NotificationDAO.getAdminIds();

    if (!adminIds.length) {
      return 0;
    }

    let count = 0;
    for (const adminId of adminIds) {
      await NotificationDAO.createNotification({
        ...payload,
        userId: adminId
      });
      count += 1;
    }

    return count;
  }

  async broadcastSystemAnnouncement(senderId, payload) {
    const { title, content } = payload || {};

    if (!title || !content) {
      throw new Error('公告标题和内容不能为空');
    }

    const targetRole = 'user';
    const userIds = await NotificationDAO.getActiveUserIds(targetRole);
    const announcementId = await SystemAnnouncementDAO.createAnnouncement({
      title,
      content,
      target_role: targetRole,
      delivered_count: userIds.length,
      created_by: senderId
    });

    let count = 0;
    for (const userId of userIds) {
      await NotificationDAO.createNotification({
        userId,
        type: 'system',
        title,
        content,
        relatedType: 'system_announcement',
        relatedId: announcementId,
        actionUrl: '/notifications'
      });
      count += 1;
    }

    return {
      announcementId,
      deliveredCount: count,
      targetRole
    };
  }

  async getAnnouncementList(page, pageSize) {
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const sizeNum = Number(pageSize) > 0 ? Number(pageSize) : 10;
    return SystemAnnouncementDAO.getAnnouncementList(pageNum, sizeNum);
  }

  async deleteAnnouncement(id) {
    const announcementId = Number(id);
    if (!announcementId) {
      throw new Error('公告ID无效');
    }

    const announcement = await SystemAnnouncementDAO.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new Error('公告不存在');
    }

    await NotificationDAO.deleteNotificationsByAnnouncementId(announcementId);
    await SystemAnnouncementDAO.delete(announcementId);

    return { success: true };
  }
}

module.exports = new NotificationService();
