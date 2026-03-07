const BaseDAO = require('./BaseDAO');

/**
 * 领养申请DAO
 */
class AdoptionDAO extends BaseDAO {
  constructor() {
    super('adoption_application');
  }

  /**
   * 获取申请列表（分页）
   */
  async getApplicationList(page = 1, pageSize = 10, status = null) {
    let sql = `
      SELECT a.*, u.username, u.nickname as user_name,
             p.name as pet_name, p.breed, p.photos as pet_photos
      FROM ${this.tableName} a
      LEFT JOIN sys_user u ON a.user_id = u.id
      LEFT JOIN pet_info p ON a.pet_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName}${status ? ' WHERE status = ?' : ''}`;
    const [countResult] = await this.pool.query(countSql, status ? [status] : []);

    // 分页
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const [rows] = await this.pool.query(sql, params);

    // 解析JSON字段
    rows.forEach(row => {
      if (row.pet_photos) {
        try {
          row.pet_photos = JSON.parse(row.pet_photos);
        } catch (e) {
          row.pet_photos = row.pet_photos || [];
        }
      }
    });

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  /**
   * 获取用户的申请列表
   */
  async getUserApplications(userId) {
    const sql = `
      SELECT a.*, p.name as pet_name, p.breed, p.photos as pet_photos,
             p.status as pet_status
      FROM ${this.tableName} a
      LEFT JOIN pet_info p ON a.pet_id = p.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `;
    const [rows] = await this.pool.query(sql, [userId]);

    rows.forEach(row => {
      if (row.pet_photos) {
        try {
          row.pet_photos = JSON.parse(row.pet_photos);
        } catch (e) {
          row.pet_photos = [];
        }
      }
    });

    return rows;
  }

  /**
   * 创建申请
   */
  async createApplication(applicationData) {
    const { userId, petId, reason, experience, contact, address } = applicationData;
    const sql = `
      INSERT INTO ${this.tableName}
      (user_id, pet_id, reason, experience, contact, address, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;
    const [result] = await this.pool.query(sql, [userId, petId, reason, experience, contact, address]);
    return result.insertId;
  }

  /**
   * 审核申请
   */
  async reviewApplication(id, status, reviewComment, reviewedBy) {
    const sql = `
      UPDATE ${this.tableName}
      SET status = ?, review_comment = ?, reviewed_by = ?, reviewed_at = NOW()
      WHERE id = ?
    `;
    const [result] = await this.pool.query(sql, [status, reviewComment, reviewedBy, id]);
    return result.affectedRows > 0;
  }

  /**
   * 检查是否已有待审核的申请
   */
  async checkPendingApplication(userId, petId) {
    const sql = `
      SELECT id FROM ${this.tableName}
      WHERE user_id = ? AND pet_id = ? AND status = 'pending'
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [userId, petId]);
    return rows.length > 0;
  }
}

module.exports = new AdoptionDAO();
