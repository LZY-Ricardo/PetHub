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
  async getApplicationList(page = 1, pageSize = 10, filters = {}) {
    const { status = null, keyword = '' } = filters;
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

    if (keyword) {
      sql += ' AND (p.name LIKE ? OR u.nickname LIKE ? OR u.username LIKE ? OR a.contact LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    let countSql = `
      SELECT COUNT(*) as total
      FROM ${this.tableName} a
      LEFT JOIN sys_user u ON a.user_id = u.id
      LEFT JOIN pet_info p ON a.pet_id = p.id
      WHERE 1=1
    `;
    const countParams = [];

    if (status) {
      countSql += ' AND a.status = ?';
      countParams.push(status);
    }

    if (keyword) {
      countSql += ' AND (p.name LIKE ? OR u.nickname LIKE ? OR u.username LIKE ? OR a.contact LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult] = await this.pool.query(countSql, countParams);

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

  async getApplicationStats() {
    const sql = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM ${this.tableName}
    `;
    const [rows] = await this.pool.query(sql);
    return rows[0];
  }

  async getApplicationDetail(id) {
    const sql = `
      SELECT a.*, u.username, u.nickname as user_name, u.contact_info as user_contact,
             p.name as pet_name, p.breed, p.photos as pet_photos, p.status as pet_status,
             reviewer.nickname as reviewer_name
      FROM ${this.tableName} a
      LEFT JOIN sys_user u ON a.user_id = u.id
      LEFT JOIN pet_info p ON a.pet_id = p.id
      LEFT JOIN sys_user reviewer ON a.reviewed_by = reviewer.id
      WHERE a.id = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [id]);
    const row = rows[0] || null;

    if (row?.pet_photos) {
      try {
        row.pet_photos = JSON.parse(row.pet_photos);
      } catch (e) {
        row.pet_photos = row.pet_photos || [];
      }
    }

    if (row?.contact) {
      row.phone = row.contact;
    }

    return row;
  }

  /**
   * 获取用户的申请列表
   */
  async getUserApplications(userId) {
    const sql = `
      SELECT a.*,
             p.name as pet_name,
             p.breed as pet_breed,
             p.photos as pet_photos,
             p.status as pet_status,
             u.nickname as applicant_name,
             u.contact_info as user_contact
      FROM ${this.tableName} a
      LEFT JOIN pet_info p ON a.pet_id = p.id
      LEFT JOIN sys_user u ON a.user_id = u.id
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
      // 将contact字段映射为phone，方便前端使用
      if (row.contact) {
        row.phone = row.contact;
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
   * 自动驳回同一宠物的其他待审核申请
   */
  async rejectOtherPendingApplications(petId, approvedApplicationId, reviewComment, reviewedBy) {
    const sql = `
      UPDATE ${this.tableName}
      SET status = 'rejected',
          review_comment = ?,
          reviewed_by = ?,
          reviewed_at = NOW()
      WHERE pet_id = ?
        AND status = 'pending'
        AND id <> ?
    `;
    const [result] = await this.pool.query(sql, [reviewComment, reviewedBy, petId, approvedApplicationId]);
    return result.affectedRows || 0;
  }

  /**
   * 获取同一宠物其他待审核申请
   */
  async getOtherPendingApplications(petId, approvedApplicationId) {
    const sql = `
      SELECT id, user_id
      FROM ${this.tableName}
      WHERE pet_id = ?
        AND status = 'pending'
        AND id <> ?
    `;
    const [rows] = await this.pool.query(sql, [petId, approvedApplicationId]);
    return rows;
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
