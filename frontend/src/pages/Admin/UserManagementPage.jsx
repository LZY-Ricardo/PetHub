import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminManagementPage.css';

function UserManagementPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
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

  const fetchList = async (nextPagination = pagination, nextKeyword = keyword) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPagination.current),
        pageSize: String(nextPagination.pageSize),
        role: 'user'
      });
      if (nextKeyword.trim()) {
        params.append('keyword', nextKeyword.trim());
      }

      const data = await requestJson(`/api/users?${params.toString()}`);
      if (data) {
        setList(data.list || []);
        setPagination((prev) => ({
          ...prev,
          current: data.page || nextPagination.current,
          pageSize: data.pageSize || nextPagination.pageSize,
          total: data.total || 0
        }));
      }
    } catch (error) {
      message.error(error.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const toggleStatus = async (record) => {
    try {
      await requestJson(`/api/users/${record.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: Number(record.status) === 1 ? 0 : 1 })
      });
      message.success(Number(record.status) === 1 ? '用户已禁用' : '用户已启用');
      fetchList();
    } catch (error) {
      message.error(error.message || '状态更新失败');
    }
  };

  const columns = [
    {
      title: '账号',
      dataIndex: 'username',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{value}</div>
          <div style={{ marginTop: 4, color: '#64748b' }}>{record.nickname || '-'}</div>
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (value) => (
        <Tag color={value === 'admin' ? 'purple' : 'blue'}>
          {value === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '联系方式',
      dataIndex: 'contact_info',
      render: (value) => value || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'green' : 'red'}>
          {Number(value) === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Button type="link" onClick={() => toggleStatus(record)}>
          {Number(record.status) === 1 ? '禁用' : '启用'}
        </Button>
      )
    }
  ];

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">用户管理</h1>
          <p className="admin-management-subtitle">查看账号状态并执行启停控制。</p>
        </div>
      </div>

      <Card className="admin-filter-card">
        <div className="admin-filter-row">
          <Input
            allowClear
            style={{ width: 240 }}
            placeholder="搜索用户名或昵称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={() => {
              const next = { ...pagination, current: 1 };
              setPagination(next);
              fetchList(next, keyword);
            }}
          />
          <Button type="primary" onClick={() => {
            const next = { ...pagination, current: 1 };
            setPagination(next);
            fetchList(next, keyword);
          }}>查询</Button>
          <Button onClick={() => {
            const next = { ...pagination, current: 1 };
            setKeyword('');
            setPagination(next);
            fetchList(next, '');
          }}>重置</Button>
        </div>
      </Card>

      <Card className="admin-table-card">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          className="admin-management-table"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              const next = { ...pagination, current: page, pageSize };
              setPagination(next);
              fetchList(next, keyword);
            }
          }}
        />
      </Card>
    </div>
  );
}

export default UserManagementPage;
