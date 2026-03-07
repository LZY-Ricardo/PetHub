-- ============================================
-- 数据库字符集修复脚本
-- 用于解决中文乱码问题
-- ============================================

-- 1. 删除旧数据库并重新创建(确保字符集正确)
DROP DATABASE IF EXISTS `pet_management_platform`;
CREATE DATABASE `pet_management_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pet_management_platform`;

-- 2. 设置会话字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 3. 显示当前字符集设置
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 说明：运行此脚本后，请重新运行 schema.sql 和 data.sql
-- 导入命令示例：
-- mysql -u root -p --default-character-set=utf8mb4 < fix_encoding.sql
-- mysql -u root -p --default-character-set=utf8mb4 pet_management_platform < schema.sql
-- mysql -u root -p --default-character-set=utf8mb4 pet_management_platform < data.sql
