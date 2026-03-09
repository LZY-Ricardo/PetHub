const mysql = require('mysql2');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'pet_management_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+08:00'
});

// 使用 promise 包装，支持 async/await
const promisePool = pool.promise();

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ 数据库连接成功');
    console.log(`📊 连接数据库: ${process.env.DB_DATABASE}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

/**
 * 确保 forum_post 表存在 category 字段
 * 用于兼容旧数据库结构
 */
const ensureForumCategoryColumn = async () => {
  try {
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'forum_post' AND COLUMN_NAME = 'category'
    `, [process.env.DB_DATABASE || 'pet_management_platform']);

    if (columns.length === 0) {
      console.log('🛠️  检测到 forum_post.category 缺失，正在自动迁移...');
      await promisePool.query(`
        ALTER TABLE forum_post
        ADD COLUMN category ENUM('经验分享', '求助问答', '宠物展示', '闲聊灌水')
        NOT NULL DEFAULT '闲聊灌水' COMMENT '帖子分类'
        AFTER content
      `);
      console.log('✅ forum_post.category 自动迁移完成');
    }

    // 兜底修复历史空值
    await promisePool.query(`
      UPDATE forum_post
      SET category = '闲聊灌水'
      WHERE category IS NULL OR category = ''
    `);
  } catch (error) {
    console.error('❌ forum_post.category 自动迁移失败:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  ensureForumCategoryColumn
};
