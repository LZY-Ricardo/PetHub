const NotificationDAO = require('../dao/NotificationDAO');

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
    const {
      title,
      content,
      targetRole = 'all',
      excludeSender = false
    } = payload || {};

    if (!title || !content) {
      throw new Error('公告标题和内容不能为空');
    }

    if (!['all', 'user', 'admin'].includes(targetRole)) {
      throw new Error('公告目标范围无效');
    }

    const excludeUserId = excludeSender ? senderId : null;
    const userIds = await NotificationDAO.getActiveUserIds(targetRole, excludeUserId);

    let count = 0;
    for (const userId of userIds) {
      await NotificationDAO.createNotification({
        userId,
        type: 'system',
        title,
        content,
        relatedType: 'system_announcement',
        actionUrl: '/notifications'
      });
      count += 1;
    }

    return {
      deliveredCount: count,
      targetRole,
      excludeSender
    };
  }
}

module.exports = new NotificationService();
