import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message
} from 'antd';
import { CheckOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminManagementPage.css';

function LostPetManagementPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ isFound: '', isUrgent: '' });
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const { handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  const requestJson = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      handleTokenExpired();
      navigate('/login', { replace: true });
      return null;
    }

    const data = await response.json();
    if (data.code !== 200) {
      throw new Error(data.message || '请求失败');
    }
    return data.data;
  };

  const fetchList = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '100' });
      if (nextFilters.isFound !== '') params.append('isFound', nextFilters.isFound);
      if (nextFilters.isUrgent !== '') params.append('isUrgent', nextFilters.isUrgent);
      const data = await requestJson(`/api/lost-pets?${params.toString()}`);
      if (data) {
        setList(data.list || []);
      }
    } catch (error) {
      message.error(error.message || '获取寻回信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const stats = useMemo(() => ({
    total: list.length,
    found: list.filter((item) => Number(item.is_found) === 1).length,
    urgent: list.filter((item) => Number(item.is_urgent) === 1).length,
    unresolved: list.filter((item) => Number(item.is_found) !== 1).length
  }), [list]);

  const openDetail = async (id) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const data = await requestJson(`/api/lost-pets/${id}`);
      if (data) {
        setCurrentRecord(data);
      }
    } catch (error) {
      message.error(error.message || '获取详情失败');
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkFound = async (record) => {
    try {
      await requestJson(`/api/lost-pets/${record.id}/found`, {
        method: 'PATCH'
      });
      message.success('已标记为找回');
      fetchList();
      if (currentRecord?.id === record.id) {
        openDetail(record.id);
      }
    } catch (error) {
      message.error(error.message || '标记失败');
    }
  };

  const handleDelete = async (record) => {
    try {
      await requestJson(`/api/lost-pets/${record.id}`, {
        method: 'DELETE'
      });
      message.success('记录已删除');
      fetchList();
      if (currentRecord?.id === record.id) {
        setDetailVisible(false);
        setCurrentRecord(null);
      }
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '宠物名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{value}</div>
          <div style={{ marginTop: 4, color: '#64748b' }}>{record.location || '-'}</div>
        </div>
      )
    },
    {
      title: '紧急度',
      dataIndex: 'is_urgent',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'red' : 'default'}>
          {Number(value) === 1 ? '紧急' : '普通'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'is_found',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'green' : 'gold'}>
          {Number(value) === 1 ? '已找回' : '寻回中'}
        </Tag>
      )
    },
    {
      title: '发布人',
      dataIndex: 'user_name',
      render: (value) => value || '-'
    },
    {
      title: '联系电话',
      dataIndex: 'contact',
      render: (value) => value || '-'
    },
    {
      title: '走失时间',
      dataIndex: 'lost_time',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
            详情
          </Button>
          {Number(record.is_found) !== 1 && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleMarkFound(record)}>
              标记找回
            </Button>
          )}
          <Popconfirm
            title="确认删除这条寻回记录？"
            description="删除后不可恢复。"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
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
          <h1 className="admin-management-title">宠物寻回管理</h1>
          <p className="admin-management-subtitle">处理寻宠启事、紧急状态和找回闭环。</p>
        </div>
      </div>

      <div className="admin-grid">
        <Card className="admin-stats-card admin-grid-col-3">
          <Statistic title="总记录" value={stats.total} />
        </Card>
        <Card className="admin-stats-card admin-grid-col-3">
          <Statistic title="寻回中" value={stats.unresolved} />
        </Card>
        <Card className="admin-stats-card admin-grid-col-3">
          <Statistic title="已找回" value={stats.found} />
        </Card>
        <Card className="admin-stats-card admin-grid-col-3">
          <Statistic title="紧急记录" value={stats.urgent} />
        </Card>
      </div>

      <Card className="admin-filter-card">
        <div className="admin-filter-row">
          <Select
            style={{ width: 160 }}
            value={filters.isFound}
            onChange={(value) => setFilters((prev) => ({ ...prev, isFound: value }))}
            options={[
              { label: '全部状态', value: '' },
              { label: '寻回中', value: 'false' },
              { label: '已找回', value: 'true' }
            ]}
          />
          <Select
            style={{ width: 160 }}
            value={filters.isUrgent}
            onChange={(value) => setFilters((prev) => ({ ...prev, isUrgent: value }))}
            options={[
              { label: '全部紧急度', value: '' },
              { label: '紧急', value: 'true' },
              { label: '普通', value: 'false' }
            ]}
          />
          <Button type="primary" onClick={() => fetchList(filters)}>查询</Button>
          <Button onClick={() => {
            const next = { isFound: '', isUrgent: '' };
            setFilters(next);
            fetchList(next);
          }}>重置</Button>
        </div>
      </Card>

      <Card className="admin-table-card">
        <Table rowKey="id" columns={columns} dataSource={list} loading={loading} className="admin-management-table" />
      </Card>

      <Drawer
        title="寻回详情"
        width={560}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnHidden
      >
        {currentRecord && !detailLoading && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="宠物名称">{currentRecord.name}</Descriptions.Item>
              <Descriptions.Item label="位置">{currentRecord.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="发布人">{currentRecord.user_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentRecord.contact || '-'}</Descriptions.Item>
              <Descriptions.Item label="紧急度">
                <Tag color={Number(currentRecord.is_urgent) === 1 ? 'red' : 'default'}>
                  {Number(currentRecord.is_urgent) === 1 ? '紧急' : '普通'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={Number(currentRecord.is_found) === 1 ? 'green' : 'gold'}>
                  {Number(currentRecord.is_found) === 1 ? '已找回' : '寻回中'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="走失时间">
                {currentRecord.lost_time ? new Date(currentRecord.lost_time).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">描述</h3>
              <p className="admin-detail-text">{currentRecord.description || '暂无'}</p>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

export default LostPetManagementPage;
