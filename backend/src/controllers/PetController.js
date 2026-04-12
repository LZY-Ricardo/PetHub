const PetService = require('../services/PetService');
const NotificationService = require('../services/NotificationService');
const { success, error, forbidden } = require('../utils/response');

/**
 * 宠物控制器
 * 处理宠物相关的请求
 */
class PetController {
  async getPetList(ctx) {
    try {
      const {
        page = 1,
        pageSize = 10,
        status,
        breed,
        gender,
        minAge,
        maxAge,
        keyword,
        species,
        sourceType,
        submissionStatus
      } = ctx.query;

      const filters = {};
      if (status) filters.status = status;
      if (breed) filters.breed = breed;
      if (gender) filters.gender = gender;
      if (minAge) filters.minAge = parseFloat(minAge);
      if (maxAge) filters.maxAge = parseFloat(maxAge);
      if (keyword) filters.keyword = keyword;
      if (species) filters.species = species;
      if (sourceType) filters.sourceType = sourceType;
      if (submissionStatus) filters.submissionStatus = submissionStatus;

      const result = await PetService.getPetList(
        filters,
        parseInt(page, 10),
        parseInt(pageSize, 10),
        { isAdminView: ctx.state.user?.role === 'admin' }
      );

      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getPetDetail(ctx) {
    try {
      const { id } = ctx.params;
      const pet = await PetService.getPetDetail(parseInt(id, 10), ctx.state.user);
      success(ctx, pet);
    } catch (err) {
      if (err.message === '宠物不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async createPet(ctx) {
    try {
      const createdBy = ctx.state.user.userId;
      const pet = await PetService.createPet(ctx.request.body, createdBy);
      success(ctx, pet, '创建成功', 201);
    } catch (err) {
      if (err.message.includes('不能为空') || err.message.includes('参数错误')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async updatePet(ctx) {
    try {
      const pet = await PetService.updatePet(parseInt(ctx.params.id, 10), ctx.request.body);
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

  async deletePet(ctx) {
    try {
      await PetService.deletePet(parseInt(ctx.params.id, 10));
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

  async getStatistics(ctx) {
    try {
      const stats = await PetService.getStatistics();
      success(ctx, stats);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async createUserPetSubmission(ctx) {
    try {
      const pet = await PetService.createUserPetSubmission(ctx.request.body, ctx.state.user.userId);
      success(ctx, pet, '发布成功，等待审核', 201);
    } catch (err) {
      if (err.message.includes('不能为空') || err.message.includes('参数错误')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async getMyPetSubmissions(ctx) {
    try {
      const list = await PetService.getUserPetSubmissions(ctx.state.user.userId);
      success(ctx, list);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async updateMyPetSubmission(ctx) {
    try {
      const pet = await PetService.updateUserPetSubmission(
        parseInt(ctx.params.id, 10),
        ctx.request.body,
        ctx.state.user.userId
      );
      success(ctx, pet, '更新成功');
    } catch (err) {
      if (err.message === '送养发布不存在') {
        error(ctx, err.message, 404);
      } else if (
        err.message === '当前状态不可编辑' ||
        err.message.includes('参数错误') ||
        err.message.includes('不能为空')
      ) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async resubmitMyPetSubmission(ctx) {
    try {
      const pet = await PetService.resubmitUserPetSubmission(
        parseInt(ctx.params.id, 10),
        ctx.state.user.userId
      );
      success(ctx, pet, '已重新提交审核');
    } catch (err) {
      if (err.message === '送养发布不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '当前状态不可重新提交') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async getPendingPetSubmissions(ctx) {
    try {
      const { page = 1, pageSize = 20 } = ctx.query;
      const result = await PetService.getPendingPetSubmissions(parseInt(page, 10), parseInt(pageSize, 10));
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async reviewPetSubmission(ctx) {
    try {
      const pet = await PetService.reviewPetSubmission(
        parseInt(ctx.params.id, 10),
        ctx.request.body.status,
        ctx.request.body.reviewComment,
        ctx.state.user.userId,
        NotificationService
      );
      success(ctx, pet, '审核完成');
    } catch (err) {
      if (err.message === '送养发布不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '仅用户送养发布需要审核' || err.message === '审核状态无效') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }
}

module.exports = new PetController();
