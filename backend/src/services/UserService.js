const UserDAO = require('../dao/UserDAO');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
class UserService {
  /**
   * 用户注册
   * @param {object} userData - 用户数据
   */
  async register(userData) {
    const { username, password, nickname, role = 'user', contactInfo } = userData;

    // 检查用户名是否已存在
    const existingUser = await UserDAO.findByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 加密密码（bcrypt，10轮）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = await UserDAO.createUser({
      username,
      password: hashedPassword,
      nickname,
      role,
      contactInfo
    });

    // 返回用户信息（不包含密码）
    const user = await UserDAO.findById(userId);
    return this.formatUserInfo(user);
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  async login(username, password) {
    // 查找用户
    const user = await UserDAO.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 检查账号状态
    if (user.status === 0) {
      throw new Error('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 生成JWT token
    const token = generateToken(user.id, user.role);

    return {
      token,
      user: this.formatUserInfo(user)
    };
  }

  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   */
  async getUserInfo(userId) {
    const user = await UserDAO.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return this.formatUserInfo(user);
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {object} userData - 更新的数据
   */
  async updateUser(userId, userData) {
    const user = await UserDAO.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await UserDAO.updateUser(userId, userData);
    const updatedUser = await UserDAO.findById(userId);
    return this.formatUserInfo(updatedUser);
  }

  /**
   * 修改密码
   * @param {number} userId - 用户ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await UserDAO.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserDAO.updatePassword(userId, hashedPassword);

    return { success: true };
  }

  /**
   * 获取用户列表（管理员）
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {string} role - 角色筛选
   */
  async getUserList(page, pageSize, role) {
    return await UserDAO.getUserList(page, pageSize, role);
  }

  /**
   * 更新用户状态（管理员）
   * @param {number} userId - 用户ID
   * @param {number} status - 状态
   */
  async updateUserStatus(userId, status) {
    const user = await UserDAO.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await UserDAO.updateUserStatus(userId, status);
    return { success: true };
  }

  /**
   * 格式化用户信息（移除敏感字段）
   * @param {object} user - 用户数据
   */
  formatUserInfo(user) {
    if (!user) return null;
    const { password, ...userInfo } = user;
    return userInfo;
  }
}

module.exports = new UserService();
