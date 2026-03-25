const UserService = require('../services/UserService');
const { success, error } = require('../utils/response');

/**
 * 认证控制器
 * 处理用户注册、登录等认证相关请求
 */
class AuthController {
  /**
   * 用户注册
   */
  async register(ctx) {
    try {
      const { username, password, nickname, contactInfo } = ctx.request.body;

      // 参数验证
      if (!username || !password || !nickname) {
        return error(ctx, '用户名、密码和昵称不能为空', 400);
      }

      if (password.length < 6) {
        return error(ctx, '密码长度不能少于6位', 400);
      }

      // 注册用户
      const user = await UserService.register({
        username,
        password,
        nickname,
        role: 'user',
        contactInfo
      });

      success(ctx, user, '注册成功', 201);
    } catch (err) {
      if (err.message === '用户名已存在') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  /**
   * 用户登录
   */
  async login(ctx) {
    try {
      const { username, password } = ctx.request.body;

      // 参数验证
      if (!username || !password) {
        return error(ctx, '用户名和密码不能为空', 400);
      }

      // 登录
      const result = await UserService.login(username, password);

      success(ctx, result, '登录成功');
    } catch (err) {
      error(ctx, err.message, 401);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getUserInfo(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const user = await UserService.getUserInfo(userId);
      success(ctx, user);
    } catch (err) {
      error(ctx, err.message, 404);
    }
  }

  /**
   * 获取当前用户账号统计
   */
  async getUserStats(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const stats = await UserService.getUserStats(userId);
      success(ctx, stats);
    } catch (err) {
      error(ctx, err.message, 404);
    }
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const { nickname, avatar, contactInfo } = ctx.request.body;

      const user = await UserService.updateUser(userId, {
        nickname,
        avatar,
        contactInfo
      });

      success(ctx, user, '更新成功');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const { oldPassword, newPassword } = ctx.request.body;

      // 参数验证
      if (!oldPassword || !newPassword) {
        return error(ctx, '旧密码和新密码不能为空', 400);
      }

      if (newPassword.length < 6) {
        return error(ctx, '新密码长度不能少于6位', 400);
      }

      await UserService.changePassword(userId, oldPassword, newPassword);
      success(ctx, null, '密码修改成功');
    } catch (err) {
      if (err.message === '原密码错误') {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }
}

module.exports = new AuthController();
