const BaseDAO = require('./BaseDAO');

/**
 * 用户DAO
 * 处理用户相关的数据库操作
 */
class UserDAO extends BaseDAO {
  constructor() {
    super('sys_user');
  }

  /**
   * 根据用户名查询用户
   * @param {string} username - 用户名
   */
  async findByUsername(username) {
    const sql = `SELECT * FROM ${this.tableName} WHERE username = ?`;
    const [rows] = await this.pool.query(sql, [username]);
    return rows[0] || null;
  }

  /**
   * 创建新用户
   * @param {object} userData - 用户数据
   */
  async createUser(userData) {
    const { username, password, nickname, role = 'user', contactInfo } = userData;
    const sql = `
      INSERT INTO ${this.tableName} (username, password, nickname, role, contact_info)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await this.pool.query(sql, [
      username,
      password,
      nickname,
      role,
      contactInfo || null
    ]);
    return result.insertId;
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {object} userData - 更新的数据
   */
  async updateUser(id, userData) {
    const { nickname, avatar, contactInfo } = userData;
    const sql = `
      UPDATE ${this.tableName}
      SET nickname = ?, avatar = ?, contact_info = ?
      WHERE id = ?
    `;
    const [result] = await this.pool.query(sql, [
      nickname,
      avatar || null,
      contactInfo || null,
      id
    ]);
    return result.affectedRows > 0;
  }

  /**
   * 更新用户头像
   * @param {number} id - 用户ID
   * @param {string} avatar - 头像URL
   */
  async updateAvatar(id, avatar) {
    const sql = `UPDATE ${this.tableName} SET avatar = ? WHERE id = ?`;
    const [result] = await this.pool.query(sql, [avatar, id]);
    return result.affectedRows > 0;
  }

  /**
   * 更新用户密码
   * @param {number} id - 用户ID
   * @param {string} newPassword - 新密码（已加密）
   */
  async updatePassword(id, newPassword) {
    const sql = `UPDATE ${this.tableName} SET password = ? WHERE id = ?`;
    const [result] = await this.pool.query(sql, [newPassword, id]);
    return result.affectedRows > 0;
  }

  /**
   * 获取用户列表（分页）
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {string} role - 角色筛选
   */
  async getUserList(page = 1, pageSize = 10, role = null) {
    let sql = `SELECT id, username, nickname, avatar, role, contact_info, status, created_at FROM ${this.tableName}`;
    const params = [];

    if (role) {
      sql += ` WHERE role = ?`;
      params.push(role);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, (page - 1) * pageSize);

    const [rows] = await this.pool.query(sql, params);

    // 获取总数
    let countSql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const countParams = [];
    if (role) {
      countSql += ` WHERE role = ?`;
      countParams.push(role);
    }
    const [countResult] = await this.pool.query(countSql, countParams);

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  /**
   * 禁用/启用用户
   * @param {number} id - 用户ID
   * @param {number} status - 状态（1-启用，0-禁用）
   */
  async updateUserStatus(id, status) {
    const sql = `UPDATE ${this.tableName} SET status = ? WHERE id = ?`;
    const [result] = await this.pool.query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  /**
   * 获取用户账号统计
   * @param {number} userId - 用户ID
   */
  async getUserStats(userId) {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM adoption_application WHERE user_id = ?) AS adoptionCount,
        (SELECT COUNT(*) FROM lost_pet WHERE user_id = ?) AS lostPetCount,
        (SELECT COUNT(*) FROM forum_post WHERE user_id = ?) AS forumPostCount
    `;
    const [rows] = await this.pool.query(sql, [userId, userId, userId]);
    return rows[0] || {
      adoptionCount: 0,
      lostPetCount: 0,
      forumPostCount: 0
    };
  }
}

module.exports = new UserDAO();
