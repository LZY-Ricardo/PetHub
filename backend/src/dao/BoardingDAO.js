const BaseDAO = require('./BaseDAO');

class BoardingDAO extends BaseDAO {
  constructor() {
    super('boarding_application');
  }

  async createBoardingApplication(data) {
    const result = await this.insert(data);
    return result.insertId;
  }

  async getBoardingApplicationById(id) {
    const sql = `
      SELECT b.*,
             u.username,
             u.nickname AS user_name,
             u.contact_info AS user_contact,
             p.name AS linked_pet_name,
             p.pet_type AS linked_pet_type,
             p.breed AS linked_pet_breed,
             p.gender AS linked_pet_gender,
             p.age AS linked_pet_age,
             p.health_notes AS linked_pet_health_notes,
             reviewer.nickname AS reviewer_name,
             canceller.nickname AS cancelled_by_name
      FROM ${this.tableName} b
      LEFT JOIN sys_user u ON b.user_id = u.id
      LEFT JOIN user_pet_profile p ON b.linked_pet_id = p.id
      LEFT JOIN sys_user reviewer ON b.reviewed_by = reviewer.id
      LEFT JOIN sys_user canceller ON b.cancelled_by = canceller.id
      WHERE b.id = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  async getBoardingApplicationsByUser(userId) {
    const sql = `
      SELECT b.*,
             p.name AS linked_pet_name,
             p.breed AS linked_pet_breed,
             reviewer.nickname AS reviewer_name
      FROM ${this.tableName} b
      LEFT JOIN user_pet_profile p ON b.linked_pet_id = p.id
      LEFT JOIN sys_user reviewer ON b.reviewed_by = reviewer.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    const [rows] = await this.pool.query(sql, [userId]);
    return rows;
  }

  async getBoardingApplicationList(filters = {}) {
    const {
      page = 1,
      pageSize = 10,
      status,
      keyword,
      sourceType,
      startDateFrom,
      startDateTo
    } = filters;

    let sql = `
      SELECT b.*,
             u.nickname AS user_name,
             u.contact_info AS user_contact,
             reviewer.nickname AS reviewer_name
      FROM ${this.tableName} b
      LEFT JOIN sys_user u ON b.user_id = u.id
      LEFT JOIN sys_user reviewer ON b.reviewed_by = reviewer.id
      WHERE 1=1
    `;

    let countSql = `SELECT COUNT(*) AS total FROM ${this.tableName} b WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (status) {
      sql += ' AND b.status = ?';
      countSql += ' AND b.status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (sourceType) {
      sql += ' AND b.source_type = ?';
      countSql += ' AND b.source_type = ?';
      params.push(sourceType);
      countParams.push(sourceType);
    }

    if (keyword) {
      const value = `%${keyword}%`;
      sql += ' AND (b.pet_name LIKE ? OR u.nickname LIKE ? OR b.contact_phone LIKE ?)';
      countSql += ' AND (b.pet_name LIKE ? OR EXISTS (SELECT 1 FROM sys_user u WHERE u.id = b.user_id AND u.nickname LIKE ?) OR b.contact_phone LIKE ?)';
      params.push(value, value, value);
      countParams.push(value, value, value);
    }

    if (startDateFrom) {
      sql += ' AND b.start_date >= ?';
      countSql += ' AND b.start_date >= ?';
      params.push(startDateFrom);
      countParams.push(startDateFrom);
    }

    if (startDateTo) {
      sql += ' AND b.start_date <= ?';
      countSql += ' AND b.start_date <= ?';
      params.push(startDateTo);
      countParams.push(startDateTo);
    }

    sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const [countRows] = await this.pool.query(countSql, countParams);
    const [rows] = await this.pool.query(sql, params);

    return {
      list: rows,
      total: countRows[0]?.total || 0,
      page: Number(page),
      pageSize: Number(pageSize)
    };
  }

  async updateBoardingApplication(id, patch) {
    return this.update(id, patch);
  }

  async countBoardingApplicationsByStatus() {
    const sql = `
      SELECT status, COUNT(*) AS total
      FROM ${this.tableName}
      GROUP BY status
    `;
    const [rows] = await this.pool.query(sql);
    return rows;
  }
}

module.exports = new BoardingDAO();
