# 送养发布与发布审核最小闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为普通用户新增送养发布与“我的送养发布”能力，并为管理员新增领养发布审核页面，打通最小可用业务闭环。

**Architecture:** 继续复用现有 `pet_info` 作为领养宠物主表，在该表上补齐“发布来源”“发布审核状态”“发布人”等字段，而不是再起一张平行表。前台只展示审核通过的发布；后台新增审核列表和管理入口；通知复用现有 `NotificationService`。

**Tech Stack:** React, React Router, Ant Design, Koa, MySQL

---

## 文件结构与职责

- `backend/database/schema.sql`
  扩展 `pet_info` 的业务字段定义。
- `backend/database/data.sql`
  如需补充示例字段，保持与 schema 对齐。
- `backend/src/dao/PetDAO.js`
  增强宠物查询、创建、更新与审核相关数据库操作。
- `backend/src/services/PetService.js`
  承载送养发布、审核、列表过滤等业务规则。
- `backend/src/controllers/PetController.js`
  暴露新增接口。
- `backend/src/routes/pets.js`
  注册普通用户发布、我的发布、管理员审核等路由。
- `frontend/src/pages/Pet/PetSubmissionPage.jsx`
  普通用户发布送养页面。
- `frontend/src/pages/Pet/MyPetSubmissionsPage.jsx`
  普通用户查看和管理自己的送养发布。
- `frontend/src/pages/Admin/PetSubmissionReviewPage.jsx`
  管理员审核送养发布页面。
- `frontend/src/pages/Admin/PetManagementPage.jsx`
  管理员领养宠物管理页，至少支持查看与区分来源。
- `frontend/src/App.jsx`
  接入新路由。
- `frontend/src/components/Layout/MainLayout.jsx`
  为普通用户增加送养发布入口。
- `frontend/src/components/Admin/AdminMenuConfig.jsx`
  后台菜单从占位页切换到真实审核页与管理页。

---

### Task 1: 扩展 `pet_info` 数据模型支持送养发布

**Files:**
- Modify: `backend/database/schema.sql`
- Modify: `backend/src/dao/PetDAO.js`
- Modify: `backend/src/services/PetService.js`

- [ ] 增加字段：`source_type`、`submission_status`、`submission_comment`、`owner_user_id`
- [ ] 为现有管理员创建数据设置默认值：`source_type=platform`、`submission_status=approved`
- [ ] 统一查询逻辑：前台列表默认只返回 `submission_status=approved`
- [ ] 为“我的送养发布”和“后台审核列表”补充专用 DAO 查询

---

### Task 2: 新增普通用户送养发布与我的送养发布接口

**Files:**
- Modify: `backend/src/controllers/PetController.js`
- Modify: `backend/src/routes/pets.js`
- Modify: `backend/src/services/PetService.js`

- [ ] 新增普通用户发布送养接口
- [ ] 新增查询“我的送养发布”接口
- [ ] 新增普通用户编辑自己送养发布接口
- [ ] 新增重新提交审核接口
- [ ] 保证只有记录 owner 才能编辑或重提

---

### Task 3: 新增管理员送养审核接口

**Files:**
- Modify: `backend/src/controllers/PetController.js`
- Modify: `backend/src/routes/pets.js`
- Modify: `backend/src/services/PetService.js`
- Modify: `backend/src/dao/PetDAO.js`
- Modify: `backend/src/services/NotificationService.js`

- [ ] 新增待审核送养列表接口
- [ ] 新增审核通过/驳回接口
- [ ] 审核通过后设置 `submission_status=approved` 且 `status=available`
- [ ] 审核驳回后写入驳回原因
- [ ] 向发布用户发送审核结果通知

---

### Task 4: 新增普通用户送养发布页面

**Files:**
- Create: `frontend/src/pages/Pet/PetSubmissionPage.jsx`
- Create: `frontend/src/pages/Pet/PetSubmissionPage.css`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/Layout/MainLayout.jsx`

- [ ] 创建送养发布表单页面
- [ ] 复用现有图片上传接口
- [ ] 新增前台入口，文案保持产品化
- [ ] 提交成功后跳转到“我的送养发布”

---

### Task 5: 新增“我的送养发布”页面

**Files:**
- Create: `frontend/src/pages/Pet/MyPetSubmissionsPage.jsx`
- Create: `frontend/src/pages/Pet/MyPetSubmissionsPage.css`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/Layout/MainLayout.jsx`

- [ ] 展示我的送养记录列表
- [ ] 展示审核状态与驳回原因
- [ ] 支持编辑待审核/已驳回记录
- [ ] 支持重新提交审核

---

### Task 6: 新增管理员审核页与宠物管理页

**Files:**
- Create: `frontend/src/pages/Admin/PetSubmissionReviewPage.jsx`
- Create: `frontend/src/pages/Admin/PetManagementPage.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/Admin/AdminMenuConfig.jsx`

- [ ] 用真实页面替换后台占位页中的“领养发布审核”
- [ ] 用真实页面替换后台占位页中的“领养宠物管理”
- [ ] 在审核页支持通过/驳回并填写审核意见
- [ ] 在宠物管理页展示来源、审核状态、领养状态

---

### Task 7: 验证最小闭环

**Files:**
- Verify only

- [ ] 运行 `npm run build`（frontend）
- [ ] 至少验证送养发布页和后台审核页可正常进入
- [ ] 静态检查前台列表不会展示未审核记录
- [ ] 记录剩余未做能力，不扩大本阶段范围
