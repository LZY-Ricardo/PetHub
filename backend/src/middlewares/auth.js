const { verifyToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/response');

/**
 * JWT认证中间件
 * 验证用户是否已登录
 */
const authMiddleware = async (ctx, next) => {
  try {
    // 获取token
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorized(ctx, '未登录或token已过期');
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // 验证token
    const decoded = verifyToken(token);

    // 将用户信息存储到ctx.state中，供后续使用
    ctx.state.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    await next();
  } catch (error) {
    unauthorized(ctx, 'Token无效或已过期');
  }
};

/**
 * 可选JWT认证中间件
 * 存在且有效则注入用户信息，不阻断匿名访问
 */
const optionalAuthMiddleware = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      ctx.state.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    }
  } catch (error) {
    // 可选认证场景下忽略token错误，按匿名用户处理
  }

  await next();
};

/**
 * 管理员权限中间件
 * 验证用户是否为管理员
 * 必须在authMiddleware之后使用
 */
const adminMiddleware = async (ctx, next) => {
  try {
    if (!ctx.state.user || ctx.state.user.role !== 'admin') {
      const { forbidden } = require('../utils/response');
      forbidden(ctx, '需要管理员权限');
      return;
    }
    await next();
  } catch (error) {
    const { serverError } = require('../utils/response');
    serverError(ctx, '权限验证失败');
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware
};
