-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: localhost    Database: pet_management_platform
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adoption_application`
--

DROP TABLE IF EXISTS `adoption_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adoption_application` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '申请ID',
  `user_id` int NOT NULL COMMENT '申请人ID',
  `pet_id` int NOT NULL COMMENT '宠物ID',
  `reason` text NOT NULL COMMENT '申请理由',
  `experience` text COMMENT '养宠经验',
  `contact` varchar(100) NOT NULL COMMENT '联系方式',
  `address` varchar(255) NOT NULL COMMENT '居住地址',
  `status` enum('pending','approved','rejected') DEFAULT 'pending' COMMENT '审核状态',
  `review_comment` varchar(200) DEFAULT NULL COMMENT '审核意见',
  `reviewed_by` int DEFAULT NULL COMMENT '审核人ID',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT '审核时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_pet_id` (`pet_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `adoption_application_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
  CONSTRAINT `adoption_application_ibfk_2` FOREIGN KEY (`pet_id`) REFERENCES `pet_info` (`id`),
  CONSTRAINT `adoption_application_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='领养申请表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adoption_application`
--

LOCK TABLES `adoption_application` WRITE;
/*!40000 ALTER TABLE `adoption_application` DISABLE KEYS */;
INSERT INTO `adoption_application` VALUES (1,2,1,'我很喜欢金毛，家里有院子，能给它足够的活动空间','养过一只金毛，有经验','13800000002','北京市朝阳区','pending',NULL,NULL,NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(2,3,2,'萨摩耶太可爱了，我想要一只','第一次养狗，已经做好功课','13800000003','上海市浦东新区','pending',NULL,NULL,NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(3,4,3,'中华田园犬很聪明，我想领养','养过2只狗，有经验','13800000004','广州市天河区','pending',NULL,NULL,NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(4,3,12,'喜欢',NULL,'13257995528','江西省南昌市','pending',NULL,NULL,NULL,'2026-03-09 07:22:04','2026-03-09 07:22:04'),(5,3,3,'非常喜欢',NULL,'13257995528','江西省抚州市','approved','ky',1,'2026-03-09 13:27:27','2026-03-09 07:24:41','2026-03-09 13:27:27'),(6,3,5,'好喜欢它呀',NULL,'13257995528','江西省萍乡市','rejected','不予批准',1,'2026-03-09 12:58:49','2026-03-09 07:33:44','2026-03-09 12:58:49');
/*!40000 ALTER TABLE `adoption_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_comment`
--

DROP TABLE IF EXISTS `forum_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_comment` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` int NOT NULL COMMENT '帖子ID',
  `user_id` int NOT NULL COMMENT '评论人ID',
  `content` varchar(500) NOT NULL COMMENT '评论内容',
  `parent_id` int DEFAULT NULL COMMENT '父评论ID（楼中楼）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `forum_comment_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `forum_post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_comment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
  CONSTRAINT `forum_comment_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `forum_comment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='社区评论表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_comment`
--

LOCK TABLES `forum_comment` WRITE;
/*!40000 ALTER TABLE `forum_comment` DISABLE KEYS */;
INSERT INTO `forum_comment` VALUES (1,1,3,'分享得很详细，学到了很多！',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(2,1,4,'请问金毛吃什么狗粮比较好？',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(3,1,2,'我吃的是皇家，感觉还不错，毛发很亮',3,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(5,2,4,'幼犬一天喂3-4次，每次少量多餐。2个月大可以开始打疫苗了',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(6,2,5,'记得找正规宠物医院，疫苗要打全',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(7,2,2,'感谢大家的建议，我会注意的！',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(8,3,6,'训练需要耐心，我花了3个月才教会我的狗坐下和握手',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(9,3,7,'狗狗智商真的大，我看到你的视频了',6,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(10,4,8,'我也买了保险，一年1000多块，但生病了能报销不少',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(11,5,3,'我家猫也不爱吃东西，是不是病了？',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(12,5,4,'建议先去看医生，不吃饭可能是健康问题',NULL,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(25,1,3,'222',NULL,'2026-03-09 07:38:27','2026-03-09 07:38:27'),(26,1,3,'你好',NULL,'2026-03-09 07:42:29','2026-03-09 07:42:29'),(27,1,3,'哈哈\n',NULL,'2026-03-09 07:49:01','2026-03-09 07:49:01'),(28,8,3,'卡哇伊\n',NULL,'2026-03-25 09:23:19','2026-03-25 09:23:19');
/*!40000 ALTER TABLE `forum_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_like`
--

DROP TABLE IF EXISTS `forum_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_like` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  `post_id` int NOT NULL COMMENT '帖子ID',
  `user_id` int NOT NULL COMMENT '点赞人ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_user` (`post_id`,`user_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `forum_like_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `forum_post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子点赞表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_like`
--

LOCK TABLES `forum_like` WRITE;
/*!40000 ALTER TABLE `forum_like` DISABLE KEYS */;
INSERT INTO `forum_like` VALUES (2,1,4,'2026-03-07 13:55:09'),(3,1,5,'2026-03-07 13:55:09'),(4,1,6,'2026-03-07 13:55:09'),(5,2,4,'2026-03-07 13:55:09'),(6,2,5,'2026-03-07 13:55:09'),(7,2,6,'2026-03-07 13:55:09'),(8,3,2,'2026-03-07 13:55:09'),(9,3,3,'2026-03-07 13:55:09'),(10,3,5,'2026-03-07 13:55:09'),(11,3,6,'2026-03-07 13:55:09'),(12,3,7,'2026-03-07 13:55:09'),(13,4,2,'2026-03-07 13:55:09'),(14,4,3,'2026-03-07 13:55:09'),(15,4,5,'2026-03-07 13:55:09'),(16,4,6,'2026-03-07 13:55:09'),(17,4,7,'2026-03-07 13:55:09'),(18,4,8,'2026-03-07 13:55:09'),(19,5,2,'2026-03-07 13:55:09'),(20,5,3,'2026-03-07 13:55:09'),(21,5,6,'2026-03-07 13:55:09'),(22,6,2,'2026-03-07 13:55:09'),(23,6,3,'2026-03-07 13:55:09'),(24,6,4,'2026-03-07 13:55:09'),(25,7,2,'2026-03-07 13:55:09'),(26,7,3,'2026-03-07 13:55:09'),(27,7,4,'2026-03-07 13:55:09'),(28,7,5,'2026-03-07 13:55:09'),(29,7,6,'2026-03-07 13:55:09'),(30,8,2,'2026-03-07 13:55:09'),(32,8,4,'2026-03-07 13:55:09'),(37,1,3,'2026-03-09 08:58:11');
/*!40000 ALTER TABLE `forum_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_post`
--

DROP TABLE IF EXISTS `forum_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_post` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` int NOT NULL COMMENT '发帖人ID',
  `title` varchar(100) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `category` enum('经验分享','求助问答','宠物展示','闲聊灌水') NOT NULL DEFAULT '闲聊灌水' COMMENT '帖子分类',
  `images` json DEFAULT NULL COMMENT '图片URL数组',
  `view_count` int DEFAULT '0' COMMENT '浏览次数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发帖时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `ft_title_content` (`title`,`content`),
  CONSTRAINT `forum_post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='社区帖子表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_post`
--

LOCK TABLES `forum_post` WRITE;
/*!40000 ALTER TABLE `forum_post` DISABLE KEYS */;
INSERT INTO `forum_post` VALUES (1,2,'金毛的饲养经验分享','我养金毛已经3年了，积累了一些经验，想和大家分享一下。首先，金毛每天需要至少1-2小时的运动，不然会破坏家具。其次，定期梳毛非常重要，可以防止打结。饮食方面要注意，金毛容易肥胖，要控制食量...','闲聊灌水',NULL,189,'2026-03-07 13:55:09','2026-03-09 08:58:09'),(2,3,'新手养狗求助','我刚领养了一只2个月大的泰迪，有很多不懂的地方。请问大家：1. 幼犬一天要喂几次？2. 什么时候开始打疫苗？3. 需要注意什么？求各位大神指点！','闲聊灌水',NULL,89,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(3,4,'狗狗训练技巧分享','作为宠物训练师，我想分享一些基本的训练技巧。首先要建立领导地位，让狗狗明白你才是老大。其次，奖励要及时，做对了马上给零食。最重要的是要有耐心，训练需要时间...','闲聊灌水','[\"https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=500\"]',236,'2026-03-07 13:55:09','2026-03-09 14:57:27'),(4,5,'猫咪健康饮食指南','我的猫最近不太爱吃东西，查了很多资料，总结了一些猫咪饮食注意事项。1. 猫是纯肉动物，不能吃素 2. 定时定量喂食比自由采食更好 3. 要保证充足的饮水...','闲聊灌水',NULL,178,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(5,6,'宠物洗澡注意事项','很多新手主人喜欢频繁给宠物洗澡，其实这是不对的。狗狗一般7-10天洗一次澡就够了，猫咪甚至不需要经常洗澡。洗澡太频繁会破坏皮肤保护层，容易得皮肤病...','闲聊灌水',NULL,147,'2026-03-07 13:55:09','2026-03-08 15:50:28'),(6,7,'推荐的好用宠物用品','用了很多宠物用品，给大家推荐几个好用的：1. 自动饮水器（省心）2. 猫砂盆（封闭式的不扬砂）3. 宠物烘干机（洗澡后很快干）...','闲聊灌水','[\"https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=500\"]',267,'2026-03-07 13:55:09','2026-03-07 13:55:09'),(7,8,'关于宠物保险','最近在考虑给狗狗买保险，但是不知道怎么选择。想问问大家有没有买过？哪个保险公司比较好？大概多少钱一年？值得买吗？','闲聊灌水',NULL,100,'2026-03-07 13:55:09','2026-03-09 07:23:51'),(8,3,'SOS','测试哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇','闲聊灌水',NULL,5,'2026-03-09 09:00:52','2026-03-25 09:23:06'),(9,3,'aaaa','ddddddddddddddddddddddddd','经验分享',NULL,1,'2026-03-25 09:23:41','2026-03-25 09:23:41');
/*!40000 ALTER TABLE `forum_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lost_pet`
--

DROP TABLE IF EXISTS `lost_pet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lost_pet` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '走失信息ID',
  `user_id` int NOT NULL COMMENT '发布人ID',
  `name` varchar(50) NOT NULL COMMENT '宠物名称',
  `location` varchar(255) NOT NULL COMMENT '走失地点',
  `lost_time` timestamp NOT NULL COMMENT '走失时间',
  `description` text NOT NULL COMMENT '宠物描述',
  `photos` json NOT NULL COMMENT '照片URL数组',
  `contact` varchar(100) NOT NULL COMMENT '联系方式',
  `is_urgent` tinyint DEFAULT '0' COMMENT '是否紧急：1-是，0-否',
  `is_found` tinyint DEFAULT '0' COMMENT '是否已找到：1-是，0-否',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_urgent` (`is_urgent`),
  KEY `idx_is_found` (`is_found`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `lost_pet_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='走失宠物表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lost_pet`
--

LOCK TABLES `lost_pet` WRITE;
/*!40000 ALTER TABLE `lost_pet` DISABLE KEYS */;
INSERT INTO `lost_pet` VALUES (1,2,'小白','北京市朝阳区望京SOHO附近','2026-03-07 00:00:00','白色比熊，2岁，穿着红色背心，非常亲人，脖子上戴着蓝色项圈','[\"http://localhost:5173/images/pets/cat_2_britishshorthair.jpg\"]','13800000002',1,0,'2026-03-07 13:55:09','2026-03-09 07:05:10'),(2,3,'小黑','上海市浦东新区陆家嘴','2026-03-06 07:30:00','黑色拉布拉多，3岁，体型较大，左眼有泪痕','[\"http://localhost:5173/images/pets/dog_2_samoyed.jpg\"]','13800000003',0,0,'2026-03-07 13:55:09','2026-03-09 07:05:10'),(3,4,'花花','广州市天河区珠江新城','2026-03-07 02:00:00','三花猫，1岁，非常胆小，可能躲在车底','[\"http://localhost:5173/images/pets/dog_1_golden.jpg\"]','13800000004',1,0,'2026-03-07 13:55:09','2026-03-09 07:05:10'),(4,3,'雷家洛','江西省抚州市临川区','2026-03-08 16:00:00','蠢蠢的','[]','13257995528',0,0,'2026-03-09 14:57:15','2026-03-09 14:57:15');
/*!40000 ALTER TABLE `lost_pet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet_info`
--

DROP TABLE IF EXISTS `pet_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '宠物ID',
  `name` varchar(50) NOT NULL COMMENT '宠物名称',
  `breed` varchar(50) NOT NULL COMMENT '品种',
  `gender` enum('male','female') NOT NULL COMMENT '性别',
  `age` decimal(3,1) NOT NULL COMMENT '年龄（岁）',
  `health_status` enum('good','fair','poor') DEFAULT 'good' COMMENT '健康状况',
  `personality` varchar(200) DEFAULT NULL COMMENT '性格特点',
  `vaccination` varchar(200) DEFAULT NULL COMMENT '疫苗接种情况',
  `sterilized` tinyint DEFAULT '0' COMMENT '是否绝育：1-是，0-否',
  `status` enum('available','pending','adopted') DEFAULT 'available' COMMENT '状态',
  `photos` json DEFAULT NULL COMMENT '照片URL数组',
  `remarks` text COMMENT '备注信息',
  `created_by` int NOT NULL COMMENT '创建人ID（管理员）',
  `adopted_by` int DEFAULT NULL COMMENT '领养人ID',
  `adopted_at` timestamp NULL DEFAULT NULL COMMENT '领养时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_breed` (`breed`),
  KEY `idx_gender` (`gender`),
  KEY `idx_created_by` (`created_by`),
  KEY `adopted_by` (`adopted_by`),
  CONSTRAINT `pet_info_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`),
  CONSTRAINT `pet_info_ibfk_2` FOREIGN KEY (`adopted_by`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='宠物信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet_info`
--

LOCK TABLES `pet_info` WRITE;
/*!40000 ALTER TABLE `pet_info` DISABLE KEYS */;
INSERT INTO `pet_info` VALUES (1,'旺财','金毛','male',2.5,'good','温顺友善，喜欢和人互动','已完成',1,'available','[\"/images/pets/dog_1_golden.jpg\"]','非常亲人，适合有孩子的家庭',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:02:46'),(2,'小白','萨摩耶','female',1.5,'good','活泼好动，精力充沛','已完成',1,'available','[\"/images/pets/dog_2_samoyed.jpg\"]','微笑天使，需要大量运动',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:02:46'),(3,'大黄','中华田园犬','male',3.0,'good','忠诚可靠，看家护院','部分完成',0,'adopted','[\"/images/pets/dog_3_rural.jpg\"]','身体健康，适应能力强',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-09 14:26:12'),(4,'毛球','比熊','male',2.0,'fair','安静温和，适合公寓饲养','已完成',1,'available','[\"/images/pets/dog_4_bichon.jpg\"]','性格内向，需要耐心陪伴',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:02:46'),(5,'豆豆','泰迪','female',1.0,'good','聪明伶俐，容易训练','已完成',1,'available','[\"/images/pets/dog_5_poodle.jpg\"]','体型小巧，适合新手',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:03:07'),(6,'欢欢','拉布拉多','male',2.8,'good','友善亲人，智商高','已完成',1,'available','[\"/images/pets/dog_7_labrador2.jpg\"]','工作犬理想选择',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:19:30'),(7,'贝贝','边境牧羊犬','female',1.8,'good','极度聪明，学习能力强','已完成',1,'available','[\"/images/pets/dog_8_border.jpg\"]','需要大量运动和智力刺激',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:19:30'),(8,'奥利奥','柯基','male',2.2,'good','友好活泼，腿部可爱','已完成',1,'available','[\"/images/pets/dog_9_corgi.jpg\"]','警惕性高，喜欢叫',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:19:30'),(9,'咪咪','布偶猫','female',1.5,'good','温柔粘人，喜欢抱抱','已完成',1,'available','[\"/images/pets/cat_1_ragdoll.jpg\"]','性格安静，适合室内饲养',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:19:30'),(10,'花花','英国短毛猫','female',2.0,'good','独立自主，不爱粘人','已完成',1,'available','[\"/images/pets/cat_2_britishshorthair.jpg\"]','容易照顾，适合忙碌家庭',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:19:30'),(11,'雪球','波斯猫','male',3.0,'fair','优雅高贵，安静沉稳','已完成',1,'available','[\"/images/pets/cat_3_persian.jpg\"]','需要定期美容护理',1,NULL,NULL,'2026-03-07 13:55:09','2026-03-08 15:19:30'),(12,'小黑','苏格兰折耳猫','male',1.8,'good','安静温顺，喜欢撒娇',NULL,0,'available','[\"/images/pets/cat_1_ragdoll.jpg\"]','耳朵小巧可爱，性格很好',1,NULL,NULL,'2026-03-07 14:30:29','2026-03-08 15:56:35');
/*!40000 ALTER TABLE `pet_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user`
--

DROP TABLE IF EXISTS `sys_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `nickname` varchar(50) NOT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `role` enum('user','admin') DEFAULT 'user' COMMENT '角色',
  `contact_info` varchar(100) DEFAULT NULL COMMENT '联系方式',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user`
--

LOCK TABLES `sys_user` WRITE;
/*!40000 ALTER TABLE `sys_user` DISABLE KEYS */;
INSERT INTO `sys_user` VALUES (1,'admin','$2b$10$IpVifpmSaYamaEQNONo4Z.3m1MtPTqrfR0q3yO2fLwRDonCIL7lTy','系统管理员','http://localhost:3000/uploads/avatar/1773124873955_326014595.jpg','admin','13800000001',1,'2026-03-07 13:55:09','2026-03-10 06:41:13'),(2,'xiaoming','$2b$10$b/URrXWcIMwWWBO4xYXBa.6jztTYIS7R3tpAgdBNsiBw3PmvN54p.','小明','/uploads/avatar/default_dog.svg','user','13800000002',1,'2026-03-07 13:55:09','2026-03-10 06:37:44'),(3,'xiaohong','$2b$10$TIgqImNYbYMNMYwfw6Edm.GtW.zHAS8ezKQpg/sCtQkovEN1py2iS','小红','/uploads/avatar/default_rabbit.svg','user','13800000003',1,'2026-03-07 13:55:09','2026-03-10 06:37:44'),(4,'david','$2b$10$TIgqImNYbYMNMYwfw6Edm.GtW.zHAS8ezKQpg/sCtQkovEN1py2iS','大卫','/uploads/avatar/default_fox.svg','user','13800000004',1,'2026-03-07 13:55:09','2026-03-10 06:37:44'),(5,'lucy','$2b$10$TIgqImNYbYMNMYwfw6Edm.GtW.zHAS8ezKQpg/sCtQkovEN1py2iS','露西','/uploads/avatar/default_cat.svg','user','13800000005',1,'2026-03-07 13:55:09','2026-03-10 06:37:44'),(6,'tom','$2b$10$TIgqImNYbYMNMYwfw6Edm.GtW.zHAS8ezKQpg/sCtQkovEN1py2iS','汤姆','/uploads/avatar/default_bear.svg','user','13800000006',1,'2026-03-07 13:55:09','2026-03-10 06:37:44'),(7,'jerry','$2b$10$TIgqImNYbYMNMYwfw6Edm.GtW.zHAS8ezKQpg/sCtQkovEN1py2iS','杰瑞','/uploads/avatar/default_hamster.svg','user','13800000007',1,'2026-03-07 13:55:09','2026-03-10 06:37:44'),(8,'amy','$2b$10$TIgqImNYbYMNMYwfw6Edm.GtW.zHAS8ezKQpg/sCtQkovEN1py2iS','艾米','/uploads/avatar/default_penguin.svg','user','13800000008',1,'2026-03-07 13:55:09','2026-03-10 06:37:44');
/*!40000 ALTER TABLE `sys_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notification`
--

DROP TABLE IF EXISTS `user_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` int NOT NULL COMMENT '接收用户ID',
  `type` enum('adoption','forum','system') DEFAULT 'system' COMMENT '通知类型',
  `title` varchar(120) NOT NULL COMMENT '通知标题',
  `content` varchar(500) NOT NULL COMMENT '通知内容',
  `related_type` varchar(50) DEFAULT NULL COMMENT '关联资源类型',
  `related_id` int DEFAULT NULL COMMENT '关联资源ID',
  `action_url` varchar(255) DEFAULT NULL COMMENT '点击跳转地址',
  `is_read` tinyint DEFAULT '0' COMMENT '是否已读：1-已读，0-未读',
  `read_at` timestamp NULL DEFAULT NULL COMMENT '已读时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `user_notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户通知表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification`
--

LOCK TABLES `user_notification` WRITE;
/*!40000 ALTER TABLE `user_notification` DISABLE KEYS */;
INSERT INTO `user_notification` VALUES (1,1,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',1,'2026-03-25 10:00:06','2026-03-25 09:59:58'),(2,2,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',0,NULL,'2026-03-25 09:59:58'),(3,3,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',1,'2026-03-25 10:00:34','2026-03-25 09:59:58'),(4,4,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',0,NULL,'2026-03-25 09:59:58'),(5,5,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',0,NULL,'2026-03-25 09:59:58'),(6,6,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',0,NULL,'2026-03-25 09:59:58'),(7,7,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',0,NULL,'2026-03-25 09:59:58'),(8,8,'system','系统维护','服务器维护时间 一整天','system_announcement',NULL,'/notifications',0,NULL,'2026-03-25 09:59:58');
/*!40000 ALTER TABLE `user_notification` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-26 20:20:06
