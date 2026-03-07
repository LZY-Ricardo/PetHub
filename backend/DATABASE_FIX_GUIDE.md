# 数据库中文乱码修复 - 快速指南

## 问题
数据库中的中文数据显示为乱码。

## 最快速的解决方法（推荐）

### 方法一：使用 npm 脚本（最简单）

在 `backend` 目录下运行：

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 一键修复数据库
npm run db:fix
```

这个命令会自动：
- ✅ 删除旧数据库
- ✅ 重新创建 utf8mb4 字符集的数据库
- ✅ 创建所有表结构
- ✅ 导入初始数据
- ✅ 验证数据是否正确

### 方法二：使用批处理脚本（Windows）

```cmd
cd backend
database\rebuild_database.bat
```

然后输入 MySQL 密码即可。

### 方法三：手动执行 SQL

```bash
# 1. 修复字符集
mysql -u root -p --default-character-set=utf8mb4 < database/fix_encoding.sql

# 2. 创建表结构
mysql -u root -p --default-character-set=utf8mb4 pet_management_platform < database/schema.sql

# 3. 导入数据
mysql -u root -p --default-character-set=utf8mb4 pet_management_platform < database/data.sql
```

## 验证修复

修复完成后，运行以下命令验证：

```bash
npm run db:check
```

或者直接查询数据库：

```sql
SELECT id, username, nickname FROM sys_user LIMIT 3;
```

如果中文显示正常，说明修复成功！

## 详细文档

如果需要更详细的说明，请查看：
- [backend/database/README_FIX.md](backend/database/README_FIX.md)

## 常见问题

### Q: npm run db:fix 报错？
A: 确保 `.env` 文件中的数据库配置正确，特别是 `DB_PASSWORD`。

### Q: 修复后中文还是乱码？
A: 检查 `database/data.sql` 文件的编码是否为 UTF-8：
- VS Code: 右下角查看编码
- 如不是 UTF-8，另存为时选择 UTF-8 编码

### Q: 会删除现有数据吗？
A: 会！这个脚本会重建整个数据库。如果需要保留数据，请先备份。

---

**快速帮助**：
```bash
npm run db:fix    # 修复数据库
npm run db:check  # 检查数据库状态
npm run dev       # 启动应用
```
