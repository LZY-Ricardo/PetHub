const ForumService = require('../services/ForumService');
const { success, error, forbidden } = require('../utils/response');

class ForumController {
  async getPostList(ctx) {
    try {
      const { page = 1, pageSize = 10 } = ctx.query;
      const result = await ForumService.getPostList(parseInt(page), parseInt(pageSize));
      success(ctx, result);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getPostDetail(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.userId;
      const post = await ForumService.getPostDetail(parseInt(id), userId);
      success(ctx, post);
    } catch (err) {
      if (err.message === '帖子不存在') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async createPost(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const data = ctx.request.body;

      const post = await ForumService.createPost(data, userId);
      success(ctx, post, '发布成功', 201);
    } catch (err) {
      if (err.message.includes('不能为空') || err.message.includes('分类无效')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async deletePost(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.userId;

      await ForumService.deletePost(parseInt(id), userId);
      success(ctx, null, '删除成功');
    } catch (err) {
      if (err.message === '帖子不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '无权删除此帖子') {
        forbidden(ctx, err.message);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async getComments(ctx) {
    try {
      const { id } = ctx.params;
      const comments = await ForumService.getComments(parseInt(id));
      success(ctx, comments);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async createComment(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.userId;
      const { content, parentId } = ctx.request.body;

      const comment = await ForumService.createComment(parseInt(id), userId, content, parentId);
      success(ctx, comment, '评论成功', 201);
    } catch (err) {
      if (err.message.includes('不能为空')) {
        error(ctx, err.message, 400);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async deleteComment(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.userId;

      await ForumService.deleteComment(parseInt(id), userId);
      success(ctx, null, '删除成功');
    } catch (err) {
      if (err.message === '评论不存在') {
        error(ctx, err.message, 404);
      } else if (err.message === '无权删除此评论') {
        forbidden(ctx, err.message);
      } else {
        error(ctx, err.message, 500);
      }
    }
  }

  async toggleLike(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.userId;

      const result = await ForumService.toggleLike(parseInt(id), userId);
      success(ctx, result, result.liked ? '点赞成功' : '取消点赞');
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }

  async getMyContent(ctx) {
    try {
      const userId = ctx.state.user.userId;
      const content = await ForumService.getMyContent(userId);
      success(ctx, content);
    } catch (err) {
      error(ctx, err.message, 500);
    }
  }
}

module.exports = new ForumController();
