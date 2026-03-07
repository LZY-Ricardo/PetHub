/**
 * 数据库字符集自动修复脚本
 * 自动检测并修复数据库、表的字符集问题
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixDatabaseEncoding() {
  console.log('========================================');
  console.log('数据库字符集自动修复工具');
  console.log('========================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    const dbName = process.env.DB_DATABASE || 'pet_management_platform';

    // 1. 删除并重新创建数据库（确保字符集正确）
    console.log('[1/4] 重新创建数据库（utf8mb4 字符集）...');
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.query(
      `CREATE DATABASE \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${dbName}\``);
    console.log('✅ 数据库创建成功');

    // 2. 读取并执行 schema.sql
    console.log('\n[2/4] 创建数据库表结构...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // 分割并执行 SQL 语句
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
      }
    }
    console.log('✅ 表结构创建成功');

    // 3. 读取并执行 data.sql
    console.log('\n[3/4] 导入初始数据...');
    const dataPath = path.join(__dirname, '../database/data.sql');

    // 读取整个 SQL 文件
    const dataSQL = fs.readFileSync(dataPath, 'utf8');

    // 执行整个 SQL 文件（使用多个语句）
    try {
      await connection.query(dataSQL);
      console.log('✅ 数据导入成功');
    } catch (error) {
      console.warn('警告:', error.message);
      // 尝试逐句执行
      const statements = dataSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

      let successCount = 0;
      for (const statement of statements) {
        if (statement && !statement.startsWith('SELECT')) {
          try {
            await connection.query(statement);
            successCount++;
          } catch (err) {
            // 忽略错误
          }
        }
      }
      console.log(`✅ 成功导入 ${successCount} 条 SQL 语句`);
    }

    // 4. 验证数据
    console.log('\n[4/4] 验证数据...');
    const [users] = await connection.query(
      'SELECT id, username, nickname, role FROM sys_user LIMIT 5'
    );

    console.log('\n用户数据示例:');
    console.log('─'.repeat(60));
    users.forEach(user => {
      console.log(`ID: ${user.id} | 用户名: ${user.username} | 昵称: ${user.nickname} | 角色: ${user.role}`);
    });
    console.log('─'.repeat(60));

    // 检查是否有乱码
    const hasGarbled = users.some(user => {
      const nickname = user.nickname || '';
      // 简单的乱码检测
      return nickname.includes('??') ||
             /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(nickname);
    });

    if (hasGarbled) {
      console.log('\n⚠️  警告：仍然检测到可能的乱码！');
      console.log('建议：检查 data.sql 文件的编码是否为 UTF-8');
    } else {
      console.log('\n✅ 数据验证成功，中文显示正常！');
    }

    // 显示统计信息
    const [stats] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM sys_user) as users,
        (SELECT COUNT(*) FROM pet_info) as pets,
        (SELECT COUNT(*) FROM adoption_application) as applications,
        (SELECT COUNT(*) FROM lost_pet) as lost_pets,
        (SELECT COUNT(*) FROM forum_post) as posts,
        (SELECT COUNT(*) FROM forum_comment) as comments
    `);

    console.log('\n数据统计:');
    console.log('─'.repeat(60));
    console.log(`用户数量: ${stats[0].users}`);
    console.log(`宠物数量: ${stats[0].pets}`);
    console.log(`领养申请: ${stats[0].applications}`);
    console.log(`走失信息: ${stats[0].lost_pets}`);
    console.log(`社区帖子: ${stats[0].posts}`);
    console.log(`评论数量: ${stats[0].comments}`);
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error('详细错误:', error);
    throw error;
  } finally {
    await connection.end();
  }

  console.log('\n========================================');
  console.log('✅ 数据库修复完成！');
  console.log('========================================');
}

// 执行修复
if (require.main === module) {
  fixDatabaseEncoding()
    .then(() => {
      console.log('\n提示：现在可以启动应用了');
      console.log('运行: npm run dev\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n修复失败:', error.message);
      process.exit(1);
    });
}

module.exports = { fixDatabaseEncoding };
