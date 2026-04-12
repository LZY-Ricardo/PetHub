const ForumDAO = require('../dao/ForumDAO');
const NotificationService = require('./NotificationService');

class ForumService {
  async getPostList(page, pageSize, category = null) {
    const allowedCategories = ['经验分享', '求助问答', '宠物展示', '闲聊灌水'];
    if (category && !allowedCategories.includes(category)) {
      throw new Error('帖子分类无效');
    }
    return await ForumDAO.getPostList(page, pageSize, category);
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
    const { title, content, images, category } = data;
    const allowedCategories = ['经验分享', '求助问答', '宠物展示', '闲聊灌水'];

    if (!title || !content) {
      throw new Error('标题和内容不能为空');
    }

    if (category && !allowedCategories.includes(category)) {
      throw new Error('帖子分类无效');
    }

    const postId = await ForumDAO.createPost({
      title,
      content,
      images,
      category: category || '闲聊灌水'
    }, userId);
    return await ForumDAO.getPostDetail(postId);
  }

  async deletePost(id, currentUser) {
    const post = await ForumDAO.getPostDetail(id);
    if (!post) {
      throw new Error('帖子不存在');
    }

    const isOwner = Number(post.user_id) === Number(currentUser.userId);
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('无权删除此帖子');
    }

    await ForumDAO.deletePost(id);
    return { success: true };
  }

  async updatePostCategory(id, currentUser, category) {
    const allowedCategories = ['经验分享', '求助问答', '宠物展示', '闲聊灌水'];
    if (!allowedCategories.includes(category)) {
      throw new Error('帖子分类无效');
    }

    const post = await ForumDAO.getPostDetail(id);
    if (!post) {
      throw new Error('帖子不存在');
    }

    const isOwner = Number(post.user_id) === Number(currentUser.userId);
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('无权修改此帖子分类');
    }

    await ForumDAO.updatePostCategory(id, category);
    return await ForumDAO.getPostDetail(id);
  }

  async getComments(postId) {
    return await ForumDAO.getComments(postId);
  }

  async createComment(postId, userId, content, parentId = null) {
    if (!content) {
      throw new Error('评论内容不能为空');
    }

    const commentId = await ForumDAO.createComment(postId, userId, content, parentId);

    const post = await ForumDAO.getPostOwner(postId);
    if (post && Number(post.user_id) !== Number(userId)) {
      await NotificationService.createNotification({
        userId: post.user_id,
        type: 'forum',
        title: '帖子收到新评论',
        content: `您的帖子《${post.title}》收到了新的评论。`,
        relatedType: 'forum_post',
        relatedId: postId,
        actionUrl: `/forum/${postId}`
      });
    }

    if (parentId) {
      const parentComment = await ForumDAO.getCommentById(parentId);
      if (parentComment && Number(parentComment.user_id) !== Number(userId) && Number(parentComment.user_id) !== Number(post?.user_id)) {
        await NotificationService.createNotification({
          userId: parentComment.user_id,
          type: 'forum',
          title: '评论收到新回复',
          content: '您在社区中的评论收到了新的回复。',
          relatedType: 'forum_post',
          relatedId: postId,
          actionUrl: `/forum/${postId}`
        });
      }
    }

    // 返回评论详情
    const sql = `
      SELECT c.*, u.username, u.nickname as user_name, u.avatar
      FROM forum_comment c
      LEFT JOIN sys_user u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    const db = require('../config/db');
    const [rows] = await db.promisePool.query(sql, [commentId]);

    return rows[0];
  }

  async deleteComment(id, currentUser) {
    const sql = `SELECT * FROM forum_comment WHERE id = ?`;
    const db = require('../config/db');
    const [rows] = await db.promisePool.query(sql, [id]);
    const comment = rows[0];

    if (!comment) {
      throw new Error('评论不存在');
    }

    const isOwner = Number(comment.user_id) === Number(currentUser.userId);
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
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
