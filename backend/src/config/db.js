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

/**
 * 修复历史数据：申请已通过但宠物状态未标记为 adopted
 */
const ensureAdoptionPetStatusConsistency = async () => {
  try {
    const [result] = await promisePool.query(`
      UPDATE pet_info p
      INNER JOIN (
        SELECT DISTINCT pet_id
        FROM adoption_application
        WHERE status = 'approved'
      ) a ON a.pet_id = p.id
      SET p.status = 'adopted'
      WHERE p.status <> 'adopted'
    `);

    if (result.affectedRows > 0) {
      console.log(`🛠️  已修复 ${result.affectedRows} 条宠物状态（approved -> adopted）`);
    }
  } catch (error) {
    console.error('❌ 宠物领养状态一致性修复失败:', error.message);
    throw error;
  }
};

/**
 * 确保 user_notification 表存在
 */
const ensureNotificationTable = async () => {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS user_notification (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
        user_id INT NOT NULL COMMENT '接收用户ID',
        type ENUM('adoption', 'forum', 'system') DEFAULT 'system' COMMENT '通知类型',
        title VARCHAR(120) NOT NULL COMMENT '通知标题',
        content VARCHAR(500) NOT NULL COMMENT '通知内容',
        related_type VARCHAR(50) DEFAULT NULL COMMENT '关联资源类型',
        related_id INT DEFAULT NULL COMMENT '关联资源ID',
        action_url VARCHAR(255) DEFAULT NULL COMMENT '点击跳转地址',
        is_read TINYINT DEFAULT 0 COMMENT '是否已读：1-已读，0-未读',
        read_at TIMESTAMP NULL COMMENT '已读时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户通知表'
    `);
  } catch (error) {
    console.error('❌ user_notification 自动迁移失败:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  ensureForumCategoryColumn,
  ensureAdoptionPetStatusConsistency,
  ensureNotificationTable
};
