const BaseDAO = require('./BaseDAO');

/**
 * 管理后台DAO
 * 提供仪表盘统计查询
 */
class AdminDAO extends BaseDAO {
  constructor() {
    super('sys_user');
  }

  /**
   * 获取管理后台仪表盘统计
   */
  async getDashboardStats() {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM sys_user) AS user_count,
        (SELECT COUNT(*) FROM pet_info) AS pet_count,
        (SELECT COUNT(*) FROM adoption_application) AS adoption_count,
        (SELECT COUNT(*) FROM forum_post) AS post_count,
        (SELECT COUNT(*) FROM lost_pet) AS lost_count,
        (SELECT COUNT(*) FROM adoption_application WHERE status = 'pending') AS pending_adoption_count
    `;

    const rows = await this.execute(sql);
    return rows[0];
  }
}

module.exports = new AdminDAO();
