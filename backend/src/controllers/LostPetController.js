const LostPetService = require('../services/LostPetService');
const { success, error } = require('../utils/response');

class LostPetController {
  async getLostList(ctx) {
    try {
      const { page = 1, pageSize = 10, isFound, isUrgent } = ctx.query;
      const result = await LostPetService.getLostList(
        parseInt(page),
        parseInt(pageSize),
        isFound === 'true' ? true : (isFound === 'false' ? false : null),
        isUrgent === 'true' ? true : (isUrgent === 'false' ? false : null)
      );
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getLostDetail(ctx) {
    try {
      const { id } = ctx.params;
      const lost = await LostPetService.getLostDetail(parseInt(id));
      success(ctx, lost);
    } catch (err) {
      if (err.message === '走失信息不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async createLostPet(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const data = ctx.request.body;

      const lost = await LostPetService.createLostPet(data, userId);
      success(ctx, lost, '发布成功', 201);
    } catch (err) {
      if (err.message.includes('不能为空')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async updateLostPet(ctx) {
    try {
      const { id } = ctx.params;
      const data = ctx.request.body;

      const lost = await LostPetService.updateLostPet(parseInt(id), data);
      success(ctx, lost, '更新成功');
    } catch (err) {
      if (err.message === '走失信息不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async deleteLostPet(ctx) {
    try {
      const { id } = ctx.params;
      await LostPetService.deleteLostPet(parseInt(id));
      success(ctx, null, '删除成功');
    } catch (err) {
      if (err.message === '走失信息不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async markAsFound(ctx) {
    try {
      const { id } = ctx.params;
      await LostPetService.markAsFound(parseInt(id));
      success(ctx, null, '标记成功');
    } catch (err) {
      if (err.message === '走失信息不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '该宠物已标记为找到') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async getMyLostPets(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const lostPets = await LostPetService.getUserLostPets(userId);
      success(ctx, lostPets);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new LostPetController();
