const { serverError } = require('../utils/response');

/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误
 */
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('❌ 发生错误:', error);

    // 如果已经有响应，则不处理
    if (ctx.body || ctx.status !== 404) {
      return;
    }

    // 处理不同类型的错误
    if (error.name === 'ValidationError') {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '参数验证失败',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return;
    }

    if (error.code === 'ER_DUP_ENTRY') {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '数据已存在',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return;
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '关联数据不存在',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return;
    }

    // 默认服务器错误
    serverError(ctx, error.message || '服务器内部错误');
  }
};

module.exports = errorHandler;
