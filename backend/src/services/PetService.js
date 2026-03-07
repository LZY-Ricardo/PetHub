const PetDAO = require('../dao/PetDAO');

/**
 * 宠物服务
 * 处理宠物相关的业务逻辑
 */
class PetService {
  /**
   * 获取宠物列表
   * @param {object} filters - 筛选条件
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   */
  async getPetList(filters, page, pageSize) {
    const result = await PetDAO.getPetList(filters, page, pageSize);

    // 解析photos JSON
    result.list = result.list.map(pet => {
      let photos = [];
      try {
        photos = pet.photos ? JSON.parse(pet.photos) : [];
      } catch (e) {
        photos = pet.photos || [];
      }
      return {
        ...pet,
        photos
      };
    });

    return result;
  }

  /**
   * 获取宠物详情
   * @param {number} id - 宠物ID
   */
  async getPetDetail(id) {
    const pet = await PetDAO.getPetDetail(id);

    if (!pet) {
      throw new Error('宠物不存在');
    }

    // 解析photos JSON
    let photos = [];
    try {
      photos = pet.photos ? JSON.parse(pet.photos) : [];
    } catch (e) {
      photos = pet.photos || [];
    }

    return {
      ...pet,
      photos
    };
  }

  /**
   * 创建宠物
   * @param {object} petData - 宠物数据
   * @param {number} createdBy - 创建人ID
   */
  async createPet(petData, createdBy) {
    // 验证必填字段
    const requiredFields = ['name', 'breed', 'gender', 'age'];
    for (const field of requiredFields) {
      if (!petData[field]) {
        throw new Error(`${field}不能为空`);
      }
    }

    // 验证性别
    if (!['male', 'female'].includes(petData.gender)) {
      throw new Error('性别参数错误');
    }

    // 验证年龄
    if (petData.age < 0 || petData.age > 30) {
      throw new Error('年龄参数错误');
    }

    // 验证健康状态
    if (petData.healthStatus && !['good', 'fair', 'poor'].includes(petData.healthStatus)) {
      throw new Error('健康状态参数错误');
    }

    // 验证状态
    if (petData.status && !['available', 'pending', 'adopted'].includes(petData.status)) {
      throw new Error('状态参数错误');
    }

    const petId = await PetDAO.createPet(petData, createdBy);
    return await this.getPetDetail(petId);
  }

  /**
   * 更新宠物信息
   * @param {number} id - 宠物ID
   * @param {object} petData - 更新的数据
   */
  async updatePet(id, petData) {
    const pet = await PetDAO.findById(id);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    // 验证性别
    if (petData.gender && !['male', 'female'].includes(petData.gender)) {
      throw new Error('性别参数错误');
    }

    // 验证健康状态
    if (petData.healthStatus && !['good', 'fair', 'poor'].includes(petData.healthStatus)) {
      throw new Error('健康状态参数错误');
    }

    // 验证状态
    if (petData.status && !['available', 'pending', 'adopted'].includes(petData.status)) {
      throw new Error('状态参数错误');
    }

    await PetDAO.updatePet(id, petData);
    return await this.getPetDetail(id);
  }

  /**
   * 删除宠物
   * @param {number} id - 宠物ID
   */
  async deletePet(id) {
    const pet = await PetDAO.findById(id);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    if (pet.status === 'adopted') {
      throw new Error('已领养的宠物不能删除');
    }

    await PetDAO.deletePet(id);
    return { success: true };
  }

  /**
   * 获取统计数据
   */
  async getStatistics() {
    return await PetDAO.getStatistics();
  }
}

module.exports = new PetService();
