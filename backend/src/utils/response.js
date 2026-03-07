/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {object} ctx - Koa上下文
 * @param {*} data - 返回数据
 * @param {string} message - 提示信息
 * @param {number} code - 状态码
 */
const success = (ctx, data = null, message = '操作成功', code = 200) => {
  ctx.body = {
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  ctx.status = code;
};

/**
 * 失败响应
 * @param {object} ctx - Koa上下文
 * @param {string} message - 错误信息
 * @param {number} code - 状态码
 * @param {*} data - 附加数据
 */
const error = (ctx, message = '操作失败', code = 500, data = null) => {
  ctx.body = {
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  ctx.status = code;
};

/**
 * 参数错误响应
 */
const paramsError = (ctx, message = '参数错误') => {
  error(ctx, message, 400);
};

/**
 * 未授权响应
 */
const unauthorized = (ctx, message = '未登录或token已过期') => {
  error(ctx, message, 401);
};

/**
 * 禁止访问响应
 */
const forbidden = (ctx, message = '无权限访问') => {
  error(ctx, message, 403);
};

/**
 * 资源未找到响应
 */
const notFound = (ctx, message = '资源不存在') => {
  error(ctx, message, 404);
};

/**
 * 服务器错误响应
 */
const serverError = (ctx, message = '服务器内部错误') => {
  error(ctx, message, 500);
};

module.exports = {
  success,
  error,
  paramsError,
  unauthorized,
  forbidden,
  notFound,
  serverError
};
