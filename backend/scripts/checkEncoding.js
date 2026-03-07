/**
 * 数据库字符集检测和修复脚本
 * 用于检测和修复数据库中文乱码问题
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndFixEncoding() {
  console.log('========================================');
  console.log('数据库字符集检测工具');
  console.log('========================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'pet_management_platform',
    charset: 'utf8mb4'
  });

  try {
    // 1. 检查数据库字符集
    console.log('[1] 检查数据库字符集...');
    const [dbInfo] = await connection.execute(
      'SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [process.env.DB_DATABASE || 'pet_management_platform']
    );

    console.log('数据库字符集:', dbInfo[0].DEFAULT_CHARACTER_SET_NAME);
    console.log('数据库排序规则:', dbInfo[0].DEFAULT_COLLATION_NAME);

    if (dbInfo[0].DEFAULT_CHARACTER_SET_NAME !== 'utf8mb4') {
      console.log('⚠️  警告：数据库不是 utf8mb4 字符集！');
      console.log('修复建议：执行 SQL: ALTER DATABASE pet_management_platform CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;');
    } else {
      console.log('✅ 数据库字符集正确');
    }

    console.log('');

    // 2. 检查表的字符集
    console.log('[2] 检查表的字符集...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_COLLATION
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      AND TABLE_TYPE = 'BASE TABLE'
    `, [process.env.DB_DATABASE || 'pet_management_platform']);

    let needFixTables = [];
    tables.forEach(table => {
      const charset = table.TABLE_COLLATION.split('_')[0];
      if (charset !== 'utf8mb4') {
        console.log(`⚠️  表 ${table.TABLE_NAME} 使用字符集: ${charset}`);
        needFixTables.push(table.TABLE_NAME);
      } else {
        console.log(`✅ 表 ${table.TABLE_NAME} 字符集正确`);
      }
    });

    console.log('');

    // 3. 检查连接字符集
    console.log('[3] 检查连接字符集...');
    const [charsetVars] = await connection.execute('SHOW VARIABLES LIKE "character_set%"');
    charsetVars.forEach(row => {
      console.log(`${row.Variable_name}: ${row.Value}`);
    });

    console.log('');

    // 4. 测试中文数据
    console.log('[4] 测试中文数据...');
    try {
      const [users] = await connection.execute('SELECT id, username, nickname FROM sys_user LIMIT 3');
      console.log('用户数据示例:');
      users.forEach(user => {
        console.log(`  ID: ${user.id}, 用户名: ${user.username}, 昵称: ${user.nickname}`);
      });

      // 检查是否包含乱码
      const hasGarbled = users.some(user => {
        const str = user.nickname || '';
        return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/.test(str) ||
               /[??]/.test(str) ||
               str.includes('â') || str.includes('€');
      });

      if (hasGarbled) {
        console.log('⚠️  警告：检测到可能的乱码数据！');
        console.log('建议：重新导入数据或使用修复脚本');
      } else {
        console.log('✅ 中文数据正常');
      }
    } catch (error) {
      console.log('⚠️  无法测试数据（表可能不存在）:', error.message);
    }

    console.log('');

    // 5. 生成修复建议
    if (needFixTables.length > 0) {
      console.log('[5] 生成修复 SQL...');
      console.log('-- 复制以下 SQL 到 MySQL 客户端执行:');
      console.log('--');
      needFixTables.forEach(tableName => {
        console.log(`ALTER TABLE ${tableName} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      });
      console.log('--');
    } else {
      console.log('[5] 无需修复');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
  }

  console.log('\n========================================');
  console.log('检测完成');
  console.log('========================================');
}

// 执行检测
checkAndFixEncoding().catch(console.error);
