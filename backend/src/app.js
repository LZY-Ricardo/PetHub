const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const serve = require('koa-static');
const path = require('path');

// 中间件
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');

// 路由
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const adoptionRoutes = require('./routes/adoptions');
const lostPetRoutes = require('./routes/lostPets');
const forumRoutes = require('./routes/forum');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');
const boardingRoutes = require('./routes/boarding');
const userPetRoutes = require('./routes/userPets');

const app = new Koa();

// 全局错误处理
app.use(errorHandler);

// CORS跨域
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

// 请求日志
app.use(logger);

// 静态文件服务（用于上传的文件）
const uploadStatic = serve(path.join(__dirname, '../uploads'));
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/uploads/')) {
    const originalPath = ctx.path;
    ctx.path = ctx.path.replace('/uploads', '') || '/';
    await uploadStatic(ctx, next);
    ctx.path = originalPath;
    return;
  }
  await next();
});

// 注册路由
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

app.use(petRoutes.routes());
app.use(petRoutes.allowedMethods());

app.use(adoptionRoutes.routes());
app.use(adoptionRoutes.allowedMethods());

app.use(lostPetRoutes.routes());
app.use(lostPetRoutes.allowedMethods());

app.use(forumRoutes.routes());
app.use(forumRoutes.allowedMethods());

app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

app.use(adminRoutes.routes());
app.use(adminRoutes.allowedMethods());

app.use(uploadRoutes.routes());
app.use(uploadRoutes.allowedMethods());

app.use(notificationRoutes.routes());
app.use(notificationRoutes.allowedMethods());

app.use(boardingRoutes.routes());
app.use(boardingRoutes.allowedMethods());

app.use(userPetRoutes.routes());
app.use(userPetRoutes.allowedMethods());

// 健康检查接口
app.use(async (ctx) => {
  if (ctx.path === '/health') {
    ctx.body = {
      code: 200,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    };
    return;
  }

  // 404处理
  ctx.status = 404;
  ctx.body = {
    code: 404,
    message: '接口不存在',
    path: ctx.path,
    timestamp: new Date().toISOString()
  };
});

module.exports = app;
