-- 宠物管理与服务平台数据库初始化脚本
-- 数据库: pet_management_platform
-- 字符集: utf8mb4

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `pet_management_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pet_management_platform`;

-- ============================================
-- 1. 用户表 (sys_user)
-- ============================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `role` ENUM('user', 'admin') DEFAULT 'user' COMMENT '角色',
  `contact_info` VARCHAR(100) DEFAULT NULL COMMENT '联系方式',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (`username`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 宠物信息表 (pet_info)
-- ============================================
DROP TABLE IF EXISTS `pet_info`;
CREATE TABLE `pet_info` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '宠物ID',
  `name` VARCHAR(50) NOT NULL COMMENT '宠物名称',
  `breed` VARCHAR(50) NOT NULL COMMENT '品种',
  `gender` ENUM('male', 'female') NOT NULL COMMENT '性别',
  `age` DECIMAL(3,1) NOT NULL COMMENT '年龄（岁）',
  `health_status` ENUM('good', 'fair', 'poor') DEFAULT 'good' COMMENT '健康状况',
  `personality` VARCHAR(200) DEFAULT NULL COMMENT '性格特点',
  `vaccination` VARCHAR(200) DEFAULT NULL COMMENT '疫苗接种情况',
  `sterilized` TINYINT DEFAULT 0 COMMENT '是否绝育：1-是，0-否',
  `status` ENUM('available', 'pending', 'adopted') DEFAULT 'available' COMMENT '状态',
  `photos` JSON COMMENT '照片URL数组',
  `remarks` TEXT DEFAULT NULL COMMENT '备注信息',
  `created_by` INT NOT NULL COMMENT '创建人ID（管理员）',
  `adopted_by` INT DEFAULT NULL COMMENT '领养人ID',
  `adopted_at` TIMESTAMP NULL COMMENT '领养时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_status (`status`),
  INDEX idx_breed (`breed`),
  INDEX idx_gender (`gender`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `sys_user`(`id`),
  FOREIGN KEY (`adopted_by`) REFERENCES `sys_user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物信息表';

-- ============================================
-- 3. 领养申请表 (adoption_application)
-- ============================================
DROP TABLE IF EXISTS `adoption_application`;
CREATE TABLE `adoption_application` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '申请ID',
  `user_id` INT NOT NULL COMMENT '申请人ID',
  `pet_id` INT NOT NULL COMMENT '宠物ID',
  `reason` TEXT NOT NULL COMMENT '申请理由',
  `experience` TEXT DEFAULT NULL COMMENT '养宠经验',
  `contact` VARCHAR(100) NOT NULL COMMENT '联系方式',
  `address` VARCHAR(255) NOT NULL COMMENT '居住地址',
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
  `review_comment` VARCHAR(200) DEFAULT NULL COMMENT '审核意见',
  `reviewed_by` INT DEFAULT NULL COMMENT '审核人ID',
  `reviewed_at` TIMESTAMP NULL COMMENT '审核时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_pet_id (`pet_id`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`),
  FOREIGN KEY (`pet_id`) REFERENCES `pet_info`(`id`),
  FOREIGN KEY (`reviewed_by`) REFERENCES `sys_user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='领养申请表';

-- ============================================
-- 4. 走失宠物表 (lost_pet)
-- ============================================
DROP TABLE IF EXISTS `lost_pet`;
CREATE TABLE `lost_pet` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '走失信息ID',
  `user_id` INT NOT NULL COMMENT '发布人ID',
  `name` VARCHAR(50) NOT NULL COMMENT '宠物名称',
  `location` VARCHAR(255) NOT NULL COMMENT '走失地点',
  `lost_time` TIMESTAMP NOT NULL COMMENT '走失时间',
  `description` TEXT NOT NULL COMMENT '宠物描述',
  `photos` JSON NOT NULL COMMENT '照片URL数组',
  `contact` VARCHAR(100) NOT NULL COMMENT '联系方式',
  `is_urgent` TINYINT DEFAULT 0 COMMENT '是否紧急：1-是，0-否',
  `is_found` TINYINT DEFAULT 0 COMMENT '是否已找到：1-是，0-否',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_is_urgent (`is_urgent`),
  INDEX idx_is_found (`is_found`),
  INDEX idx_created_at (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='走失宠物表';

-- ============================================
-- 5. 社区帖子表 (forum_post)
-- ============================================
DROP TABLE IF EXISTS `forum_post`;
CREATE TABLE `forum_post` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '发帖人ID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `images` JSON DEFAULT NULL COMMENT '图片URL数组',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发帖时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_created_at (`created_at`),
  FULLTEXT INDEX ft_title_content (`title`, `content`),
  FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子表';

-- ============================================
-- 6. 社区评论表 (forum_comment)
-- ============================================
DROP TABLE IF EXISTS `forum_comment`;
CREATE TABLE `forum_comment` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '评论人ID',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `parent_id` INT DEFAULT NULL COMMENT '父评论ID（楼中楼）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_post_id (`post_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_created_at (`created_at`),
  FOREIGN KEY (`post_id`) REFERENCES `forum_post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `forum_comment`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区评论表';

-- ============================================
-- 7. 帖子点赞表 (forum_like)
-- ============================================
DROP TABLE IF EXISTS `forum_like`;
CREATE TABLE `forum_like` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  `post_id` INT NOT NULL COMMENT '帖子ID',
  `user_id` INT NOT NULL COMMENT '点赞人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  UNIQUE KEY uk_post_user (`post_id`, `user_id`),
  INDEX idx_post_id (`post_id`),
  INDEX idx_user_id (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `forum_post`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子点赞表';
