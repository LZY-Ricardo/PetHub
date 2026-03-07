const ForumDAO = require('../dao/ForumDAO');

class ForumService {
  async getPostList(page, pageSize) {
    return await ForumDAO.getPostList(page, pageSize);
  }

  async getPostDetail(id, userId) {
    const post = await ForumDAO.getPostDetail(id);
    if (!post) {
      throw new Error('帖子不存在');
    }

    // 增加浏览计数
    await ForumDAO.incrementViewCount(id);

    // 获取评论
    const comments = await ForumDAO.getComments(id);

    // 检查当前用户是否点赞
    let hasLiked = false;
    if (userId) {
      hasLiked = await ForumDAO.checkLike(id, userId);
    }

    return {
      ...post,
      comments,
      hasLiked
    };
  }

  async createPost(data, userId) {
    const { title, content, images } = data;

    if (!title || !content) {
      throw new Error('标题和内容不能为空');
    }

    const postId = await ForumDAO.createPost(data, userId);
    return await ForumDAO.getPostDetail(postId);
  }

  async deletePost(id, userId) {
    const post = await ForumDAO.getPostDetail(id);
    if (!post) {
      throw new Error('帖子不存在');
    }

    if (post.user_id !== userId) {
      throw new Error('无权删除此帖子');
    }

    await ForumDAO.deletePost(id);
    return { success: true };
  }

  async createComment(postId, userId, content, parentId = null) {
    if (!content) {
      throw new Error('评论内容不能为空');
    }

    const commentId = await ForumDAO.createComment(postId, userId, content, parentId);

    // 返回评论详情
    const sql = `
      SELECT c.*, u.username, u.nickname as user_name, u.avatar
      FROM forum_comment c
      LEFT JOIN sys_user u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    const { postPool } = require('../dao/ForumDAO').prototype.postPool || require('../config/db').promisePool;
    const [rows] = await postPool.query(sql, [commentId]);

    return rows[0];
  }

  async deleteComment(id, userId) {
    const sql = `SELECT * FROM forum_comment WHERE id = ?`;
    const { postPool } = require('../config/db');
    const [rows] = await postPool.query(sql, [id]);
    const comment = rows[0];

    if (!comment) {
      throw new Error('评论不存在');
    }

    if (comment.user_id !== userId) {
      throw new Error('无权删除此评论');
    }

    await ForumDAO.deleteComment(id);
    return { success: true };
  }

  async toggleLike(postId, userId) {
    const result = await ForumDAO.toggleLike(postId, userId);
    return result;
  }

  async getMyContent(userId) {
    const posts = await ForumDAO.getUserPosts(userId);
    const comments = await ForumDAO.getUserComments(userId);
    return { posts, comments };
  }
}

module.exports = new ForumService();
