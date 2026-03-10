-- 宠物管理与服务平台模拟数据脚本
USE `pet_management_platform`;

-- 禁用外键检查，以便导入数据
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 插入用户数据
-- ============================================
-- 密码都是 '123456' 的bcrypt哈希值（10轮）
INSERT INTO
    `sys_user` (
        `username`,
        `password`,
        `nickname`,
        `role`,
        `contact_info`,
        `avatar`,
        `status`
    )
VALUES (
        'admin',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '系统管理员',
        'admin',
        '13800000001',
        '/uploads/avatar/default_panda.svg',
        1
    ),
    (
        'xiaoming',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '小明',
        'user',
        '13800000002',
        '/uploads/avatar/default_dog.svg',
        1
    ),
    (
        'xiaohong',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '小红',
        'user',
        '13800000003',
        '/uploads/avatar/default_rabbit.svg',
        1
    ),
    (
        'david',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '大卫',
        'user',
        '13800000004',
        '/uploads/avatar/default_fox.svg',
        1
    ),
    (
        'lucy',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '露西',
        'user',
        '13800000005',
        '/uploads/avatar/default_cat.svg',
        1
    ),
    (
        'tom',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '汤姆',
        'user',
        '13800000006',
        '/uploads/avatar/default_bear.svg',
        1
    ),
    (
        'jerry',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '杰瑞',
        'user',
        '13800000007',
        '/uploads/avatar/default_hamster.svg',
        1
    ),
    (
        'amy',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl6pKYwwhzC3BMvB8ZF5q0x/svq',
        '艾米',
        'user',
        '13800000008',
        '/uploads/avatar/default_penguin.svg',
        1
    );

-- ============================================
-- 2. 插入宠物数据
-- ============================================
INSERT INTO
    `pet_info` (
        `name`,
        `breed`,
        `gender`,
        `age`,
        `health_status`,
        `personality`,
        `vaccination`,
        `sterilized`,
        `status`,
        `photos`,
        `remarks`,
        `created_by`
    )
VALUES (
        '旺财',
        '金毛',
        'male',
        2.5,
        'good',
        '温顺友善，喜欢和人互动',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1552053831-7f94e00e0?w=500"]',
        '非常亲人，适合有孩子的家庭',
        1
    ),
    (
        '小白',
        '萨摩耶',
        'female',
        1.5,
        'good',
        '活泼好动，精力充沛',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=500"]',
        '微笑天使，需要大量运动',
        1
    ),
    (
        '大黄',
        '中华田园犬',
        'male',
        3.0,
        'good',
        '忠诚可靠，看家护院',
        '部分完成',
        0,
        'available',
        '["https://images.unsplash.com/photo-1583511655857-d19b40a73654?w=500"]',
        '身体健康，适应能力强',
        1
    ),
    (
        '毛球',
        '比熊',
        'male',
        2.0,
        'fair',
        '安静温和，适合公寓饲养',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1583511655857-19b33f0d00f9?w=500"]',
        '性格内向，需要耐心陪伴',
        1
    ),
    (
        '豆豆',
        '泰迪',
        'female',
        1.0,
        'good',
        '聪明伶俐，容易训练',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1517423528366-a0f9ac4f4a34?w=500"]',
        '体型小巧，适合新手',
        1
    ),
    (
        '欢欢',
        '拉布拉多',
        'male',
        2.8,
        'good',
        '友善亲人，智商高',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1579213830180-43f2b00e3df4?w=500"]',
        '工作犬理想选择',
        1
    ),
    (
        '贝贝',
        '边境牧羊犬',
        'female',
        1.8,
        'good',
        '极度聪明，学习能力强',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1567855183510-453cb1ec50c7?w=500"]',
        '需要大量运动和智力刺激',
        1
    ),
    (
        '奥利奥',
        '柯基',
        'male',
        2.2,
        'good',
        '友好活泼，腿部可爱',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1543466835-00a7907e93f2?w=500"]',
        '警惕性高，喜欢叫',
        1
    ),
    (
        '咪咪',
        '布偶猫',
        'female',
        1.5,
        'good',
        '温柔粘人，喜欢抱抱',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1513245533350-63f7f5b69d1f?w=500"]',
        '性格安静，适合室内饲养',
        1
    ),
    (
        '花花',
        '英国短毛猫',
        'female',
        2.0,
        'good',
        '独立自主，不爱粘人',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1574158672694-35a42d9230a1?w=500"]',
        '容易照顾，适合忙碌家庭',
        1
    ),
    (
        '雪球',
        '波斯猫',
        'male',
        3.0,
        'fair',
        '优雅高贵，安静沉稳',
        '已完成',
        1,
        'available',
        '["https://images.unsplash.com/photo-1543852786-1cf6626ebaf8f?w=500"]',
        '需要定期美容护理',
        1
    );

-- ============================================
-- 3. 插入走失宠物数据
-- ============================================
INSERT INTO
    `lost_pet` (
        `user_id`,
        `name`,
        `location`,
        `lost_time`,
        `description`,
        `photos`,
        `contact`,
        `is_urgent`,
        `is_found`
    )
VALUES (
        2,
        '小白',
        '北京市朝阳区望京SOHO附近',
        '2026-03-07 08:00:00',
        '白色比熊，2岁，穿着红色背心，非常亲人，脖子上戴着蓝色项圈',
        '["https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=500"]',
        '13800000002',
        1,
        0
    ),
    (
        3,
        '小黑',
        '上海市浦东新区陆家嘴',
        '2026-03-06 15:30:00',
        '黑色拉布拉多，3岁，体型较大，左眼有泪痕',
        '["https://images.unsplash.com/photo-1579213830180-43f2b00e3df4?w=500"]',
        '13800000003',
        0,
        0
    ),
    (
        4,
        '花花',
        '广州市天河区珠江新城',
        '2026-03-07 10:00:00',
        '三花猫，1岁，非常胆小，可能躲在车底',
        '["https://images.unsplash.com/photo-1513245533350-63f7f5b69d1f?w=500"]',
        '13800000004',
        1,
        0
    );

-- ============================================
-- 4. 插入社区帖子数据
-- ============================================
INSERT INTO
    `forum_post` (
        `user_id`,
        `title`,
        `content`,
        `category`,
        `images`,
        `view_count`
    )
VALUES (
        2,
        '金毛的饲养经验分享',
        '我养金毛已经3年了，积累了一些经验，想和大家分享一下。首先，金毛每天需要至少1-2小时的运动，不然会破坏家具。其次，定期梳毛非常重要，可以防止打结。饮食方面要注意，金毛容易肥胖，要控制食量...',
        '经验分享',
        NULL,
        156
    ),
    (
        3,
        '新手养狗求助',
        '我刚领养了一只2个月大的泰迪，有很多不懂的地方。请问大家：1. 幼犬一天要喂几次？2. 什么时候开始打疫苗？3. 需要注意什么？求各位大神指点！',
        '求助问答',
        NULL,
        89
    ),
    (
        4,
        '狗狗训练技巧分享',
        '作为宠物训练师，我想分享一些基本的训练技巧。首先要建立领导地位，让狗狗明白你才是老大。其次，奖励要及时，做对了马上给零食。最重要的是要有耐心，训练需要时间...',
        '经验分享',
        '["https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=500"]',
        234
    ),
    (
        5,
        '猫咪健康饮食指南',
        '我的猫最近不太爱吃东西，查了很多资料，总结了一些猫咪饮食注意事项。1. 猫是纯肉动物，不能吃素 2. 定时定量喂食比自由采食更好 3. 要保证充足的饮水...',
        '经验分享',
        NULL,
        178
    ),
    (
        6,
        '宠物洗澡注意事项',
        '很多新手主人喜欢频繁给宠物洗澡，其实这是不对的。狗狗一般7-10天洗一次澡就够了，猫咪甚至不需要经常洗澡。洗澡太频繁会破坏皮肤保护层，容易得皮肤病...',
        '经验分享',
        NULL,
        145
    ),
    (
        7,
        '推荐的好用宠物用品',
        '用了很多宠物用品，给大家推荐几个好用的：1. 自动饮水器（省心）2. 猫砂盆（封闭式的不扬砂）3. 宠物烘干机（洗澡后很快干）...',
        '宠物展示',
        '["https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=500"]',
        267
    ),
    (
        8,
        '关于宠物保险',
        '最近在考虑给狗狗买保险，但是不知道怎么选择。想问问大家有没有买过？哪个保险公司比较好？大概多少钱一年？值得买吗？',
        '闲聊灌水',
        NULL,
        98
    );

-- ============================================
-- 5. 插入评论数据
-- ============================================
INSERT INTO
    `forum_comment` (
        `post_id`,
        `user_id`,
        `content`,
        `parent_id`
    )
VALUES (1, 3, '分享得很详细，学到了很多！', NULL),
    (1, 4, '请问金毛吃什么狗粮比较好？', NULL),
    (1, 2, '我吃的是皇家，感觉还不错，毛发很亮', 3),
    (1, 3, '好的，谢谢推荐！', 4),
    (
        2,
        4,
        '幼犬一天喂3-4次，每次少量多餐。2个月大可以开始打疫苗了',
        NULL
    ),
    (2, 5, '记得找正规宠物医院，疫苗要打全', NULL),
    (2, 2, '感谢大家的建议，我会注意的！', NULL),
    (
        3,
        6,
        '训练需要耐心，我花了3个月才教会我的狗坐下和握手',
        NULL
    ),
    (3, 7, '狗狗智商真的大，我看到你的视频了', 6),
    (
        4,
        8,
        '我也买了保险，一年1000多块，但生病了能报销不少',
        NULL
    ),
    (
        5,
        3,
        '我家猫也不爱吃东西，是不是病了？',
        NULL
    ),
    (
        5,
        4,
        '建议先去看医生，不吃饭可能是健康问题',
        NULL
    );

-- ============================================
-- 6. 插入点赞数据
-- ============================================
INSERT INTO
    `forum_like` (`post_id`, `user_id`)
VALUES (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (2, 4),
    (2, 5),
    (2, 6),
    (3, 2),
    (3, 3),
    (3, 5),
    (3, 6),
    (3, 7),
    (4, 2),
    (4, 3),
    (4, 5),
    (4, 6),
    (4, 7),
    (4, 8),
    (5, 2),
    (5, 3),
    (5, 6),
    (6, 2),
    (6, 3),
    (6, 4),
    (7, 2),
    (7, 3),
    (7, 4),
    (7, 5),
    (7, 6),
    (8, 2),
    (8, 3),
    (8, 4);

-- ============================================
-- 7. 插入领养申请数据（测试用）
-- ============================================
INSERT INTO
    `adoption_application` (
        `user_id`,
        `pet_id`,
        `reason`,
        `experience`,
        `contact`,
        `address`,
        `status`
    )
VALUES (
        2,
        1,
        '我很喜欢金毛，家里有院子，能给它足够的活动空间',
        '养过一只金毛，有经验',
        '13800000002',
        '北京市朝阳区',
        'pending'
    ),
    (
        3,
        2,
        '萨摩耶太可爱了，我想要一只',
        '第一次养狗，已经做好功课',
        '13800000003',
        '上海市浦东新区',
        'pending'
    ),
    (
        4,
        3,
        '中华田园犬很聪明，我想领养',
        '养过2只狗，有经验',
        '13800000004',
        '广州市天河区',
        'pending'
    );

-- 显示插入结果统计
SELECT '数据库初始化完成！' AS '状态';

SELECT COUNT(*) AS '用户数量' FROM sys_user;

SELECT COUNT(*) AS '宠物数量' FROM pet_info;

SELECT COUNT(*) AS '走失信息' FROM lost_pet;

SELECT COUNT(*) AS '社区帖子' FROM forum_post;

SELECT COUNT(*) AS '评论数量' FROM forum_comment;

SELECT COUNT(*) AS '点赞数量' FROM forum_like;

SELECT COUNT(*) AS '领养申请' FROM adoption_application;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;