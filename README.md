# 宠物管理与服务平台

基于 React + Vite + Node.js + Koa + MySQL 的前后端分离项目，适用于本地开发演示和毕设答辩环境。

## 运行环境

- Node.js 18 及以上
- npm
- MySQL 8.x

## 项目结构

- `frontend/`：前端项目，默认运行在 `http://localhost:5173`
- `backend/`：后端项目，默认运行在 `http://localhost:3000`
- `backend/database/`：数据库脚本
- `docs/`：需求、设计与接口文档

## 快速启动

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd pet
```

### 2. 创建数据库

先在本地 MySQL 中创建数据库：

```sql
CREATE DATABASE pet_management_platform DEFAULT CHARACTER SET utf8mb4;
```

### 3. 导入表结构和测试数据

在项目根目录执行：

```bash
cd backend
mysql -u root -p pet_management_platform < database/schema.sql
mysql -u root -p pet_management_platform < database/data.sql
```

如需修复字符集问题，可参考 [backend/database/README_FIX.md](./backend/database/README_FIX.md)。

### 4. 配置后端环境变量

复制环境变量模板：

```bash
cd backend
cp .env.example .env
```

Windows PowerShell 也可以直接执行：

```powershell
Copy-Item ".env.example" ".env"
```

然后修改 `.env` 中的数据库账号、密码和 JWT 密钥。

推荐配置如下：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=pet_management_platform

JWT_SECRET=replace_with_a_random_secret
JWT_EXPIRES_IN=24h

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 5. 启动后端

```bash
cd backend
npm install
npm run dev
```

启动成功后可访问健康检查接口：

```text
http://localhost:3000/health
```

### 6. 启动前端

新开一个终端窗口执行：

```bash
cd frontend
npm install
npm run dev
```

浏览器访问：

```text
http://localhost:5173
```

前端开发服务器会自动代理：

- `/api` -> `http://localhost:3000`
- `/uploads` -> `http://localhost:3000`

## 默认测试账号

`backend/database/data.sql` 已内置测试数据，默认密码均为 `123456`。

- 管理员：`admin / 123456`
- 普通用户：`xiaoming / 123456`

如果数据库中的数据被重新导入或手动修改，请以实际数据为准。

## 常见问题

### 后端启动失败，提示数据库连接失败

检查以下配置：

- MySQL 服务是否已启动
- `backend/.env` 中的 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_DATABASE` 是否正确
- 数据库是否已导入 `schema.sql` 和 `data.sql`

### 前端页面打不开或接口报错

检查以下项：

- 后端是否运行在 `3000` 端口
- 前端是否运行在 `5173` 端口
- 浏览器访问 `http://localhost:3000/health` 是否返回成功响应

### 上传目录不存在

项目已预留 `backend/uploads/` 目录；运行上传接口时，子目录会按需自动创建。

## 文档

- [项目文档总览](./docs/README.md)
- [需求文档](./docs/01-需求文档.md)
- [后端开发文档](./docs/02-后端开发文档.md)
- [前端开发文档](./docs/03-前端开发文档.md)
- [API 接口文档](./docs/04-API接口文档.md)

## 安全说明

- 不要将真实的 `backend/.env` 提交到远程仓库
- 不要在仓库中提交本地数据库密码、JWT 密钥和生产环境配置
- 对外分发时优先保留 `.env.example`
