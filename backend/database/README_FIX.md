# 数据库中文乱码修复指南

## 问题说明

如果数据库中的中文数据显示为乱码，这通常是由于以下原因造成的：

1. **SQL文件编码问题**：data.sql 文件不是以 UTF-8 编码保存的
2. **导入时字符集设置错误**：导入数据时没有指定正确的字符集
3. **数据库连接配置问题**：连接数据库时没有使用 utf8mb4 字符集

## 解决方案

### 方案一：使用自动化脚本（推荐）

#### Windows 用户

1. 打开命令提示符（CMD）或 PowerShell
2. 进入 backend 目录：
   ```cmd
   cd f:\myProjects\pet\backend
   ```
3. 运行批处理脚本：
   ```cmd
   database\rebuild_database.bat
   ```
4. 输入 MySQL 密码
5. 等待脚本执行完成

#### Linux/Mac 用户

1. 打开终端
2. 进入 backend 目录：
   ```bash
   cd f:\myProjects\pet\backend
   ```
3. 给脚本添加执行权限：
   ```bash
   chmod +x database/rebuild_database.sh
   ```
4. 运行脚本：
   ```bash
   ./database/rebuild_database.sh
   ```
5. 输入 MySQL 密码
6. 等待脚本执行完成

### 方案二：手动执行（适用于高级用户）

#### 步骤 1：修复数据库字符集

```bash
mysql -u root -p --default-character-set=utf8mb4 < database/fix_encoding.sql
```

#### 步骤 2：创建表结构

```bash
mysql -u root -p --default-character-set=utf8mb4 pet_management_platform < database/schema.sql
```

#### 步骤 3：导入数据

```bash
mysql -u root -p --default-character-set=utf8mb4 pet_management_platform < database/data.sql
```

#### 步骤 4：验证数据

```bash
mysql -u root -p --default-character-set=utf8mb4 pet_management_platform -e "SELECT id, username, nickname FROM sys_user LIMIT 3;"
```

## 验证修复结果

执行以下 SQL 查询，检查中文是否正常显示：

```sql
-- 检查用户表中文数据
SELECT id, username, nickname, role FROM sys_user;

-- 检查宠物表中文数据
SELECT id, name, breed, personality, remarks FROM pet_info LIMIT 5;

-- 检查社区帖子中文数据
SELECT id, title, content FROM forum_post LIMIT 3;
```

如果中文显示正常，说明问题已解决！

## 预防措施

为避免将来再次出现乱码问题，请确保：

1. **保存 SQL 文件时使用 UTF-8 编码**
   - Windows 记事本：另存为时选择 "UTF-8" 编码
   - VS Code：右下角确认文件编码为 UTF-8
   - 其他编辑器：确保保存为 UTF-8 without BOM

2. **导入时始终指定字符集**
   ```bash
   mysql --default-character-set=utf8mb4 -u root -p database_name < file.sql
   ```

3. **数据库连接配置正确**
   - 确保 `backend/src/config/db.js` 中设置了 `charset: 'utf8mb4'`
   - 数据库、表、字段都使用 `utf8mb4` 字符集

## 常见问题

### Q1: 脚本执行失败，提示找不到 mysql 命令

**A:** 请确保 MySQL 已安装并添加到系统 PATH 环境变量中。

### Q2: 导入数据后中文仍然是乱码

**A:** 请检查以下几点：
1. 确认 data.sql 文件是 UTF-8 编码
2. 确认导入时使用了 `--default-character-set=utf8mb4` 参数
3. 确认数据库、表的字符集都是 utf8mb4

### Q3: 如何查看表的字符集？

**A:** 执行以下 SQL：
```sql
SHOW CREATE TABLE sys_user;
```

查看结果中的 `DEFAULT CHARSET` 是否为 `utf8mb4`。

### Q4: 如何修改现有表的字符集？

**A:** 执行以下 SQL：
```sql
ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 技术说明

### utf8 vs utf8mb4

- **utf8**: MySQL 的 utf8 字符集只支持最多 3 字节的字符，不能存储 emoji 等特殊字符
- **utf8mb4**: 完整的 UTF-8 实现，支持 4 字节字符，包括 emoji，推荐使用

本项目使用 utf8mb4 字符集，确保可以存储所有 Unicode 字符。

### 字符集层次

MySQL 有多个字符集设置层次：

1. **服务器级**：`character_set_server`
2. **数据库级**：`CREATE DATABASE` 时指定
3. **表级**：`CREATE TABLE` 时指定
4. **字段级**：`CREATE TABLE` 时字段指定
5. **连接级**：`SET NAMES utf8mb4` 或连接时指定

为确保数据正确存储和显示，所有层次都应使用 utf8mb4。

## 联系支持

如果以上方法都无法解决您的问题，请：

1. 检查 MySQL 版本（建议 8.0+）
2. 查看错误日志
3. 提供详细的错误信息和环境配置

---

**文档版本**: v1.0
**创建日期**: 2026-03-07
**适用于**: 宠物管理与服务平台 v1.0
