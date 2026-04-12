const BaseDAO = require('./BaseDAO');

/**
 * 宠物DAO
 * 处理宠物信息相关的数据库操作
 */
class PetDAO extends BaseDAO {
  constructor() {
    super('pet_info');
  }

  parsePet(row) {
    if (!row) {
      return row;
    }

    let photos = [];
    try {
      photos = row.photos ? JSON.parse(row.photos) : [];
    } catch (e) {
      photos = row.photos || [];
    }

    return {
      ...row,
      photos
    };
  }

  buildSpeciesFilter(species, sqlParts, params, alias = 'p') {
    if (!species) {
      return;
    }

    const speciesMap = {
      '猫': ['猫', '猫科', '布偶', '英国短毛', '波斯', '暹罗', '折耳', '狸花', '橘猫', '黑白'],
      '狗': ['狗', '金毛', '拉布拉多', '泰迪', '萨摩耶', '柯基', '哈士奇', '比熊', '贵宾', '边境牧羊犬', '中华田园犬'],
      '其他': ['仓鼠', '兔子', '鸟', '龟', '蜥蜴']
    };

    const keywords = speciesMap[species] || [];
    if (!keywords.length) {
      return;
    }

    const breedConditions = keywords.map(() => `${alias}.breed LIKE ?`).join(' OR ');
    sqlParts.push(`AND (${breedConditions})`);
    keywords.forEach((keyword) => params.push(`%${keyword}%`));
  }

  appendFilters(filters, sqlParts, params, alias = 'p') {
    if (filters.status) {
      sqlParts.push(`AND ${alias}.status = ?`);
      params.push(filters.status);
    }

    if (filters.keyword) {
      sqlParts.push(`AND ${alias}.name LIKE ?`);
      params.push(`%${filters.keyword}%`);
    }

    if (filters.breed) {
      sqlParts.push(`AND ${alias}.breed LIKE ?`);
      params.push(`%${filters.breed}%`);
    }

    this.buildSpeciesFilter(filters.species, sqlParts, params, alias);

    if (filters.gender) {
      sqlParts.push(`AND ${alias}.gender = ?`);
      params.push(filters.gender);
    }

    if (filters.minAge !== undefined) {
      sqlParts.push(`AND ${alias}.age >= ?`);
      params.push(filters.minAge);
    }

    if (filters.maxAge !== undefined) {
      sqlParts.push(`AND ${alias}.age <= ?`);
      params.push(filters.maxAge);
    }

    if (filters.sourceType) {
      sqlParts.push(`AND ${alias}.source_type = ?`);
      params.push(filters.sourceType);
    }

    if (filters.submissionStatus) {
      sqlParts.push(`AND ${alias}.submission_status = ?`);
      params.push(filters.submissionStatus);
    }

    if (filters.ownerUserId) {
      sqlParts.push(`AND ${alias}.owner_user_id = ?`);
      params.push(filters.ownerUserId);
    }
  }

  /**
   * 获取宠物列表（分页、筛选）
   */
  async getPetList(filters = {}, page = 1, pageSize = 10, options = {}) {
    const listSqlParts = [
      `
      SELECT p.*, creator.nickname as creator_name, owner.nickname as owner_name
      FROM ${this.tableName} p
      LEFT JOIN sys_user creator ON p.created_by = creator.id
      LEFT JOIN sys_user owner ON p.owner_user_id = owner.id
      WHERE 1=1
      `
    ];
    const listParams = [];
    const countSqlParts = [`SELECT COUNT(*) as total FROM ${this.tableName} p WHERE 1=1`];
    const countParams = [];

    if (!options.isAdminView) {
      listSqlParts.push(`AND p.submission_status = 'approved'`);
      countSqlParts.push(`AND p.submission_status = 'approved'`);
    }

    this.appendFilters(filters, listSqlParts, listParams);
    this.appendFilters(filters, countSqlParts, countParams);

    const [countResult] = await this.pool.query(countSqlParts.join('\n'), countParams);

    listSqlParts.push('ORDER BY p.created_at DESC LIMIT ? OFFSET ?');
    listParams.push(parseInt(pageSize, 10), parseInt((page - 1) * pageSize, 10));

    const [rows] = await this.pool.query(listSqlParts.join('\n'), listParams);

    return {
      list: rows.map((row) => this.parsePet(row)),
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  /**
   * 获取宠物详情（包含创建者信息）
   */
  async getPetDetail(id) {
    const sql = `
      SELECT p.*, creator.nickname as creator_name, owner.nickname as owner_name
      FROM ${this.tableName} p
      LEFT JOIN sys_user creator ON p.created_by = creator.id
      LEFT JOIN sys_user owner ON p.owner_user_id = owner.id
      WHERE p.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * 创建宠物信息
   */
  async createPet(petData, createdBy) {
    const {
      name, breed, gender, age, healthStatus, personality,
      vaccination, sterilized, sourceType = 'platform',
      submissionStatus = 'approved', submissionComment = null,
      status = 'available', photos, remarks, ownerUserId = null
    } = petData;

    const sql = `
      INSERT INTO ${this.tableName}
      (name, breed, gender, age, health_status, personality, vaccination, sterilized,
       source_type, submission_status, submission_comment, status, photos, remarks, created_by, owner_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const photosJson = Array.isArray(photos) ? JSON.stringify(photos) : null;

    const [result] = await this.pool.query(sql, [
      name, breed, gender, age, healthStatus || 'good',
      personality, vaccination, sterilized ? 1 : 0,
      sourceType, submissionStatus, submissionComment,
      status, photosJson, remarks, createdBy, ownerUserId
    ]);

    return result.insertId;
  }

  /**
   * 更新宠物信息（管理员）
   */
  async updatePet(id, petData) {
    const {
      name, breed, gender, age, healthStatus, personality,
      vaccination, sterilized, status, photos, remarks,
      sourceType, submissionStatus, submissionComment, ownerUserId
    } = petData;

    const sql = `
      UPDATE ${this.tableName}
      SET name = ?, breed = ?, gender = ?, age = ?, health_status = ?,
          personality = ?, vaccination = ?, sterilized = ?, source_type = ?,
          submission_status = ?, submission_comment = ?, status = ?,
          photos = ?, remarks = ?, owner_user_id = ?
      WHERE id = ?
    `;

    const photosJson = photos ? (Array.isArray(photos) ? JSON.stringify(photos) : photos) : null;

    const [result] = await this.pool.query(sql, [
      name, breed, gender, age, healthStatus || 'good',
      personality, vaccination, sterilized ? 1 : 0, sourceType,
      submissionStatus, submissionComment, status, photosJson, remarks, ownerUserId, id
    ]);

    return result.affectedRows > 0;
  }

  /**
   * 用户更新自己的送养发布
   */
  async updateUserSubmission(id, userId, petData) {
    const fields = [];
    const params = [];
    const mappings = {
      name: 'name',
      breed: 'breed',
      gender: 'gender',
      age: 'age',
      healthStatus: 'health_status',
      personality: 'personality',
      vaccination: 'vaccination',
      remarks: 'remarks',
      status: 'status',
      submissionStatus: 'submission_status',
      submissionComment: 'submission_comment'
    };

    Object.entries(mappings).forEach(([key, column]) => {
      if (petData[key] !== undefined) {
        fields.push(`${column} = ?`);
        params.push(petData[key]);
      }
    });

    if (petData.sterilized !== undefined) {
      fields.push('sterilized = ?');
      params.push(petData.sterilized ? 1 : 0);
    }

    if (petData.photos !== undefined) {
      fields.push('photos = ?');
      params.push(Array.isArray(petData.photos) ? JSON.stringify(petData.photos) : petData.photos);
    }

    if (!fields.length) {
      return false;
    }

    const sql = `
      UPDATE ${this.tableName}
      SET ${fields.join(', ')}
      WHERE id = ? AND owner_user_id = ?
    `;

    const [result] = await this.pool.query(sql, [...params, id, userId]);
    return result.affectedRows > 0;
  }

  async reviewPetSubmission(id, submissionStatus, submissionComment, petStatus) {
    const sql = `
      UPDATE ${this.tableName}
      SET submission_status = ?, submission_comment = ?, status = ?
      WHERE id = ?
    `;
    const [result] = await this.pool.query(sql, [submissionStatus, submissionComment, petStatus, id]);
    return result.affectedRows > 0;
  }

  /**
   * 删除宠物
   */
  async deletePet(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 更新宠物状态
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
        SUM(CASE WHEN submission_status = 'pending' THEN 1 ELSE 0 END) as submission_pending,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
      FROM ${this.tableName}
    `;

    const [rows] = await this.pool.query(sql);
    return rows[0];
  }
}

module.exports = new PetDAO();
