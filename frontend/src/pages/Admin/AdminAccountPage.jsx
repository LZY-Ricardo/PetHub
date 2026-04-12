import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminManagementPage.css';

function AdminAccountPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  const requestJson = async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
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

  const fetchList = async (nextPagination = pagination) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPagination.current),
        pageSize: String(nextPagination.pageSize)
      });
      const data = await requestJson(`/api/users/admin-accounts?${params.toString()}`);
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
      message.error(error.message || '获取管理员账户失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

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
      render: () => <Tag color="purple">管理员</Tag>
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
    }
  ];

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">管理员账户</h1>
          <p className="admin-management-subtitle">管理员账户在此单独查看，不通过普通用户页进行启停操作。</p>
        </div>
      </div>

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
              fetchList(next);
            }
          }}
        />
      </Card>
    </div>
  );
}

export default AdminAccountPage;
