const BaseDAO = require('./BaseDAO');

/**
 * 宠物DAO
 * 处理宠物信息相关的数据库操作
 */
class PetDAO extends BaseDAO {
  constructor() {
    super('pet_info');
  }

  /**
   * 获取宠物列表（分页、筛选）
   * @param {object} filters - 筛选条件
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   */
  async getPetList(filters = {}, page = 1, pageSize = 10) {
    let sql = `
      SELECT p.*, u.nickname as creator_name
      FROM ${this.tableName} p
      LEFT JOIN sys_user u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // 筛选条件
    if (filters.status) {
      sql += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.breed) {
      sql += ' AND p.breed LIKE ?';
      params.push(`%${filters.breed}%`);
    }

    if (filters.gender) {
      sql += ' AND p.gender = ?';
      params.push(filters.gender);
    }

    if (filters.minAge !== undefined) {
      sql += ' AND p.age >= ?';
      params.push(filters.minAge);
    }

    if (filters.maxAge !== undefined) {
      sql += ' AND p.age <= ?';
      params.push(filters.maxAge);
    }

    // 获取总数
    let countSql = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE 1=1`;
    const countParams = [];

    if (filters.status) {
      countSql += ' AND status = ?';
      countParams.push(filters.status);
    }

    if (filters.breed) {
      countSql += ' AND breed LIKE ?';
      countParams.push(`%${filters.breed}%`);
    }

    if (filters.gender) {
      countSql += ' AND gender = ?';
      countParams.push(filters.gender);
    }

    if (filters.minAge !== undefined) {
      countSql += ' AND age >= ?';
      countParams.push(filters.minAge);
    }

    if (filters.maxAge !== undefined) {
      countSql += ' AND age <= ?';
      countParams.push(filters.maxAge);
    }

    const [countResult] = await this.pool.query(countSql, countParams);

    // 分页
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt((page - 1) * pageSize));

    const [rows] = await this.pool.query(sql, params);

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  /**
   * 获取宠物详情（包含创建者信息）
   * @param {number} id - 宠物ID
   */
  async getPetDetail(id) {
    const sql = `
      SELECT p.*, u.nickname as creator_name
      FROM ${this.tableName} p
      LEFT JOIN sys_user u ON p.created_by = u.id
      WHERE p.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * 创建宠物信息
   * @param {object} petData - 宠物数据
   * @param {number} createdBy - 创建人ID
   */
  async createPet(petData, createdBy) {
    const {
      name, breed, gender, age, healthStatus, personality,
      vaccination, sterilized, status = 'available', photos, remarks
    } = petData;

    const sql = `
      INSERT INTO ${this.tableName}
      (name, breed, gender, age, health_status, personality, vaccination, sterilized, status, photos, remarks, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const photosJson = Array.isArray(photos) ? JSON.stringify(photos) : null;

    const [result] = await this.pool.query(sql, [
      name, breed, gender, age, healthStatus || 'good',
      personality, vaccination, sterilized ? 1 : 0,
      status, photosJson, remarks, createdBy
    ]);

    return result.insertId;
  }

  /**
   * 更新宠物信息
   * @param {number} id - 宠物ID
   * @param {object} petData - 更新的数据
   */
  async updatePet(id, petData) {
    const {
      name, breed, gender, age, healthStatus, personality,
      vaccination, sterilized, status, photos, remarks
    } = petData;

    const sql = `
      UPDATE ${this.tableName}
      SET name = ?, breed = ?, gender = ?, age = ?, health_status = ?,
          personality = ?, vaccination = ?, sterilized = ?, status = ?,
          photos = ?, remarks = ?
      WHERE id = ?
    `;

    const photosJson = photos ? (Array.isArray(photos) ? JSON.stringify(photos) : photos) : null;

    const [result] = await this.pool.query(sql, [
      name, breed, gender, age, healthStatus || 'good',
      personality, vaccination, sterilized ? 1 : 0,
      status, photosJson, remarks, id
    ]);

    return result.affectedRows > 0;
  }

  /**
   * 删除宠物
   * @param {number} id - 宠物ID
   */
  async deletePet(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 更新宠物状态
   * @param {number} id - 宠物ID
   * @param {string} status - 状态
   */
  async updatePetStatus(id, status) {
    const sql = `UPDATE ${this.tableName} SET status = ? WHERE id = ?`;
    const [result] = await this.pool.query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  /**
   * 获取统计数据
   */
  async getStatistics() {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'adopted' THEN 1 ELSE 0 END) as adopted,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
      FROM ${this.tableName}
    `;

    const [rows] = await this.pool.query(sql);
    return rows[0];
  }
}

module.exports = new PetDAO();
