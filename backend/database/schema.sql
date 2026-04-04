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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';

-- ============================================
-- 2. 宠物信息表 (pet_info)
-- ============================================
DROP TABLE IF EXISTS `pet_info`;

CREATE TABLE `pet_info` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '宠物ID',
    `name` VARCHAR(50) NOT NULL COMMENT '宠物名称',
    `breed` VARCHAR(50) NOT NULL COMMENT '品种',
    `gender` ENUM('male', 'female') NOT NULL COMMENT '性别',
    `age` DECIMAL(3, 1) NOT NULL COMMENT '年龄（岁）',
    `health_status` ENUM('good', 'fair', 'poor') DEFAULT 'good' COMMENT '健康状况',
    `personality` VARCHAR(200) DEFAULT NULL COMMENT '性格特点',
    `vaccination` VARCHAR(200) DEFAULT NULL COMMENT '疫苗接种情况',
    `sterilized` TINYINT DEFAULT 0 COMMENT '是否绝育：1-是，0-否',
    `source_type` ENUM('platform', 'user') DEFAULT 'platform' COMMENT '发布来源',
    `submission_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' COMMENT '发布审核状态',
    `submission_comment` VARCHAR(200) DEFAULT NULL COMMENT '审核备注',
    `status` ENUM(
        'available',
        'pending',
        'adopted',
        'off_shelf'
    ) DEFAULT 'available' COMMENT '状态',
    `photos` JSON COMMENT '照片URL数组',
    `remarks` TEXT DEFAULT NULL COMMENT '备注信息',
    `created_by` INT NOT NULL COMMENT '创建人ID（管理员）',
    `owner_user_id` INT DEFAULT NULL COMMENT '送养发布用户ID',
    `adopted_by` INT DEFAULT NULL COMMENT '领养人ID',
    `adopted_at` TIMESTAMP NULL COMMENT '领养时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_status (`status`),
    INDEX idx_breed (`breed`),
    INDEX idx_gender (`gender`),
    INDEX idx_created_by (`created_by`),
    INDEX idx_source_type (`source_type`),
    INDEX idx_submission_status (`submission_status`),
    INDEX idx_owner_user_id (`owner_user_id`),
    FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`),
    FOREIGN KEY (`owner_user_id`) REFERENCES `sys_user` (`id`),
    FOREIGN KEY (`adopted_by`) REFERENCES `sys_user` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '宠物信息表';

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
    `status` ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending' COMMENT '审核状态',
    `review_comment` VARCHAR(200) DEFAULT NULL COMMENT '审核意见',
    `reviewed_by` INT DEFAULT NULL COMMENT '审核人ID',
    `reviewed_at` TIMESTAMP NULL COMMENT '审核时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (`user_id`),
    INDEX idx_pet_id (`pet_id`),
    INDEX idx_status (`status`),
    INDEX idx_created_at (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
    FOREIGN KEY (`pet_id`) REFERENCES `pet_info` (`id`),
    FOREIGN KEY (`reviewed_by`) REFERENCES `sys_user` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '领养申请表';

-- ============================================
-- 4. 用户宠物档案表 (user_pet_profile)
-- ============================================
DROP TABLE IF EXISTS `boarding_application`;
DROP TABLE IF EXISTS `user_pet_profile`;

CREATE TABLE `user_pet_profile` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户宠物档案ID',
    `user_id` INT NOT NULL COMMENT '所属用户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '宠物名称',
    `pet_type` VARCHAR(50) NOT NULL COMMENT '宠物类型',
    `breed` VARCHAR(100) DEFAULT NULL COMMENT '品种',
    `gender` ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
    `age` VARCHAR(50) DEFAULT NULL COMMENT '年龄描述',
    `health_notes` TEXT DEFAULT NULL COMMENT '健康与照料说明',
    `is_sterilized` TINYINT DEFAULT 0 COMMENT '是否绝育',
    `remark` TEXT DEFAULT NULL COMMENT '备注',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_pet_user_id (`user_id`),
    INDEX idx_user_pet_created_at (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户宠物档案表';

-- ============================================
-- 5. 公益寄养申请表 (boarding_application)
-- ============================================
CREATE TABLE `boarding_application` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '寄养申请ID',
    `user_id` INT NOT NULL COMMENT '申请人ID',
    `status` ENUM(
        'pending',
        'confirmed',
        'boarding',
        'completed',
        'cancelled',
        'rejected'
    ) DEFAULT 'pending' COMMENT '寄养状态',
    `source_type` ENUM('profile', 'manual') NOT NULL COMMENT '宠物来源',
    `linked_pet_id` INT DEFAULT NULL COMMENT '关联宠物档案ID',
    `start_date` DATETIME NOT NULL COMMENT '寄养开始时间',
    `end_date` DATETIME NOT NULL COMMENT '寄养结束时间',
    `contact_phone` VARCHAR(30) NOT NULL COMMENT '联系方式',
    `emergency_contact` VARCHAR(100) DEFAULT NULL COMMENT '紧急联系人',
    `special_care_notes` TEXT DEFAULT NULL COMMENT '特殊照料说明',
    `remark` TEXT DEFAULT NULL COMMENT '申请备注',
    `pet_name` VARCHAR(100) NOT NULL COMMENT '宠物名称快照',
    `pet_type` VARCHAR(50) DEFAULT NULL COMMENT '宠物类型快照',
    `pet_breed` VARCHAR(100) DEFAULT NULL COMMENT '宠物品种快照',
    `pet_age` VARCHAR(50) DEFAULT NULL COMMENT '宠物年龄快照',
    `pet_gender` VARCHAR(20) DEFAULT NULL COMMENT '宠物性别快照',
    `pet_health_notes` TEXT DEFAULT NULL COMMENT '宠物健康说明快照',
    `reviewed_by` INT DEFAULT NULL COMMENT '审核管理员ID',
    `reviewed_at` TIMESTAMP NULL COMMENT '审核时间',
    `review_comment` TEXT DEFAULT NULL COMMENT '审核备注',
    `cancelled_by_role` ENUM('user', 'admin') DEFAULT NULL COMMENT '取消发起角色',
    `cancelled_by` INT DEFAULT NULL COMMENT '取消发起人ID',
    `cancel_reason` TEXT DEFAULT NULL COMMENT '取消原因',
    `checked_in_at` TIMESTAMP NULL COMMENT '入住登记时间',
    `check_in_note` TEXT DEFAULT NULL COMMENT '入住备注',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',
    `completion_note` TEXT DEFAULT NULL COMMENT '完成备注',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_boarding_user_id (`user_id`),
    INDEX idx_boarding_status (`status`),
    INDEX idx_boarding_start_date (`start_date`),
    INDEX idx_boarding_created_at (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
    FOREIGN KEY (`linked_pet_id`) REFERENCES `user_pet_profile` (`id`),
    FOREIGN KEY (`reviewed_by`) REFERENCES `sys_user` (`id`),
    FOREIGN KEY (`cancelled_by`) REFERENCES `sys_user` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '公益寄养申请表';

-- ============================================
-- 6. 用户通知表 (user_notification)
-- ============================================
DROP TABLE IF EXISTS `user_notification`;

CREATE TABLE `user_notification` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    `user_id` INT NOT NULL COMMENT '接收用户ID',
    `type` ENUM('adoption', 'forum', 'system', 'boarding') DEFAULT 'system' COMMENT '通知类型',
    `title` VARCHAR(120) NOT NULL COMMENT '通知标题',
    `content` VARCHAR(500) NOT NULL COMMENT '通知内容',
    `related_type` VARCHAR(50) DEFAULT NULL COMMENT '关联资源类型',
    `related_id` INT DEFAULT NULL COMMENT '关联资源ID',
    `action_url` VARCHAR(255) DEFAULT NULL COMMENT '点击跳转地址',
    `is_read` TINYINT DEFAULT 0 COMMENT '是否已读：1-已读，0-未读',
    `read_at` TIMESTAMP NULL COMMENT '已读时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (`user_id`),
    INDEX idx_is_read (`is_read`),
    INDEX idx_created_at (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户通知表';

-- ============================================
-- 7. 走失宠物表 (lost_pet)
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
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '走失宠物表';

-- ============================================
-- 8. 社区帖子表 (forum_post)
-- ============================================
DROP TABLE IF EXISTS `forum_post`;

CREATE TABLE `forum_post` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
    `user_id` INT NOT NULL COMMENT '发帖人ID',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容',
    `category` ENUM(
        '经验分享',
        '求助问答',
        '宠物展示',
        '闲聊灌水'
    ) NOT NULL DEFAULT '闲聊灌水' COMMENT '帖子分类',
    `images` JSON DEFAULT NULL COMMENT '图片URL数组',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发帖时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (`user_id`),
    INDEX idx_created_at (`created_at`),
    FULLTEXT INDEX ft_title_content (`title`, `content`),
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '社区帖子表';

-- ============================================
-- 9. 社区评论表 (forum_comment)
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
    FOREIGN KEY (`post_id`) REFERENCES `forum_post` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
    FOREIGN KEY (`parent_id`) REFERENCES `forum_comment` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '社区评论表';

-- ============================================
-- 10. 帖子点赞表 (forum_like)
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
    FOREIGN KEY (`post_id`) REFERENCES `forum_post` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '帖子点赞表';
