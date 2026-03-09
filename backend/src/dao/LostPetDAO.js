const BaseDAO = require('./BaseDAO');

class LostPetDAO extends BaseDAO {
  constructor() {
    super('lost_pet');
  }

  async getLostList(page = 1, pageSize = 10, isFound = null, isUrgent = null) {
    let sql = `
      SELECT l.*, u.username, u.nickname as user_name, u.contact_info as user_contact
      FROM ${this.tableName} l
      LEFT JOIN sys_user u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (isFound !== null) {
      sql += ' AND l.is_found = ?';
      params.push(isFound ? 1 : 0);
    }

    if (isUrgent !== null) {
      sql += ' AND l.is_urgent = ?';
      params.push(isUrgent ? 1 : 0);
    }

    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE 1=1${isFound !== null ? ' AND is_found = ?' : ''}${isUrgent !== null ? ' AND is_urgent = ?' : ''}`;
    const countParams = [];
    if (isFound !== null) countParams.push(isFound ? 1 : 0);
    if (isUrgent !== null) countParams.push(isUrgent ? 1 : 0);
    const [countResult] = await this.pool.query(countSql, countParams);

    sql += ' ORDER BY l.is_urgent DESC, l.lost_time DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const [rows] = await this.pool.query(sql, params);

    rows.forEach(row => {
      if (row.photos) {
        // 如果已经是数组，直接使用
        if (Array.isArray(row.photos)) {
          // 已经是数组，无需处理
        } else if (typeof row.photos === 'string') {
          try {
            const parsed = JSON.parse(row.photos);
            // 解析成功，检查是否为数组
            row.photos = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // 解析失败，将字符串URL转换为数组
            row.photos = [row.photos];
          }
        } else {
          // 其他类型，转换为数组
          row.photos = [row.photos];
        }
      } else {
        row.photos = [];
      }
    });

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  async getLostDetail(id) {
    const sql = `
      SELECT l.*, u.username, u.nickname as user_name, u.contact_info as user_contact
      FROM ${this.tableName} l
      LEFT JOIN sys_user u ON l.user_id = u.id
      WHERE l.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    const row = rows[0];

    if (row && row.photos) {
      // 如果已经是数组，直接使用
      if (Array.isArray(row.photos)) {
        // 已经是数组，无需处理
      } else if (typeof row.photos === 'string') {
        try {
          const parsed = JSON.parse(row.photos);
          // 解析成功，检查是否为数组
          row.photos = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // 解析失败，将字符串URL转换为数组
          row.photos = [row.photos];
        }
      } else {
        // 其他类型，转换为数组
        row.photos = [row.photos];
      }
    } else if (row) {
      row.photos = [];
    }

    return row || null;
  }

  async createLostPet(data, userId) {
    const { name, location, lostTime, description, photos, contact, isUrgent } = data;
    const sql = `
      INSERT INTO ${this.tableName}
      (user_id, name, location, lost_time, description, photos, contact, is_urgent, is_found)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    const photosJson = Array.isArray(photos) ? JSON.stringify(photos) : null;
    const [result] = await this.pool.query(sql, [userId, name, location, lostTime, description, photosJson, contact, isUrgent ? 1 : 0]);
    return result.insertId;
  }

  async updateLostPet(id, data) {
    const { name, location, lostTime, description, photos, contact, isUrgent } = data;
    const sql = `
      UPDATE ${this.tableName}
      SET name = ?, location = ?, lost_time = ?, description = ?, photos = ?, contact = ?, is_urgent = ?
      WHERE id = ?
    `;
    const photosJson = photos ? (Array.isArray(photos) ? JSON.stringify(photos) : photos) : null;
    const [result] = await this.pool.query(sql, [name, location, lostTime, description, photosJson, contact, isUrgent ? 1 : 0, id]);
    return result.affectedRows > 0;
  }

  async deleteLostPet(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async markAsFound(id) {
    const sql = `UPDATE ${this.tableName} SET is_found = 1 WHERE id = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async getUserLostPets(userId) {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await this.pool.query(sql, [userId]);

    rows.forEach(row => {
      if (row.photos) {
        // 如果已经是数组，直接使用
        if (Array.isArray(row.photos)) {
          // 已经是数组，无需处理
        } else if (typeof row.photos === 'string') {
          try {
            const parsed = JSON.parse(row.photos);
            // 解析成功，检查是否为数组
            row.photos = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // 解析失败，将字符串URL转换为数组
            row.photos = [row.photos];
          }
        } else {
          // 其他类型，转换为数组
          row.photos = [row.photos];
        }
      } else {
        row.photos = [];
      }
    });

    return rows;
  }
}

module.exports = new LostPetDAO();
