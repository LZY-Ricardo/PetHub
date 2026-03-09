require('dotenv').config();
const app = require('./app');
const { testConnection, ensureForumCategoryColumn } = require('./config/db');

const PORT = process.env.PORT || 3000;

/**
 * 启动服务器
 */
const startServer = async () => {
  try {
    // 测试数据库连接
    console.log('🔗 正在连接数据库...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务器启动终止');
      process.exit(1);
    }

    // 自动迁移：确保论坛分类字段存在
    await ensureForumCategoryColumn();

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log('🚀 宠物管理与服务平台后端服务已启动');
      console.log('=================================');
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log(`📚 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================\n');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n⏹️  正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  正在关闭服务器...');
  process.exit(0);
});
