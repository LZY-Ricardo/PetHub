const UserService = require('../services/UserService');
const { success, error } = require('../utils/response');

/**
 * 用户管理控制器（管理员）
 */
class UserController {
  async getAdminAccountList(ctx) {
    try {
      const { page = 1, pageSize = 10, keyword = '' } = ctx.query;
      const result = await UserService.getAdminAccountList(
        parseInt(page, 10),
        parseInt(pageSize, 10),
        keyword
      );
      success(ctx, result, '获取成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getUserList(ctx) {
    try {
      const { page = 1, pageSize = 10, role = 'user', keyword = '' } = ctx.query;
      const result = await UserService.getUserList(
        parseInt(page, 10),
        parseInt(pageSize, 10),
        role,
        keyword
      );
      success(ctx, result, '获取成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async updateUserStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;
      const parsedStatus = Number(status);

      if (![0, 1].includes(parsedStatus)) {
        return error(ctx, '状态值必须为0或1', 400);
      }

      await UserService.updateUserStatus(parseInt(id, 10), parsedStatus);
      success(ctx, null, '更新成功');
    } catch (err) {
      if (err.message === '用户不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '管理员账号不允许在此处修改状态') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }
}

module.exports = new UserController();
