import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Popconfirm, Statistic, Row, Col, message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MyForumPostsPage.css';

function MyForumPostsPage() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  const fetchMyForumContent = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/forum/posts/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setPosts(data.data?.posts || []);
        setComments(data.data?.comments || []);
      } else {
        message.error(data.message || '获取我的帖子失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyForumContent();
  }, []);

  const handleDeletePost = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
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
        fetchMyForumContent();
      } else {
        message.error(data.message || '删除失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setDeleting(false);
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

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (value, record) => (
        <Button
          type="link"
          className="my-forum-title-link"
          onClick={() => navigate(`/forum/${record.id}`)}
        >
          {value}
        </Button>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (value) => <Tag color={getCategoryColor(value)}>{value || '闲聊灌水'}</Tag>
    },
    {
      title: '浏览',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 90
    },
    {
      title: '点赞',
      dataIndex: 'like_count',
      key: 'like_count',
      width: 90
    },
    {
      title: '评论',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 90
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (value) => new Date(value).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/forum/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm
            title="确认删除这篇帖子？"
            onConfirm={() => handleDeletePost(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} loading={deleting}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="my-forum-page">
      <Card className="my-forum-card" bordered={false}>
        <div className="my-forum-header">
          <div>
            <h1>我的社区帖子</h1>
            <p>查看你发布的帖子，并进行管理。</p>
          </div>
          <Button type="primary" onClick={() => navigate('/forum')}>
            去社区发帖
          </Button>
        </div>

        <Row gutter={16} className="my-forum-stats">
          <Col xs={24} sm={8}>
            <Card bordered={false} className="my-forum-stat-card">
              <Statistic title="我的帖子" value={posts.length} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="my-forum-stat-card">
              <Statistic title="我的评论" value={comments.length} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="my-forum-stat-card">
              <Statistic
                title="累计获赞"
                value={posts.reduce((sum, item) => sum + (Number(item.like_count) || 0), 0)}
              />
            </Card>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={posts}
          loading={loading}
          locale={{ emptyText: '你还没有发布过帖子' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>
    </div>
  );
}

export default MyForumPostsPage;
