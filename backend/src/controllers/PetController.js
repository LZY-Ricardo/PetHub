const PetService = require('../services/PetService');
const { success, error, forbidden } = require('../utils/response');

/**
 * 宠物控制器
 * 处理宠物相关的请求
 */
class PetController {
  /**
   * 获取宠物列表
   */
  async getPetList(ctx) {
    try {
      const { page = 1, pageSize = 10, status, breed, gender, minAge, maxAge, keyword, species } = ctx.query;

      const filters = {};
      if (status) filters.status = status;
      if (breed) filters.breed = breed;
      if (gender) filters.gender = gender;
      if (minAge) filters.minAge = parseFloat(minAge);
      if (maxAge) filters.maxAge = parseFloat(maxAge);
      if (keyword) filters.keyword = keyword;
      if (species) filters.species = species;

      const result = await PetService.getPetList(
        filters,
        parseInt(page),
        parseInt(pageSize)
      );

      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  /**
   * 获取宠物详情
   */
  async getPetDetail(ctx) {
    try {
      const { id } = ctx.params;
      const pet = await PetService.getPetDetail(parseInt(id));
      success(ctx, pet);
    } catch (err) {
      if (err.message === '宠物不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  /**
   * 创建宠物（管理员）
   */
  async createPet(ctx) {
    try {
      const createdBy = ctx.state.user.userId;
      const petData = ctx.request.body;

      const pet = await PetService.createPet(petData, createdBy);
      success(ctx, pet, '创建成功', 201);
    } catch (err) {
      if (err.message.includes('不能为空') || err.message.includes('参数错误')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  /**
   * 更新宠物信息（管理员）
   */
  async updatePet(ctx) {
    try {
      const { id } = ctx.params;
      const petData = ctx.request.body;

      const pet = await PetService.updatePet(parseInt(id), petData);
      success(ctx, pet, '更新成功');
    } catch (err) {
      if (err.message === '宠物不存在') {
        error(ctx, err.message, 404);
      } else if (err.message.includes('参数错误')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  /**
   * 删除宠物（管理员）
   */
  async deletePet(ctx) {
    try {
      const { id } = ctx.params;

      await PetService.deletePet(parseInt(id));
      success(ctx, null, '删除成功');
    } catch (err) {
      if (err.message === '宠物不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '已领养的宠物不能删除') {
        forbidden(ctx, err.message);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  /**
   * 获取统计数据（管理员）
   */
  async getStatistics(ctx) {
    try {
      const stats = await PetService.getStatistics();
      success(ctx, stats);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new PetController();
