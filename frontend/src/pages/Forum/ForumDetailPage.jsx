import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, message, Avatar, List, Tag, Popconfirm, Modal, Select } from 'antd';
import { LeftOutlined, LikeOutlined, MessageOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './ForumDetailPage.css';

const { TextArea } = Input;

function ForumDetailPage() {
  const categoryOptions = ['经验分享', '求助问答', '宠物展示', '闲聊灌水'];
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, handleTokenExpired } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('闲聊灌水');
  const [updatingCategory, setUpdatingCategory] = useState(false);

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [id]);

  const fetchPostDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forum/posts/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.code === 200) {
        setPost(data.data);
        setLikeCount(data.data.like_count || 0);
        setLiked(Boolean(data.data.hasLiked));
      }
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${id}/comments`);
      const data = await response.json();
      if (data.code === 200) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        const nextLiked = Boolean(data.data?.liked);
        setLiked(nextLiked);
        if (typeof data.data?.like_count === 'number') {
          setLikeCount(data.data.like_count);
        }
        message.success(nextLiked ? '点赞成功' : '取消点赞');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }

    if (!commentText.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/forum/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          content: commentText
        })
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200 || data.code === 201) {
        message.success('评论成功');
        setCommentText('');
        fetchComments();
      } else {
        message.error(data.message || '评论失败');
      }
    } catch (error) {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('删除成功');
        fetchComments();
      } else {
        message.error(data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      '经验分享': '#FF9F43',
      '求助问答': '#54A0FF',
      '宠物展示': '#26D07C',
      '闲聊灌水': '#A29BFE'
    };
    return colors[category] || '#999';
  };

  const isPostOwner = user && post && Number(user.id) === Number(post.user_id);

  const openCategoryModal = () => {
    setSelectedCategory(post?.category || '闲聊灌水');
    setCategoryModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) {
      message.warning('请选择分类');
      return;
    }

    setUpdatingCategory(true);
    try {
      const response = await fetch(`/api/forum/posts/${id}/category`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ category: selectedCategory })
      });

      if (response.status === 401) {
        handleTokenExpired();
        setCategoryModalVisible(false);
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setPost((prev) => ({ ...prev, category: data.data?.category || selectedCategory }));
        setCategoryModalVisible(false);
        message.success('分类更新成功');
      } else {
        message.error(data.message || '分类更新失败');
      }
    } catch (error) {
      message.error('分类更新失败');
    } finally {
      setUpdatingCategory(false);
    }
  };

  if (loading) {
    return <div className="loading-state">加载中...</div>;
  }

  if (!post) {
    return <div className="error-state">帖子不存在</div>;
  }

  return (
    <div className="forum-detail-page">
      <div className="detail-container">
        <Button
          icon={<LeftOutlined />}
          onClick={() => navigate('/forum')}
          className="back-button"
        >
          返回社区
        </Button>

        <Card className="post-detail-card" variant="borderless">
          <div className="post-header">
            <Avatar
              size={56}
              style={{ backgroundColor: '#FF9F43' }}
            >
              {(post.user_name || post.nickname || 'U').charAt(0)}
            </Avatar>
            <div className="author-info">
              <h3 className="author-name">{post.user_name || post.nickname || '匿名用户'}</h3>
              <p className="post-time">{new Date(post.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>

          <div className="post-content">
            <h1 className="post-title">{post.title}</h1>
            <div className="category-row">
              <Tag color={getCategoryColor(post.category)} className="category-tag">
                {post.category}
              </Tag>
              {isPostOwner && (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={openCategoryModal}
                  className="edit-category-btn"
                >
                  编辑分类
                </Button>
              )}
            </div>
            <div className="content-text">
              {post.content?.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <div className="post-actions">
            <Button
              icon={<LikeOutlined />}
              onClick={handleLike}
              type={liked ? 'primary' : 'default'}
              className="like-button"
            >
              {liked ? '已点赞' : '点赞'} ({likeCount})
            </Button>
            <div className="view-count">
              <MessageOutlined /> {post.view_count || 0} 次浏览
            </div>
          </div>
        </Card>

        <Card className="comments-card" variant="borderless">
          <h3 className="comments-title">评论 ({comments.length})</h3>

          <div className="comment-input">
            <TextArea
              rows={4}
              placeholder="写下你的评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              type="primary"
              onClick={handleSubmitComment}
              loading={submitting}
              style={{ marginTop: '12px' }}
            >
              发表评论
            </Button>
          </div>

          <List
            className="comments-list"
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item
                className="comment-item"
                actions={
                  user && comment.user_id === user.id ? [
                    <Popconfirm
                      key="delete"
                      title="确定要删除这条评论吗？"
                      onConfirm={() => handleDeleteComment(comment.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  ] : null
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: '#54A0FF' }}
                    >
                      {(comment.user_name || comment.nickname || 'U').charAt(0)}
                    </Avatar>
                  }
                  title={
                    <div className="comment-header">
                      <span className="comment-author">{comment.user_name || comment.nickname || '匿名用户'}</span>
                      <span className="comment-time">
                        {new Date(comment.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  }
                  description={
                    <div className="comment-content">
                      {comment.content}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>

      <Modal
        title="编辑帖子分类"
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        onOk={handleUpdateCategory}
        okText="保存"
        cancelText="取消"
        confirmLoading={updatingCategory}
      >
        <Select
          value={selectedCategory}
          onChange={setSelectedCategory}
          style={{ width: '100%' }}
          options={categoryOptions.map((category) => ({ label: category, value: category }))}
        />
      </Modal>
    </div>
  );
}

export default ForumDetailPage;
