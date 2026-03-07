import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, message, Avatar, List, Tag } from 'antd';
import { LeftOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './ForumDetailPage.css';

const { TextArea } = Input;

function ForumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [id]);

  const fetchPostDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forum/posts/${id}`);
      const data = await response.json();
      if (data.code === 200) {
        setPost(data.data);
        setLikeCount(data.data.like_count || 0);
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await response.json();
      if (data.code === 200) {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        message.success(liked ? '取消点赞' : '点赞成功');
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
      const data = await response.json();
      if (data.code === 200) {
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

  const getCategoryColor = (category) => {
    const colors = {
      '经验分享': '#FF9F43',
      '求助问答': '#54A0FF',
      '宠物展示': '#26D07C',
      '闲聊灌水': '#A29BFE'
    };
    return colors[category] || '#999';
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

        <Card className="post-detail-card" bordered={false}>
          <div className="post-header">
            <Avatar
              size={56}
              style={{ backgroundColor: '#FF9F43' }}
            >
              {post.nickname?.charAt(0) || 'U'}
            </Avatar>
            <div className="author-info">
              <h3 className="author-name">{post.nickname || '匿名用户'}</h3>
              <p className="post-time">{new Date(post.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>

          <div className="post-content">
            <h1 className="post-title">{post.title}</h1>
            <Tag color={getCategoryColor(post.category)} className="category-tag">
              {post.category}
            </Tag>
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

        <Card className="comments-card" bordered={false}>
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
              <List.Item className="comment-item">
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: '#54A0FF' }}
                    >
                      {comment.nickname?.charAt(0) || 'U'}
                    </Avatar>
                  }
                  title={
                    <div className="comment-header">
                      <span className="comment-author">{comment.nickname || '匿名用户'}</span>
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
    </div>
  );
}

export default ForumDetailPage;
