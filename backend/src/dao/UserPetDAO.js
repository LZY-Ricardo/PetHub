const BaseDAO = require('./BaseDAO');

class UserPetDAO extends BaseDAO {
  constructor() {
    super('user_pet_profile');
  }

  async getUserPetList(userId) {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await this.pool.query(sql, [userId]);
    return rows;
  }

  async getUserPetById(id) {
    const sql = `
      SELECT *
      FROM ${this.tableName}
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  async createUserPet(data) {
    const result = await this.insert(data);
    return result.insertId;
  }

  async updateUserPet(id, patch) {
    return this.update(id, patch);
  }
}

module.exports = new UserPetDAO();
