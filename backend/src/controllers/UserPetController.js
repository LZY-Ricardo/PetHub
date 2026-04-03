const UserPetService = require('../services/UserPetService');
const { success, error, forbidden } = require('../utils/response');

class UserPetController {
  async getMyPetList(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const list = await UserPetService.getUserPetList(userId);
      success(ctx, list);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getMyPetDetail(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const detail = await UserPetService.getUserPetDetail(ctx.params.id, userId);
      success(ctx, detail);
    } catch (err) {
      if (err.message === '宠物档案不存在') {
        return error(ctx, err.message, 404);
      }
      if (err.message === '无权限访问该宠物档案') {
        return forbidden(ctx, err.message);
      }
      error(ctx, err.message, 500);
    }
  }

  async createMyPet(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const pet = await UserPetService.createUserPet(ctx.request.body, userId);
      success(ctx, pet, '宠物档案创建成功', 201);
    } catch (err) {
      if (err.message.includes('不能为空')) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }

  async updateMyPet(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const pet = await UserPetService.updateUserPet(ctx.params.id, ctx.request.body, userId);
      success(ctx, pet, '宠物档案更新成功');
    } catch (err) {
      if (err.message === '宠物档案不存在') {
        return error(ctx, err.message, 404);
      }
      if (err.message.includes('无权限')) {
        return forbidden(ctx, err.message);
      }
      if (err.message.includes('不能为空')) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }

  async deleteMyPet(ctx) {
    try {
      const userId = ctx.state.user.userId;
      await UserPetService.deleteUserPet(ctx.params.id, userId);
      success(ctx, null, '宠物档案删除成功');
    } catch (err) {
      if (err.message === '宠物档案不存在') {
        return error(ctx, err.message, 404);
      }
      if (err.message.includes('无权限')) {
        return forbidden(ctx, err.message);
      }
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new UserPetController();
