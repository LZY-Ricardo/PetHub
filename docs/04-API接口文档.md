# 宠物管理与服务平台 - API接口文档

## 接口概览

### 基础信息

- **Base URL**：`http://localhost:3000/api`（开发环境）
- **接口协议**：HTTP/HTTPS
- **数据格式**：JSON
- **字符编码**：UTF-8

### 认证方式

- **方式**：JWT Token
- **Header**：`Authorization: Bearer {token}`
- **Token有效期**：24小时

### 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

**状态码说明**：

- `200`：操作成功
- `201`：创建成功
- `400`：请求参数错误
- `401`：未登录或token过期
- `403`：无权限访问
- `404`：资源不存在
- `500`：服务器内部错误

---

## 1. 认证模块

### 1.1 用户注册

**接口地址**：`POST /auth/register`
**是否需要登录**：否

**请求参数**：

```json
{
  "username": "string (3-20字符), 必填",
  "password": "string (6-20字符), 必填",
  "contactInfo": "string, 可选",
  "nickname": "string (2-20字符), 必填"
}
```

**响应示例**：

```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": null,
    "role": "user",
    "contact_info": "13800138000",
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "用户名已存在"
}
```

---

### 1.2 用户登录

**接口地址**：`POST /auth/login`
**是否需要登录**：否

**请求参数**：

```json
{
  "username": "string, 必填",
  "password": "string, 必填"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": null,
      "role": "user",
      "contact_info": "13800138000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**：

```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

---

### 1.3 获取当前用户信息

**接口地址**：`GET /auth/user`
**是否需要登录**：是

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "http://localhost:3000/uploads/avatar/user_1.jpg",
    "role": "user",
    "contact_info": "13800138000",
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

---

### 1.4 更新用户信息

**接口地址**：`PUT /auth/user`
**是否需要登录**：是

**请求参数**：

```json
{
  "nickname": "string (2-20字符), 可选",
  "contact_info": "string, 可选"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "新昵称",
    "avatar": null,
    "role": "user",
    "contact_info": "13900139000"
  }
}
```

---

### 1.5 上传头像

**接口地址**：`POST /auth/avatar`
**是否需要登录**：是
**Content-Type**：`multipart/form-data`

**请求参数**：

- `avatar`: File (图片文件, ≤5MB, jpg/jpeg/png)

**响应示例**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatar": "http://localhost:3000/uploads/avatar/user_1_1678176543.jpg"
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "文件大小不能超过5MB"
}
```

---

## 2. 宠物档案模块

### 2.1 获取宠物列表

**接口地址**：`GET /pets`
**是否需要登录**：否

**查询参数**：

```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
breed: string, 品种筛选
gender: string (male/female), 性别筛选
minAge: number, 最小年龄
maxAge: number, 最大年龄
status: string (available/pending/adopted), 状态筛选
sortBy: string (created_at/age), 排序字段
sortOrder: string (ASC/DESC), 排序方向
```

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "旺财",
        "breed": "金毛",
        "gender": "male",
        "age": 2.5,
        "health_status": "good",
        "status": "available",
        "photos": ["http://localhost:3000/uploads/pet/pet_1_1.jpg"],
        "created_at": "2026-03-07T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2.2 获取宠物详情

**接口地址**：`GET /pets/:id`
**是否需要登录**：否

**路径参数**：

- `id`: number, 宠物ID

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "旺财",
    "breed": "金毛",
    "gender": "male",
    "age": 2.5,
    "health_status": "good",
    "personality": "温顺友好",
    "vaccination": "已完成",
    "sterilized": 1,
    "status": "available",
    "photos": [
      "http://localhost:3000/uploads/pet/pet_1_1.jpg",
      "http://localhost:3000/uploads/pet/pet_1_2.jpg"
    ],
    "remarks": "非常亲人，适合有孩子的家庭",
    "created_by": {
      "id": 2,
      "username": "admin",
      "nickname": "管理员"
    },
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

---

### 2.3 添加宠物（管理员）

**接口地址**：`POST /pets`
**是否需要登录**：是（管理员）

**请求参数**：

```json
{
  "name": "string (2-50字符), 必填",
  "breed": "string (2-50字符), 必填",
  "gender": "string (male/female), 必填",
  "age": "number, 必填",
  "health_status": "string (good/fair/poor), 可选",
  "personality": "string, 可选",
  "vaccination": "string, 可选",
  "sterilized": "number (0/1), 可选",
  "photos": "array [1-5张图片URL], 必填",
  "remarks": "string, 可选"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 1,
    "name": "旺财",
    "status": "available",
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

---

### 2.4 更新宠物信息（管理员）

**接口地址**：`PUT /pets/:id`
**是否需要登录**：是（管理员）

**路径参数**：

- `id`: number, 宠物ID

**请求参数**：

```json
{
  "name": "string, 可选",
  "breed": "string, 可选",
  "gender": "string, 可选",
  "age": "number, 可选",
  "health_status": "string, 可选",
  "personality": "string, 可选",
  "vaccination": "string, 可选",
  "sterilized": "number, 可选",
  "status": "string (available/pending/adopted), 可选",
  "photos": "array, 可选",
  "remarks": "string, 可选"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "name": "旺财",
    "updated_at": "2026-03-07T11:00:00Z"
  }
}
```

---

### 2.5 删除宠物（管理员）

**接口地址**：`DELETE /pets/:id`
**是否需要登录**：是（管理员）

**路径参数**：

- `id`: number, 宠物ID

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "只能删除待领养状态的宠物"
}
```

---

### 2.6 发布送养信息

**接口地址**：`POST /pets/submissions`
**是否需要登录**：是

**请求参数**：

```json
{
  "name": "string, 必填",
  "breed": "string, 必填",
  "gender": "string (male/female), 必填",
  "age": "number, 必填",
  "healthStatus": "string (good/fair/poor), 可选",
  "personality": "string, 可选",
  "vaccination": "string, 可选",
  "sterilized": "boolean, 可选",
  "photos": ["string, 图片URL"],
  "remarks": "string, 必填"
}
```

**业务规则说明**：

- 普通用户发布后，`submission_status` 默认为 `pending`
- 审核通过前，前台领养列表不可见
- 宠物状态初始化为 `pending`

---

### 2.7 获取我的送养发布

**接口地址**：`GET /pets/my-submissions`
**是否需要登录**：是

**响应说明**：

- 返回当前登录用户创建的全部送养发布
- 包含 `submission_status`、`submission_comment`、`status` 等字段

---

### 2.8 更新我的送养发布

**接口地址**：`PUT /pets/my-submissions/:id`
**是否需要登录**：是

**路径参数**：

- `id`: number, 送养发布ID

**业务规则说明**：

- 仅记录所属发布人可更新
- 仅 `submission_status` 为 `pending` 或 `rejected` 的记录允许更新
- 更新后会重置为待审核状态

---

### 2.9 重新提交送养发布

**接口地址**：`POST /pets/my-submissions/:id/resubmit`
**是否需要登录**：是

**业务规则说明**：

- 仅 `submission_status=rejected` 的记录可重新提交
- 重新提交后 `submission_status` 重置为 `pending`

---

### 2.10 获取待审核送养发布（管理员）

**接口地址**：`GET /pets/pending-submissions`
**是否需要登录**：是（管理员）

**业务规则说明**：

- 仅返回 `source_type=user` 且 `submission_status=pending` 的记录

---

### 2.11 审核送养发布（管理员）

**接口地址**：`PUT /pets/submissions/:id/review`
**是否需要登录**：是（管理员）

**请求参数**：

```json
{
  "status": "string (approved/rejected), 必填",
  "reviewComment": "string, 可选"
}
```

**业务规则说明**：

- `approved`：`submission_status` 更新为 `approved`，`status` 更新为 `available`
- `rejected`：`submission_status` 更新为 `rejected`，记录审核备注
- 审核后向发布用户发送通知

---

## 3. 领养申请模块

### 3.1 提交领养申请

**接口地址**：`POST /adoptions`
**是否需要登录**：是

**请求参数**：

```json
{
  "pet_id": "number, 必填",
  "reason": "string (10-500字符), 必填",
  "experience": "string, 可选",
  "contact": "string, 必填",
  "address": "string, 必填"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "申请提交成功",
  "data": {
    "id": 1,
    "pet_id": 1,
    "status": "pending",
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "该宠物暂时不可领养"
}
```

```json
{
  "code": 400,
  "message": "您已经提交过该宠物的领养申请"
}
```

---

### 3.2 获取我的申请列表

**接口地址**：`GET /adoptions/my`
**是否需要登录**：是

**查询参数**：无（当前版本返回当前用户全部申请，按时间倒序）

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "pet_id": 1,
      "pet_name": "旺财",
      "pet_breed": "金毛",
      "reason": "我很喜欢狗狗",
      "contact": "13800138000",
      "phone": "13800138000",
      "address": "北京市朝阳区",
      "status": "pending",
      "review_comment": null,
      "created_at": "2026-03-07T10:00:00Z"
    }
  ]
}
```

---

### 3.3 获取所有申请（管理员）

**接口地址**：`GET /adoptions`
**是否需要登录**：是（管理员）

**查询参数**：

```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
status: string, 状态筛选
```

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "username": "testuser",
          "nickname": "测试用户",
          "contact_info": "13800138000"
        },
        "pet": {
          "id": 1,
          "name": "旺财",
          "breed": "金毛",
          "photos": ["http://localhost:3000/uploads/pet/pet_1_1.jpg"]
        },
        "reason": "我很喜欢狗狗",
        "experience": "养过2只金毛",
        "contact": "13800138000",
        "address": "北京市朝阳区",
        "status": "pending",
        "created_at": "2026-03-07T10:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 3.4 审核申请（管理员）

**接口地址**：`PUT /adoptions/:id/review`
**是否需要登录**：是（管理员）

**路径参数**：

- `id`: number, 申请ID

**请求参数**：

```json
{
  "status": "string (approved/rejected), 必填",
  "reviewComment": "string, 可选"
}
```

**业务规则说明**：

- 当 `status=approved` 时：系统会将该宠物状态更新为 `adopted`，并自动驳回同一宠物的其他 `pending` 申请。
- 自动驳回的申请会写入 `review_comment`：`该宠物已被其他申请人领养，当前申请已自动驳回`。
- 当 `status=rejected` 且未传 `reviewComment` 时：系统会自动写入默认说明 `申请未通过审核，请联系管理员咨询具体原因`。

**响应示例（通过）**：

```json
{
  "code": 200,
  "message": "审核完成",
  "data": null
}
```

**响应示例（驳回）**：

```json
{
  "code": 200,
  "message": "审核完成",
  "data": null
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "无效的审核状态"
}
```

---

## 4. 走失宠物模块

### 4.1 获取走失列表

**接口地址**：`GET /lost-pets`
**是否需要登录**：否

**查询参数**：

```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
isUrgent: number (0/1), 是否紧急
isFound: number (0/1), 是否已找到
```

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "username": "testuser",
          "nickname": "测试用户",
          "avatar": "http://localhost:3000/uploads/avatar/user_1.jpg"
        },
        "name": "小白",
        "location": "北京市朝阳区望京SOHO",
        "lost_time": "2026-03-07T08:00:00Z",
        "description": "白色比熊，穿着红色背心",
        "photos": ["http://localhost:3000/uploads/lost/lost_1_1.jpg"],
        "is_urgent": 1,
        "created_at": "2026-03-07T09:00:00Z"
      }
    ],
    "total": 30,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 4.2 获取走失详情

**接口地址**：`GET /lost-pets/:id`
**是否需要登录**：否

**路径参数**：

- `id`: number, 走失信息ID

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": "http://localhost:3000/uploads/avatar/user_1.jpg"
    },
    "name": "小白",
    "location": "北京市朝阳区望京SOHO",
    "lost_time": "2026-03-07T08:00:00Z",
    "description": "白色比熊，2岁，穿着红色背心，非常亲人",
    "photos": [
      "http://localhost:3000/uploads/lost/lost_1_1.jpg",
      "http://localhost:3000/uploads/lost/lost_1_2.jpg"
    ],
    "contact": "13800138000",
    "is_urgent": 1,
    "is_found": 0,
    "created_at": "2026-03-07T09:00:00Z"
  }
}
```

---

### 4.3 发布走失信息

**接口地址**：`POST /lost-pets`
**是否需要登录**：是

**请求参数**：

```json
{
  "name": "string (2-50字符), 必填",
  "location": "string, 必填",
  "lost_time": "string (ISO 8601格式), 必填",
  "description": "string (20-500字符), 必填",
  "photos": "array [1-3张图片URL], 必填",
  "contact": "string, 必填",
  "is_urgent": "number (0/1), 可选"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1,
    "name": "小白",
    "is_urgent": 1,
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

---

### 4.4 更新走失信息

**接口地址**：`PUT /lost-pets/:id`
**是否需要登录**：是

**路径参数**：

- `id`: number, 走失信息ID

**请求参数**：

```json
{
  "name": "string, 可选",
  "location": "string, 可选",
  "lost_time": "string, 可选",
  "description": "string, 可选",
  "photos": "array, 可选",
  "contact": "string, 可选",
  "is_urgent": "number, 可选"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "updated_at": "2026-03-07T11:00:00Z"
  }
}
```

**错误响应**：

```json
{
  "code": 403,
  "message": "只能修改自己发布的信息"
}
```

---

### 4.5 删除走失信息

**接口地址**：`DELETE /lost-pets/:id`
**是否需要登录**：是（发布者或管理员）

**路径参数**：

- `id`: number, 走失信息ID

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 4.6 标记已找到

**接口地址**：`PATCH /lost-pets/:id/found`
**是否需要登录**：是（发布者）

**路径参数**：

- `id`: number, 走失信息ID

**响应示例**：

```json
{
  "code": 200,
  "message": "标记成功",
  "data": {
    "id": 1,
    "is_found": 1
  }
}
```

---

### 4.7 获取我的走失信息

**接口地址**：`GET /lost-pets/my`
**是否需要登录**：是

**查询参数**：无（当前版本返回当前用户全部记录，按时间倒序）

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "小白",
      "location": "北京市朝阳区望京SOHO",
      "is_urgent": 1,
      "is_found": 0,
      "created_at": "2026-03-07T09:00:00Z"
    }
  ]
}
```

---

## 5. 社区互动模块

### 5.1 获取帖子列表

**接口地址**：`GET /forum/posts`
**是否需要登录**：否

**查询参数**：

```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
category: string (经验分享/求助问答/宠物展示/闲聊灌水), 可选
```

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "username": "testuser",
          "nickname": "测试用户",
          "avatar": "http://localhost:3000/uploads/avatar/user_1.jpg"
        },
        "title": "金毛的饲养经验分享",
        "content": "我养金毛已经3年了...",
        "images": ["http://localhost:3000/uploads/forum/post_1_1.jpg"],
        "view_count": 100,
        "comment_count": 10,
        "like_count": 25,
        "created_at": "2026-03-07T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 5.2 获取帖子详情

**接口地址**：`GET /forum/posts/:id`
**是否需要登录**：否

**路径参数**：

- `id`: number, 帖子ID

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": "http://localhost:3000/uploads/avatar/user_1.jpg"
    },
    "title": "金毛的饲养经验分享",
    "content": "我养金毛已经3年了，这里分享一些经验...",
    "images": [
      "http://localhost:3000/uploads/forum/post_1_1.jpg",
      "http://localhost:3000/uploads/forum/post_1_2.jpg"
    ],
    "view_count": 101,
    "like_count": 25,
    "is_liked": false,
    "created_at": "2026-03-07T10:00:00Z",
    "comments": [
      {
        "id": 1,
        "user": {
          "id": 2,
          "username": "user2",
          "nickname": "用户2",
          "avatar": null
        },
        "content": "分享得很详细，学到了",
        "parent_id": null,
        "created_at": "2026-03-07T11:00:00Z",
        "replies": [
          {
            "id": 2,
            "user": {
              "id": 1,
              "username": "testuser",
              "nickname": "测试用户",
              "avatar": "http://localhost:3000/uploads/avatar/user_1.jpg"
            },
            "content": "谢谢支持",
            "parent_id": 1,
            "created_at": "2026-03-07T12:00:00Z"
          }
        ]
      }
    ]
  }
}
```

---

### 5.3 发布帖子

**接口地址**：`POST /forum/posts`
**是否需要登录**：是

**请求参数**：

```json
{
  "title": "string (5-50字符), 必填",
  "content": "string (10-2000字符), 必填",
  "category": "string (经验分享/求助问答/宠物展示/闲聊灌水), 可选，默认闲聊灌水",
  "images": "array [0-9张图片URL], 可选"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1,
    "title": "金毛的饲养经验分享",
    "category": "经验分享",
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

---

### 5.4 更新帖子分类

**接口地址**：`PUT /forum/posts/:id/category`
**是否需要登录**：是（仅作者）

**路径参数**：

- `id`: number, 帖子ID

**请求参数**：

```json
{
  "category": "string (经验分享/求助问答/宠物展示/闲聊灌水), 必填"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "分类更新成功",
  "data": {
    "id": 1,
    "category": "求助问答",
    "updated_at": "2026-03-07T10:30:00Z"
  }
}
```

---

### 5.5 删除帖子

**接口地址**：`DELETE /forum/posts/:id`
**是否需要登录**：是（作者或管理员）

**路径参数**：

- `id`: number, 帖子ID

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5.6 发表评论

**接口地址**：`POST /forum/posts/:id/comments`
**是否需要登录**：是

**路径参数**：

- `id`: number, 帖子ID

**请求参数**：

```json
{
  "content": "string (2-500字符), 必填",
  "parent_id": "number, 可选（回复评论时必填）"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "评论成功",
  "data": {
    "id": 1,
    "content": "分享得很详细",
    "parent_id": null,
    "created_at": "2026-03-07T11:00:00Z"
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "不能回复自己的评论"
}
```

---

### 5.7 删除评论

**接口地址**：`DELETE /forum/comments/:id`
**是否需要登录**：是（作者或管理员）

**路径参数**：

- `id`: number, 评论ID

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5.8 点赞/取消点赞

**接口地址**：`POST /forum/posts/:id/like`
**是否需要登录**：是

**路径参数**：

- `id`: number, 帖子ID

**响应示例**：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "liked": true,
    "like_count": 26
  }
}
```

---

### 5.9 获取我的内容

**接口地址**：`GET /forum/posts/my`
**是否需要登录**：是

**查询参数**：

```
无（当前版本直接返回 posts/comments 两组数据）
```

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "金毛的饲养经验分享",
        "created_at": "2026-03-07T10:00:00Z"
      }
    ],
    "comments": [
      {
        "id": 1,
        "content": "很有帮助",
        "post_id": 1,
        "created_at": "2026-03-07T10:10:00Z"
      }
    ]
  }
}
```

**响应示例（comments）**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "post": {
          "id": 2,
          "title": "新手养狗求助"
        },
        "content": "建议先打好疫苗",
        "created_at": "2026-03-07T11:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  }
}
```

**响应示例（likes）**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 3,
        "title": "狗狗训练技巧",
        "author": "训练师小王",
        "like_count": 50,
        "liked_at": "2026-03-07T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 6. 文件上传模块

### 6.1 通用图片上传

**接口地址**：`POST /upload/image`
**是否需要登录**：是
**Content-Type**：`multipart/form-data`

**请求参数**：

- `file`: File (图片文件, ≤5MB, jpg/jpeg/png/webp)
- `type`: string (avatar/pet/lost/forum/common), 可选，默认 `common`

**响应示例**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "http://localhost:3000/uploads/avatar/user_1_1678176543.jpg"
  }
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "文件类型不支持"
}
```

```json
{
  "code": 400,
  "message": "文件大小不能超过5MB"
}
```

---

## 7. 统计数据模块（管理员）

### 7.1 获取仪表盘数据

**接口地址**：`GET /admin/dashboard`
**是否需要登录**：是（管理员）

**响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "user_count": 150,
    "pet_count": 50,
    "adoption_count": 30,
    "post_count": 200,
    "lost_count": 20,
    "pending_adoption_count": 5
  }
}
```

---

### 7.2 发布系统公告（管理员）

**接口地址**：`POST /admin/notifications/broadcast`
**是否需要登录**：是（管理员）

**请求参数**：

```json
{
  "title": "string (1-120字符), 必填",
  "content": "string (1-500字符), 必填",
  "targetRole": "string (all/user/admin), 可选，默认all",
  "excludeSender": "boolean, 可选，默认false"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "公告发布成功",
  "data": {
    "deliveredCount": 128,
    "targetRole": "all",
    "excludeSender": false
  }
}
```

---

## 8. 通知模块

### 8.1 获取通知列表

**接口地址**：`GET /notifications`
**是否需要登录**：是

**查询参数**：

```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
unreadOnly: boolean (true/false), 是否仅未读
type: string (adoption/forum/system), 通知类型筛选
```

**响应示例**：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": 101,
        "user_id": 3,
        "type": "adoption",
        "title": "领养申请已通过",
        "content": "您对宠物 #12 的领养申请已通过审核。",
        "related_type": "adoption_application",
        "related_id": 55,
        "action_url": "/adoptions?focusId=55",
        "is_read": 0,
        "read_at": null,
        "created_at": "2026-03-25T10:00:00Z"
      }
    ],
    "total": 23,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 8.2 获取未读通知数

**接口地址**：`GET /notifications/unread-count`
**是否需要登录**：是

**响应示例**：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "unreadCount": 5
  }
}
```

---

### 8.3 标记单条通知为已读

**接口地址**：`PUT /notifications/:id/read`
**是否需要登录**：是

**路径参数**：

- `id`: number, 通知ID

**响应示例**：

```json
{
  "code": 200,
  "message": "已标记为已读",
  "data": null
}
```

---

### 8.4 全部标记为已读

**接口地址**：`PUT /notifications/read-all`
**是否需要登录**：是

**响应示例**：

```json
{
  "code": 200,
  "message": "已全部标记为已读",
  "data": {
    "affected": 5
  }
}
```

---

## 错误码说明

| 错误码 | 说明                       |
| ------ | -------------------------- |
| 200    | 操作成功                   |
| 400    | 请求参数错误               |
| 401    | 未登录或token已过期        |
| 403    | 无权限访问                 |
| 404    | 资源不存在                 |
| 409    | 资源冲突（如用户名已存在） |
| 413    | 文件大小超过限制           |
| 415    | 文件类型不支持             |
| 500    | 服务器内部错误             |

---

## 接口调用示例

### JavaScript (Axios)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// 获取宠物列表
const getPets = async () => {
  const response = await api.get("/pets", {
    params: {
      page: 1,
      pageSize: 10,
      status: "available",
    },
  });
  return response.data;
};

// 提交领养申请
const submitApplication = async (data) => {
  const response = await api.post("/adoptions", data);
  return response.data;
};
```

### cURL

```bash
# 用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"xiaoming","password":"123456"}'

# 获取宠物列表
curl -X GET "http://localhost:3000/api/pets?page=1&pageSize=10"

# 提交领养申请
curl -X POST http://localhost:3000/api/adoptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pet_id": 1,
    "reason": "我很喜欢狗狗",
    "contact": "13800138000",
    "address": "北京市朝阳区"
  }'
```

---

**文档版本**：v1.1
**编写日期**：2026年3月25日
**文档状态**：已完成
