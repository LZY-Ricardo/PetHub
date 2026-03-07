/**
 * 请求日志中间件
 * 记录所有请求信息
 */
const logger = async (ctx, next) => {
  const start = Date.now();
  const { method, url } = ctx;
  const userId = ctx.state.user?.userId || 'anonymous';

  console.log(`\n📝 [${new Date().toLocaleTimeString('zh-CN')}] ${method} ${url}`);
  if (ctx.state.user) {
    console.log(`👤 用户ID: ${userId}, 角色: ${ctx.state.user.role}`);
  }

  await next();

  const duration = Date.now() - start;
  const status = ctx.status;

  console.log(`✅ 状态: ${status} | 耗时: ${duration}ms`);
};

module.exports = logger;
