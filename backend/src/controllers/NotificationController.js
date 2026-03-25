const NotificationService = require('../services/NotificationService');
const { success, error } = require('../utils/response');

class NotificationController {
  async getNotificationList(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const {
        page = 1,
        pageSize = 10,
        unreadOnly = 'false',
        type
      } = ctx.query;

      const result = await NotificationService.getNotificationList(
        userId,
        page,
        pageSize,
        unreadOnly === 'true',
        type
      );

      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getUnreadCount(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const total = await NotificationService.getUnreadCount(userId);
      success(ctx, { unreadCount: total });
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async markAsRead(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const { id } = ctx.params;

      await NotificationService.markAsRead(userId, id);
      success(ctx, null, '已标记为已读');
    } catch (err) {
      if (err.message.includes('ID无效')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async markAllAsRead(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const result = await NotificationService.markAllAsRead(userId);
      success(ctx, result, '已全部标记为已读');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new NotificationController();
