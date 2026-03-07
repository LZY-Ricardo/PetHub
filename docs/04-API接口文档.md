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
  "contact_info": "string, 必填",
  "nickname": "string (2-20字符), 必填"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": null,
      "role": "user",
      "contact_info": "13800138000",
      "created_at": "2026-03-07T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
  "code": 400,
  "message": "用户名或密码错误"
}
```

---

### 1.3 获取当前用户信息
**接口地址**：`GET /auth/me`
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
**接口地址**：`PUT /auth/profile`
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

**查询参数**：
```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
status: string (pending/approved/rejected), 状态筛选
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
        "pet": {
          "id": 1,
          "name": "旺财",
          "breed": "金毛",
          "photos": ["http://localhost:3000/uploads/pet/pet_1_1.jpg"]
        },
        "reason": "我很喜欢狗狗",
        "contact": "13800138000",
        "address": "北京市朝阳区",
        "status": "pending",
        "review_comment": null,
        "created_at": "2026-03-07T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
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
username: string, 用户名搜索
petName: string, 宠物名称搜索
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
  "action": "string (approve/reject), 必填",
  "review_comment": "string, 驳回时必填 (10-200字符)"
}
```

**响应示例（通过）**：
```json
{
  "code": 200,
  "message": "审核通过",
  "data": {
    "id": 1,
    "status": "approved",
    "reviewed_at": "2026-03-07T11:00:00Z"
  }
}
```

**响应示例（驳回）**：
```json
{
  "code": 200,
  "message": "已驳回申请",
  "data": {
    "id": 1,
    "status": "rejected",
    "review_comment": "居住条件不符合要求",
    "reviewed_at": "2026-03-07T11:00:00Z"
  }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "驳回时必须填写审核意见"
}
```

---

## 4. 走失宠物模块

### 4.1 获取走失列表
**接口地址**：`GET /lost`
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
**接口地址**：`GET /lost/:id`
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
**接口地址**：`POST /lost`
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
**接口地址**：`PUT /lost/:id`
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
**接口地址**：`DELETE /lost/:id`
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
**接口地址**：`PUT /lost/:id/found`
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
**接口地址**：`GET /lost/my`
**是否需要登录**：是

**查询参数**：
```
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
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
        "name": "小白",
        "location": "北京市朝阳区望京SOHO",
        "is_urgent": 1,
        "is_found": 0,
        "created_at": "2026-03-07T09:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
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
sortBy: string (time/hot), 排序方式（默认time）
keyword: string, 搜索关键词
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
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

---

### 5.4 删除帖子
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

### 5.5 发表评论
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

### 5.6 删除评论
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

### 5.7 点赞/取消点赞
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

### 5.8 获取我的内容
**接口地址**：`GET /forum/my`
**是否需要登录**：是

**查询参数**：
```
type: string (posts/comments/likes), 类型
page: number (默认1), 页码
pageSize: number (默认10), 每页数量
```

**响应示例（posts）**：
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "金毛的饲养经验分享",
        "view_count": 100,
        "comment_count": 10,
        "like_count": 25,
        "created_at": "2026-03-07T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10
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
- `file`: File (图片文件, ≤5MB, jpg/jpeg/png)
- `type`: string (avatar/pet/lost/forum), 图片类型

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

## 错误码说明

| 错误码 | 说明 |
|-------|-----|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或token已过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 413 | 文件大小超过限制 |
| 415 | 文件类型不支持 |
| 500 | 服务器内部错误 |

---

## 接口调用示例

### JavaScript (Axios)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 获取宠物列表
const getPets = async () => {
  const response = await api.get('/pets', {
    params: {
      page: 1,
      pageSize: 10,
      status: 'available'
    }
  });
  return response.data;
};

// 提交领养申请
const submitApplication = async (data) => {
  const response = await api.post('/adoptions', data);
  return response.data;
};
```

### cURL
```bash
# 用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

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

**文档版本**：v1.0
**编写日期**：2026年3月7日
**文档状态**：已完成
