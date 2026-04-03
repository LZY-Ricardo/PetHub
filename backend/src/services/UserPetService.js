const UserPetDAO = require('../dao/UserPetDAO');

class UserPetService {
  validatePetData(data) {
    const requiredFields = ['name', 'petType'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field}不能为空`);
      }
    }
  }

  normalizeRecord(record) {
    if (!record) {
      return null;
    }

    return {
      ...record,
      petType: record.pet_type,
      healthNotes: record.health_notes,
      isSterilized: Number(record.is_sterilized) === 1
    };
  }

  async getUserPetList(userId) {
    const records = await UserPetDAO.getUserPetList(userId);
    return records.map(record => this.normalizeRecord(record));
  }

  async getUserPetDetail(id, userId) {
    const record = await UserPetDAO.getUserPetById(Number(id));
    if (!record) {
      throw new Error('宠物档案不存在');
    }

    if (record.user_id !== userId) {
      throw new Error('无权限访问该宠物档案');
    }

    return this.normalizeRecord(record);
  }

  async createUserPet(data, userId) {
    this.validatePetData(data);

    const petId = await UserPetDAO.createUserPet({
      user_id: userId,
      name: data.name,
      pet_type: data.petType,
      breed: data.breed || null,
      gender: data.gender || 'unknown',
      age: data.age || null,
      health_notes: data.healthNotes || null,
      is_sterilized: data.isSterilized ? 1 : 0,
      remark: data.remark || null
    });

    return this.getUserPetDetail(petId, userId);
  }

  async updateUserPet(id, data, userId) {
    const existing = await UserPetDAO.getUserPetById(Number(id));
    if (!existing) {
      throw new Error('宠物档案不存在');
    }

    if (existing.user_id !== userId) {
      throw new Error('无权限编辑该宠物档案');
    }

    this.validatePetData(data);

    await UserPetDAO.updateUserPet(Number(id), {
      name: data.name,
      pet_type: data.petType,
      breed: data.breed || null,
      gender: data.gender || 'unknown',
      age: data.age || null,
      health_notes: data.healthNotes || null,
      is_sterilized: data.isSterilized ? 1 : 0,
      remark: data.remark || null
    });

    return this.getUserPetDetail(Number(id), userId);
  }

  async deleteUserPet(id, userId) {
    const existing = await UserPetDAO.getUserPetById(Number(id));
    if (!existing) {
      throw new Error('宠物档案不存在');
    }

    if (existing.user_id !== userId) {
      throw new Error('无权限删除该宠物档案');
    }

    await UserPetDAO.delete(Number(id));
    return { success: true };
  }
}

module.exports = new UserPetService();
