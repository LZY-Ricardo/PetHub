const { promisePool } = require('../config/db');

/**
 * 基础DAO类
 * 提供通用的数据库操作方法
 */
class BaseDAO {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = promisePool;
  }

  /**
   * 查询所有记录
   * @param {object} where - WHERE条件
   * @param {string} orderBy - 排序字段
   * @param {number} limit - 限制数量
   * @param {number} offset - 偏移量
   */
  async findAll(where = {}, orderBy = 'id DESC', limit = null, offset = 0) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(where));
    }

    sql += ` ORDER BY ${orderBy}`;

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  /**
   * 根据ID查询
   * @param {number} id - 记录ID
   */
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const [rows] = await this.pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * 插入记录
   * @param {object} data - 要插入的数据
   */
  async insert(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await this.pool.query(sql, values);

    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }

  /**
   * 更新记录
   * @param {number} id - 记录ID
   * @param {object} data - 要更新的数据
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const [result] = await this.pool.query(sql, [...values, id]);

    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    };
  }

  /**
   * 删除记录
   * @param {number} id - 记录ID
   */
  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.pool.execute(sql, [id]);

    return {
      affectedRows: result.affectedRows
    };
  }

  /**
   * 统计记录数
   * @param {object} where - WHERE条件
   */
  async count(where = {}) {
    let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const params = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => `${key} = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(where));
    }

    const [rows] = await this.pool.query(sql, params);
    return rows[0].total;
  }

  /**
   * 执行自定义SQL查询
   * @param {string} sql - SQL语句
   * @param {array} params - 参数数组
   */
  async execute(sql, params = []) {
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
}

module.exports = BaseDAO;
