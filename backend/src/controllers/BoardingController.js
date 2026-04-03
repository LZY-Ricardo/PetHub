const BoardingService = require('../services/BoardingService');
const { success, error, forbidden } = require('../utils/response');

class BoardingController {
  async createApplication(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const application = await BoardingService.createApplication(ctx.request.body, userId);
      success(ctx, application, '寄养申请提交成功', 201);
    } catch (err) {
      if (
        err.message.includes('不能为空') ||
        err.message.includes('无效') ||
        err.message.includes('不正确') ||
        err.message.includes('必须晚于') ||
        err.message.includes('不存在')
      ) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }

  async getMyApplications(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const result = await BoardingService.getUserApplications(userId);
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getApplicationDetail(ctx) {
    try {
      const { id } = ctx.params;
      const detail = await BoardingService.getApplicationDetail(Number(id), ctx.state.user);
      success(ctx, detail);
    } catch (err) {
      if (err.message === '寄养申请不存在') {
        return error(ctx, err.message, 404);
      }
      if (err.message === '无权限查看该寄养申请') {
        return forbidden(ctx, err.message);
      }
      error(ctx, err.message, 500);
    }
  }

  async cancelApplication(ctx) {
    try {
      const { id } = ctx.params;
      const { cancelReason } = ctx.request.body;
      const userId = ctx.state.user.userId;
      const result = await BoardingService.cancelByUser(Number(id), cancelReason, userId);
      success(ctx, result, '寄养申请已取消');
    } catch (err) {
      if (['寄养申请不存在', '取消原因不能为空', '当前状态不允许执行该操作'].includes(err.message)) {
        return error(ctx, err.message, 400);
      }
      if (err.message === '无权限取消该寄养申请') {
        return forbidden(ctx, err.message);
      }
      error(ctx, err.message, 500);
    }
  }

  async getAdminApplicationList(ctx) {
    try {
      const result = await BoardingService.getAdminApplicationList(ctx.query);
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getAdminApplicationDetail(ctx) {
    try {
      const { id } = ctx.params;
      const result = await BoardingService.getAdminApplicationDetail(Number(id));
      success(ctx, result);
    } catch (err) {
      if (err.message === '寄养申请不存在') {
        return error(ctx, err.message, 404);
      }
      error(ctx, err.message, 500);
    }
  }

  async reviewApplication(ctx) {
    try {
      const { id } = ctx.params;
      const { action, reviewComment } = ctx.request.body;
      const adminUserId = ctx.state.user.userId;
      const result = await BoardingService.reviewApplication(Number(id), action, reviewComment, adminUserId);
      success(ctx, result, '寄养申请审核完成');
    } catch (err) {
      if (['寄养申请不存在', '无效的审核动作', '当前状态不允许执行该操作'].includes(err.message)) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }

  async checkInApplication(ctx) {
    try {
      const { id } = ctx.params;
      const { checkInNote } = ctx.request.body;
      const adminUserId = ctx.state.user.userId;
      const result = await BoardingService.checkInApplication(Number(id), checkInNote, adminUserId);
      success(ctx, result, '已登记入住');
    } catch (err) {
      if (['寄养申请不存在', '当前状态不允许执行该操作'].includes(err.message)) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }

  async completeApplication(ctx) {
    try {
      const { id } = ctx.params;
      const { completionNote } = ctx.request.body;
      const adminUserId = ctx.state.user.userId;
      const result = await BoardingService.completeApplication(Number(id), completionNote, adminUserId);
      success(ctx, result, '寄养已完成');
    } catch (err) {
      if (['寄养申请不存在', '当前状态不允许执行该操作'].includes(err.message)) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }

  async cancelApplicationByAdmin(ctx) {
    try {
      const { id } = ctx.params;
      const { cancelReason } = ctx.request.body;
      const adminUserId = ctx.state.user.userId;
      const result = await BoardingService.cancelByAdmin(Number(id), cancelReason, adminUserId);
      success(ctx, result, '寄养申请已取消');
    } catch (err) {
      if (['寄养申请不存在', '取消原因不能为空', '当前状态不允许执行该操作'].includes(err.message)) {
        return error(ctx, err.message, 400);
      }
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new BoardingController();
