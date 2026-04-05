import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Popconfirm } from 'antd';
import { message } from '../../utils/antdApp';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import './MyLostPetPage.css';

function MyLostPetPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  const fetchMyLostPets = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/lost-pets/my', { auth: 'required' });
      setList(data || []);
    } catch (error) {
      message.error(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLostPets();
  }, []);

  const handleMarkAsFound = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/lost-pets/${id}/found`, undefined, { auth: 'required' });
      message.success('已标记为找回');
      fetchMyLostPets();
    } catch (error) {
      message.error(error.message || '网络错误，请稍后重试');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/api/lost-pets/${id}`, { auth: 'required' });
      message.success('删除成功');
      fetchMyLostPets();
    } catch (error) {
      message.error(error.message || '网络错误，请稍后重试');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: '宠物名称',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <span className="my-lost-name">{value}</span>
    },
    {
      title: '走失地点',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '走失时间',
      dataIndex: 'lost_time',
      key: 'lost_time',
      render: (value) => new Date(value).toLocaleString('zh-CN')
    },
    {
      title: '状态',
      dataIndex: 'is_found',
      key: 'is_found',
      render: (value) => value
        ? <Tag color="#26D07C">已找回</Tag>
        : <Tag color="#FF6B6B">走失中</Tag>
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => new Date(value).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {!record.is_found && (
            <Popconfirm
              title="确认标记为已找回？"
              onConfirm={() => handleMarkAsFound(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
              >
                标记找回
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除这条寻宠信息？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={actionLoading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="my-lost-page">
      <Card className="my-lost-card" variant="borderless">
        <div className="my-lost-header">
          <div>
            <h1>我的寻宠发布</h1>
            <p>管理你发布的寻宠信息，及时更新宠物状态。</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/lost-pets')}>
            去发布新寻宠
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          locale={{ emptyText: '你还没有发布过寻宠信息' }}
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

export default MyLostPetPage;
