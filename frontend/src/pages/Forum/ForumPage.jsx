import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Input, Modal, Form, message, Avatar } from 'antd';
import { MessageOutlined, PlusOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ForumPage.css';

const { TextArea } = Input;

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forum/posts');
      const data = await response.json();
      if (data.code === 200) {
        setPosts(data.data?.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
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
      const data = await response.json();
      if (data.code === 200) {
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
      '闲聊灌水': '#A29BFE'
    };
    return colors[category] || '#999';
  };

  return (
    <div className="forum-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <MessageOutlined /> 宠友社区
          </h1>
          <p className="page-subtitle">分享养宠经验，交流养宠心得</p>
        </div>
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

      <div className="forum-content">
        <Card className="forum-card" bordered={false}>
          <List
            loading={loading}
            dataSource={posts}
            renderItem={(post, index) => (
              <List.Item
                key={post.id}
                className="forum-item"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                onClick={() => navigate(`/forum/${post.id}`)}
              >
                <div className="forum-item-content">
                  <div className="post-main">
                    <Avatar
                      size={48}
                      src={post.user_avatar}
                      style={{ backgroundColor: '#FF9F43', flexShrink: 0 }}
                    >
                      {post.nickname?.charAt(0) || 'U'}
                    </Avatar>
                    <div className="post-info">
                      <div className="post-header">
                        <h3 className="post-title">{post.title}</h3>
                        <Tag color={getCategoryColor(post.category)}>{post.category}</Tag>
                      </div>
                      <div className="post-meta">
                        <span className="author">{post.nickname || '匿名用户'}</span>
                        <span className="time">{new Date(post.created_at).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                    <div className="post-stats">
                      <span><EyeOutlined /> {post.view_count || 0}</span>
                      <span><LikeOutlined /> {post.like_count || 0}</span>
                      <span><MessageOutlined /> {post.comment_count || 0}</span>
                    </div>
                  </div>
                  <div className="post-preview">
                    {post.content?.substring(0, 100)}
                    {post.content?.length > 100 ? '...' : ''}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
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
