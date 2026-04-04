import React, { useState, useEffect } from 'react';
import { Tag, Button, Input, Modal, Form, Avatar, Empty } from 'antd';
import { message } from '../../utils/antdApp';
import { MessageOutlined, PlusOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ForumPage.css';

const { TextArea } = Input;

function ForumPage() {
  const categoryOptions = ['全部', '经验分享', '求助问答', '宠物展示', '闲聊灌水'];
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [form] = Form.useForm();
  const { user, handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== '全部') {
        params.append('category', activeCategory);
      }

      const response = await fetch(`/api/forum/posts${params.toString() ? `?${params.toString()}` : ''}`);
      const data = await response.json();
      if (data.code === 200) {
        setPosts(data.data?.list || []);
      } else {
        message.error(data.message || '获取帖子失败');
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      message.error('获取帖子失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setPostVisible(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...values,
          userId: user.id
        })
      });

      if (response.status === 401) {
        handleTokenExpired();
        setPostVisible(false);
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200 || data.code === 201) {
        message.success('发布成功');
        setPostVisible(false);
        form.resetFields();
        fetchPosts();
      } else {
        message.error(data.message || '发布失败');
      }
    } catch (error) {
      message.error('发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      '经验分享': '#FF9F43',
      '求助问答': '#54A0FF',
      '宠物展示': '#26D07C',
      '闲聊灌水': '#8B7355'
    };
    return colors[category] || '#999';
  };

  return (
    <div className="forum-page">
      <section className="forum-hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-kicker">PET TALK</span>
            <h1 className="forum-title">
              <MessageOutlined /> 宠友社区
            </h1>
            <p className="forum-subtitle">分享养宠经验，交流养宠心得，记录每一段和毛孩子有关的故事。</p>
            <div className="hero-meta">
              <span className="hero-pill"><MessageOutlined /> {posts.length} 篇帖子</span>
              <span className="hero-pill">分类：{activeCategory}</span>
            </div>
          </div>
          <div className="hero-action">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreatePost}
              className="create-button"
            >
              发布帖子
            </Button>
          </div>
        </div>
      </section>

      <div className="forum-content">
        <div className="forum-filter-bar">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="forum-list-shell">
          {loading ? (
            <div className="forum-loading">加载中...</div>
          ) : posts.length === 0 ? (
            <Empty description="还没有帖子，来发布第一条吧" />
          ) : (
            <div className="forum-grid">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="forum-item-card"
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both` }}
                  onClick={() => navigate(`/forum/${post.id}`)}
                >
                  <div className="forum-item-head">
                    <div className="post-author">
                      <Avatar
                        size={48}
                        src={post.avatar || post.user_avatar}
                        style={{ backgroundColor: '#FF9F43', flexShrink: 0 }}
                      >
                        {(post.user_name || post.nickname || 'U').charAt(0)}
                      </Avatar>
                      <div className="post-author-info">
                        <div className="author-row">
                          <span className="forum-post-author-name">{post.user_name || post.nickname || '匿名用户'}</span>
                          <span className="forum-post-time">{new Date(post.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <Tag color={getCategoryColor(post.category)} className="forum-category-tag">
                          {post.category || '闲聊灌水'}
                        </Tag>
                      </div>
                    </div>
                    <div className="forum-post-stats">
                      <span className="stat-chip"><EyeOutlined /> {post.view_count || 0}</span>
                      <span className="stat-chip"><LikeOutlined /> {post.like_count || 0}</span>
                      <span className="stat-chip"><MessageOutlined /> {post.comment_count || 0}</span>
                    </div>
                  </div>

                  <h3 className="forum-post-title">{post.title}</h3>
                  <div className="forum-post-preview">
                    {post.content?.substring(0, 140)}
                    {post.content?.length > 140 ? '...' : ''}
                  </div>
                  <div className="post-link-hint">点击查看完整讨论</div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title="发布新帖"
        open={postVisible}
        onCancel={() => setPostVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[
              { required: true, message: '请输入帖子标题' },
              { max: 100, message: '标题最多100字' }
            ]}
          >
            <Input placeholder="请输入帖子标题" size="large" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <select className="ant-input" style={{ height: '40px', borderRadius: '6px', padding: '4px 12px' }}>
              <option value="">请选择分类</option>
              <option value="经验分享">经验分享</option>
              <option value="求助问答">求助问答</option>
              <option value="宠物展示">宠物展示</option>
              <option value="闲聊灌水">闲聊灌水</option>
            </select>
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[
              { required: true, message: '请输入帖子内容' },
              { min: 10, message: '内容至少10个字' }
            ]}
          >
            <TextArea rows={8} placeholder="请输入帖子内容，分享您的养宠经验或提问..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block size="large">
              发布
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ForumPage;
