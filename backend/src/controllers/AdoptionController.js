const AdoptionService = require('../services/AdoptionService');
const { success, error, forbidden } = require('../utils/response');

class AdoptionController {
  async getApplicationList(ctx) {
    try {
      const { page = 1, pageSize = 10, status, keyword } = ctx.query;
      const result = await AdoptionService.getApplicationList(
        parseInt(page),
        parseInt(pageSize),
        { status, keyword: (keyword || '').trim() }
      );
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getApplicationStats(ctx) {
    try {
      const result = await AdoptionService.getApplicationStats();
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getMyApplications(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const applications = await AdoptionService.getUserApplications(userId);
      success(ctx, applications);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getApplicationDetail(ctx) {
    try {
      const result = await AdoptionService.getApplicationDetail(parseInt(ctx.params.id, 10));
      success(ctx, result);
    } catch (err) {
      if (err.message === '申请不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async createApplication(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const applicationData = ctx.request.body;

      const application = await AdoptionService.createApplication(applicationData, userId);
      success(ctx, application, '提交成功', 201);
    } catch (err) {
      if (err.message === '宠物不存在' || err.message.includes('不能为空') || err.message.includes('暂不可领养') || err.message.includes('请勿重复提交')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async reviewApplication(ctx) {
    try {
      const { id } = ctx.params;
      const { status, reviewComment } = ctx.request.body;
      const reviewedBy = ctx.state.user.userId;

      if (!status || !['approved', 'rejected'].includes(status)) {
        return error(ctx, '无效的审核状态', 400);
      }

      await AdoptionService.reviewApplication(parseInt(id), status, reviewComment, reviewedBy);
      success(ctx, null, '审核完成');
    } catch (err) {
      if (err.message === '申请不存在' || err.message === '该申请已被审核') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }
}

module.exports = new AdoptionController();
