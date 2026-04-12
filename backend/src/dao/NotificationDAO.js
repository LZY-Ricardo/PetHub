const BaseDAO = require('./BaseDAO');

class NotificationDAO extends BaseDAO {
  constructor() {
    super('user_notification');
  }

  async getNotificationList(userId, page = 1, pageSize = 10, unreadOnly = false, type = null) {
    let sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE user_id = ?
    `;
    const params = [userId];

    if (unreadOnly) {
      sql += ' AND is_read = 0';
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM ${this.tableName}
      WHERE user_id = ?
      ${unreadOnly ? ' AND is_read = 0' : ''}
      ${type ? ' AND type = ?' : ''}
    `;

    const [countRows] = await this.pool.query(countSql, params);

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const [rows] = await this.pool.query(sql, params);

    return {
      list: rows,
      total: countRows[0].total,
      page,
      pageSize
    };
  }

  async getUnreadCount(userId) {
    const sql = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE user_id = ? AND is_read = 0`;
    const [rows] = await this.pool.query(sql, [userId]);
    return rows[0]?.total || 0;
  }

  async markAsRead(userId, notificationId) {
    const sql = `
      UPDATE ${this.tableName}
      SET is_read = 1, read_at = NOW()
      WHERE id = ? AND user_id = ? AND is_read = 0
    `;
    const [result] = await this.pool.query(sql, [notificationId, userId]);
    return result.affectedRows > 0;
  }

  async markAllAsRead(userId) {
    const sql = `
      UPDATE ${this.tableName}
      SET is_read = 1, read_at = NOW()
      WHERE user_id = ? AND is_read = 0
    `;
    const [result] = await this.pool.query(sql, [userId]);
    return result.affectedRows || 0;
  }

  async createNotification(notification) {
    const {
      userId,
      type = 'system',
      title,
      content,
      relatedType = null,
      relatedId = null,
      actionUrl = null
    } = notification;

    const sql = `
      INSERT INTO ${this.tableName}
      (user_id, type, title, content, related_type, related_id, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.pool.query(sql, [
      userId,
      type,
      title,
      content,
      relatedType,
      relatedId,
      actionUrl
    ]);

    return result.insertId;
  }

  async deleteNotificationsByAnnouncementId(announcementId) {
    const sql = `
      DELETE FROM ${this.tableName}
      WHERE related_type = 'system_announcement' AND related_id = ?
    `;
    const [result] = await this.pool.query(sql, [announcementId]);
    return result.affectedRows || 0;
  }

  async getAdminIds() {
    const sql = `SELECT id FROM sys_user WHERE role = 'admin' AND status = 1`;
    const [rows] = await this.pool.query(sql);
    return rows.map(item => item.id);
  }

  async getActiveUserIds(targetRole = 'all', excludeUserId = null) {
    let sql = `SELECT id FROM sys_user WHERE status = 1`;
    const params = [];

    if (targetRole !== 'all') {
      sql += ' AND role = ?';
      params.push(targetRole);
    }

    if (excludeUserId) {
      sql += ' AND id <> ?';
      params.push(excludeUserId);
    }

    const [rows] = await this.pool.query(sql, params);
    return rows.map(item => item.id);
  }
}

module.exports = new NotificationDAO();
