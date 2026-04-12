import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Descriptions, Drawer, Popconfirm, Row, Space, Statistic, Table } from 'antd';
import { message } from '../../utils/antdApp';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import './AdminManagementPage.css';

function NotificationManagementPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const { handleTokenExpired } = useAuth();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/admin/notifications', {
        auth: 'required',
        params: { page: 1, pageSize: 100 }
      });
      setRecords(data?.list || []);
    } catch (error) {
      message.error(error.message || '获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [handleTokenExpired]);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/admin/notifications/${id}`, { auth: 'required' });
      message.success('公告已删除');
      if (currentRecord?.id === id) {
        setDetailOpen(false);
        setCurrentRecord(null);
      }
      fetchRecords();
    } catch (error) {
      message.error(error.message || '删除公告失败');
    }
  };

  const stats = {
    total: records.length,
    delivered: records.reduce((sum, item) => sum + Number(item.delivered_count || 0), 0)
  };

  const columns = [
    {
      title: '公告标题',
      dataIndex: 'title',
      key: 'title',
      render: (value) => <span style={{ fontWeight: 600, color: '#111827' }}>{value}</span>
    },
    {
      title: '发送对象',
      dataIndex: 'target_role',
      key: 'target_role',
      render: () => '普通用户'
    },
    {
      title: '送达人数',
      dataIndex: 'delivered_count',
      key: 'delivered_count'
    },
    {
      title: '发布人',
      dataIndex: 'creator_name',
      key: 'creator_name',
      render: (value) => value || '管理员'
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => {
            setCurrentRecord(record);
            setDetailOpen(true);
          }}>
            详情
          </Button>
          <Popconfirm
            title="确认删除这条公告？"
            description="删除后，已推送的系统公告也会一并移除。"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
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
          <h1 className="admin-management-title">公告管理</h1>
          <p className="admin-management-subtitle">查看和管理系统发布的全部公告</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="admin-stats-card">
            <Statistic title="公告数" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="admin-stats-card">
            <Statistic title="累计送达用户" value={stats.delivered} />
          </Card>
        </Col>
      </Row>

      <Card className="admin-table-card">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading}
          className="admin-management-table"
          locale={{ emptyText: '暂无系统公告' }}
        />
      </Card>

      <Drawer
        title="公告详情"
        open={detailOpen}
        width={640}
        onClose={() => setDetailOpen(false)}
        destroyOnHidden
      >
        {currentRecord && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="公告标题">{currentRecord.title}</Descriptions.Item>
              <Descriptions.Item label="发送对象">普通用户</Descriptions.Item>
              <Descriptions.Item label="送达人数">{currentRecord.delivered_count || 0}</Descriptions.Item>
              <Descriptions.Item label="发布人">{currentRecord.creator_name || '管理员'}</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {currentRecord.created_at ? new Date(currentRecord.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">公告内容</h3>
              <p className="admin-detail-text">{currentRecord.content || '暂无'}</p>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

export default NotificationManagementPage;
