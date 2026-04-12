const BaseDAO = require('./BaseDAO');

class SystemAnnouncementDAO extends BaseDAO {
  constructor() {
    super('system_announcement');
  }

  async createAnnouncement(data) {
    const result = await this.insert(data);
    return result.insertId;
  }

  async getAnnouncementList(page = 1, pageSize = 10) {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;
    const sql = `
      SELECT sa.*, u.nickname AS creator_name
      FROM ${this.tableName} sa
      LEFT JOIN sys_user u ON u.id = sa.created_by
      ORDER BY sa.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const countSql = `SELECT COUNT(*) AS total FROM ${this.tableName}`;

    const [rows] = await this.pool.query(sql, [limit, offset]);
    const [countRows] = await this.pool.query(countSql);

    return {
      list: rows,
      total: countRows[0]?.total || 0,
      page: Number(page),
      pageSize: limit
    };
  }

  async getAnnouncementById(id) {
    const sql = `
      SELECT sa.*, u.nickname AS creator_name
      FROM ${this.tableName} sa
      LEFT JOIN sys_user u ON u.id = sa.created_by
      WHERE sa.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = new SystemAnnouncementDAO();
