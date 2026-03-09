const BaseDAO = require('./BaseDAO');

class ForumDAO {
  constructor() {
    this.postPool = require('../config/db').promisePool;
  }

  // Posts
  async getPostList(page = 1, pageSize = 10) {
    const sql = `
      SELECT p.*, u.username, u.nickname as user_name, u.avatar,
             COUNT(DISTINCT c.id) as comment_count,
             COUNT(DISTINCT l.id) as like_count
      FROM forum_post p
      LEFT JOIN sys_user u ON p.user_id = u.id
      LEFT JOIN forum_comment c ON p.id = c.post_id
      LEFT JOIN forum_like l ON p.id = l.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.postPool.query(sql, [pageSize, (page - 1) * pageSize]);

    const [countResult] = await this.postPool.query('SELECT COUNT(*) as total FROM forum_post');

    rows.forEach(row => {
      if (row.images) {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          row.images = [];
        }
      }
    });

    return { list: rows, total: countResult[0].total, page, pageSize };
  }

  async getPostDetail(id) {
    const sql = `
      SELECT p.*, u.username, u.nickname as user_name, u.avatar,
             (SELECT COUNT(*) FROM forum_like l WHERE l.post_id = p.id) as like_count,
             (SELECT COUNT(*) FROM forum_comment c WHERE c.post_id = p.id) as comment_count
      FROM forum_post p
      LEFT JOIN sys_user u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    const [rows] = await this.postPool.query(sql, [id]);
    const row = rows[0];

    if (row && row.images) {
      try {
        row.images = JSON.parse(row.images);
      } catch (e) {
        row.images = [];
      }
    }

    return row || null;
  }

  async createPost(data, userId) {
    const { title, content, images } = data;
    const sql = `
      INSERT INTO forum_post (user_id, title, content, images)
      VALUES (?, ?, ?, ?)
    `;
    const imagesJson = images ? JSON.stringify(images) : null;
    const [result] = await this.postPool.query(sql, [userId, title, content, imagesJson]);

    // 增加浏览计数
    await this.incrementViewCount(result.insertId);

    return result.insertId;
  }

  async deletePost(id) {
    const sql = `DELETE FROM forum_post WHERE id = ?`;
    const [result] = await this.postPool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async incrementViewCount(id) {
    const sql = `UPDATE forum_post SET view_count = view_count + 1 WHERE id = ?`;
    await this.postPool.query(sql, [id]);
  }

  // Comments
  async getComments(postId) {
    const sql = `
      SELECT c.*, u.username, u.nickname as user_name, u.avatar
      FROM forum_comment c
      LEFT JOIN sys_user u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;
    const [rows] = await this.postPool.query(sql, [postId]);
    return rows;
  }

  async createComment(postId, userId, content, parentId = null) {
    const sql = `
      INSERT INTO forum_comment (post_id, user_id, content, parent_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await this.postPool.query(sql, [postId, userId, content, parentId]);
    return result.insertId;
  }

  async deleteComment(id) {
    const sql = `DELETE FROM forum_comment WHERE id = ?`;
    const [result] = await this.postPool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Likes
  async toggleLike(postId, userId) {
    const checkSql = `SELECT id FROM forum_like WHERE post_id = ? AND user_id = ?`;
    const [existing] = await this.postPool.query(checkSql, [postId, userId]);

    if (existing.length > 0) {
      // 取消点赞
      const deleteSql = `DELETE FROM forum_like WHERE post_id = ? AND user_id = ?`;
      await this.postPool.query(deleteSql, [postId, userId]);
      const [countRows] = await this.postPool.query(
        'SELECT COUNT(*) as like_count FROM forum_like WHERE post_id = ?',
        [postId]
      );
      return { liked: false, like_count: countRows[0].like_count };
    } else {
      // 点赞
      const insertSql = `INSERT INTO forum_like (post_id, user_id) VALUES (?, ?)`;
      await this.postPool.query(insertSql, [postId, userId]);
      const [countRows] = await this.postPool.query(
        'SELECT COUNT(*) as like_count FROM forum_like WHERE post_id = ?',
        [postId]
      );
      return { liked: true, like_count: countRows[0].like_count };
    }
  }

  async checkLike(postId, userId) {
    const sql = `SELECT id FROM forum_like WHERE post_id = ? AND user_id = ?`;
    const [rows] = await this.postPool.query(sql, [postId, userId]);
    return rows.length > 0;
  }

  // User's content
  async getUserPosts(userId) {
    const sql = `
      SELECT p.*,
             COUNT(DISTINCT c.id) as comment_count,
             COUNT(DISTINCT l.id) as like_count
      FROM forum_post p
      LEFT JOIN forum_comment c ON p.id = c.post_id
      LEFT JOIN forum_like l ON p.id = l.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const [rows] = await this.postPool.query(sql, [userId]);

    rows.forEach(row => {
      if (row.images) {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          row.images = [];
        }
      }
    });

    return rows;
  }

  async getUserComments(userId) {
    const sql = `
      SELECT c.*, p.title as post_title
      FROM forum_comment c
      LEFT JOIN forum_post p ON c.post_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;
    const [rows] = await this.postPool.query(sql, [userId]);
    return rows;
  }
}

module.exports = new ForumDAO();
