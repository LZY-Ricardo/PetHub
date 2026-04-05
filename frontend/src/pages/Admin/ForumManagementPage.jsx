import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag
} from 'antd';
import { message } from '../../utils/antdApp';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import './AdminManagementPage.css';

const categoryOptions = ['经验分享', '求助问答', '宠物展示', '闲聊灌水'];

function ForumManagementPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryTarget, setCategoryTarget] = useState(null);
  const [nextCategory, setNextCategory] = useState('');
  const { handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  const requestJson = async (url, options = {}) => apiClient.request(url, {
    ...options,
    auth: 'required'
  });

  const fetchList = async (nextCategory = category) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '100' });
      if (nextCategory) params.append('category', nextCategory);
      const data = await requestJson(`/api/forum/posts?${params.toString()}`);
      if (data) {
        setList(data.list || []);
      }
    } catch (error) {
      message.error(error.message || '获取帖子列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const stats = useMemo(() => ({
    total: list.length,
    comments: list.reduce((sum, item) => sum + Number(item.comment_count || 0), 0),
    likes: list.reduce((sum, item) => sum + Number(item.like_count || 0), 0),
    views: list.reduce((sum, item) => sum + Number(item.view_count || 0), 0)
  }), [list]);

  const openDetail = async (id) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const data = await requestJson(`/api/forum/posts/${id}`);
      if (data) {
        setCurrentPost(data);
      }
    } catch (error) {
      message.error(error.message || '获取帖子详情失败');
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCategoryModal = (record) => {
    setCategoryTarget(record);
    setNextCategory(record.category || '闲聊灌水');
    setCategoryModalOpen(true);
  };

  const updateCategory = async () => {
    if (!categoryTarget || !nextCategory) {
      return;
    }
    try {
      await requestJson(`/api/forum/posts/${categoryTarget.id}/category`, {
        method: 'PUT',
        body: { category: nextCategory }
      });
      message.success('分类已更新');
      setCategoryModalOpen(false);
      fetchList();
      if (currentPost?.id === categoryTarget.id) {
        openDetail(categoryTarget.id);
      }
    } catch (error) {
      message.error(error.message || '分类更新失败');
    }
  };

  const deletePost = async (record) => {
    try {
      await requestJson(`/api/forum/posts/${record.id}`, { method: 'DELETE' });
      message.success('帖子已删除');
      fetchList();
      if (currentPost?.id === record.id) {
        setDetailVisible(false);
        setCurrentPost(null);
      }
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await requestJson(`/api/forum/comments/${commentId}`, { method: 'DELETE' });
      message.success('评论已删除');
      if (currentPost?.id) {
        openDetail(currentPost.id);
      }
      fetchList();
    } catch (error) {
      message.error(error.message || '删除评论失败');
    }
  };

  const columns = [
    {
      title: '帖子',
      dataIndex: 'title',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{value}</div>
          <div style={{ marginTop: 4, color: '#64748b' }}>{record.user_name || '匿名用户'}</div>
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: (value) => <Tag color="blue">{value || '闲聊灌水'}</Tag>
    },
    {
      title: '热度',
      key: 'heat',
      render: (_, record) => (
        <Space size={12}>
          <span>浏览 {record.view_count || 0}</span>
          <span>点赞 {record.like_count || 0}</span>
          <span>评论 {record.comment_count || 0}</span>
        </Space>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 230,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
            详情
          </Button>
          <Button type="link" onClick={() => openCategoryModal(record)}>
            改分类
          </Button>
          <Popconfirm
            title="确认删除这篇帖子？"
            description="帖子及其讨论将一并删除。"
            okText="删除"
            cancelText="取消"
            onConfirm={() => deletePost(record)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">宠友社区管理</h1>
          <p className="admin-management-subtitle">查看帖子热度、调整分类、删除异常内容。</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><Card className="admin-stats-card"><Statistic title="帖子数" value={stats.total} /></Card></Col>
        <Col xs={24} md={6}><Card className="admin-stats-card"><Statistic title="评论数" value={stats.comments} /></Card></Col>
        <Col xs={24} md={6}><Card className="admin-stats-card"><Statistic title="点赞数" value={stats.likes} /></Card></Col>
        <Col xs={24} md={6}><Card className="admin-stats-card"><Statistic title="浏览量" value={stats.views} /></Card></Col>
      </Row>

      <Card className="admin-filter-card">
        <div className="admin-filter-row">
          <Select
            style={{ width: 180 }}
            value={category}
            onChange={(value) => setCategory(value)}
            options={[{ label: '全部分类', value: '' }, ...categoryOptions.map((item) => ({ label: item, value: item }))]}
          />
          <Button type="primary" onClick={() => fetchList(category)}>查询</Button>
          <Button onClick={() => {
            setCategory('');
            fetchList('');
          }}>重置</Button>
        </div>
      </Card>

      <Card className="admin-table-card">
        <Table rowKey="id" columns={columns} dataSource={list} loading={loading} className="admin-management-table" />
      </Card>

      <Drawer
        title="帖子详情"
        width={680}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnHidden
      >
        {currentPost && !detailLoading && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="标题">{currentPost.title}</Descriptions.Item>
              <Descriptions.Item label="作者">{currentPost.user_name || '匿名用户'}</Descriptions.Item>
              <Descriptions.Item label="分类"><Tag color="blue">{currentPost.category || '闲聊灌水'}</Tag></Descriptions.Item>
              <Descriptions.Item label="热度">
                浏览 {currentPost.view_count || 0} / 点赞 {currentPost.like_count || 0} / 评论 {currentPost.comment_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {currentPost.created_at ? new Date(currentPost.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">正文</h3>
              <p className="admin-detail-text">{currentPost.content || '暂无'}</p>
            </div>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">评论列表</h3>
              <div className="admin-stack">
                {(currentPost.comments || []).length === 0 && (
                  <p className="admin-detail-text">暂无评论</p>
                )}
                {(currentPost.comments || []).map((comment) => (
                  <Card key={comment.id} size="small">
                    <div className="admin-card-actions" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <strong>{comment.user_name || '匿名用户'}</strong>
                        <div style={{ color: '#64748b', marginTop: 4 }}>
                          {comment.created_at ? new Date(comment.created_at).toLocaleString('zh-CN') : '-'}
                        </div>
                      </div>
                      <Popconfirm
                        title="确认删除这条评论？"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => deleteComment(comment.id)}
                      >
                        <Button type="link" danger size="small">
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                    <p style={{ margin: '12px 0 0', color: '#334155', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="调整帖子分类"
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onOk={updateCategory}
        okText="保存"
        cancelText="取消"
      >
        <Select
          style={{ width: '100%' }}
          value={nextCategory}
          onChange={setNextCategory}
          options={categoryOptions.map((item) => ({ label: item, value: item }))}
        />
      </Modal>
    </div>
  );
}

export default ForumManagementPage;
