const LostPetDAO = require('../dao/LostPetDAO');

class LostPetService {
  async getLostList(page, pageSize, isFound, isUrgent) {
    return await LostPetDAO.getLostList(page, pageSize, isFound, isUrgent);
  }

  async getLostDetail(id) {
    const lost = await LostPetDAO.getLostDetail(id);
    if (!lost) {
      throw new Error('走失信息不存在');
    }
    return lost;
  }

  async createLostPet(data, userId) {
    const { name, location, lostTime, description, photos, contact } = data;

    if (!name || !location || !lostTime || !description || !contact) {
      throw new Error('必填字段不能为空');
    }

    const id = await LostPetDAO.createLostPet(data, userId);
    return await LostPetDAO.getLostDetail(id);
  }

  async updateLostPet(id, data) {
    const lost = await LostPetDAO.findById(id);
    if (!lost) {
      throw new Error('走失信息不存在');
    }

    await LostPetDAO.updateLostPet(id, data);
    return await LostPetDAO.getLostDetail(id);
  }

  async deleteLostPet(id) {
    const lost = await LostPetDAO.findById(id);
    if (!lost) {
      throw new Error('走失信息不存在');
    }

    await LostPetDAO.deleteLostPet(id);
    return { success: true };
  }

  async markAsFound(id) {
    const lost = await LostPetDAO.findById(id);
    if (!lost) {
      throw new Error('走失信息不存在');
    }

    if (lost.is_found) {
      throw new Error('该宠物已标记为找到');
    }

    await LostPetDAO.markAsFound(id);
    return { success: true };
  }

  async getUserLostPets(userId) {
    return await LostPetDAO.getUserLostPets(userId);
  }
}

module.exports = new LostPetService();
