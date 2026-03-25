import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, message } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './DashboardPage.css';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalPosts: 0,
    pendingAdoptions: 0
  });
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();

  useEffect(() => {
    fetchStats();
    fetchPendingAdoptions();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      if (response.status === 403) {
        message.error('无权限访问管理数据');
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setStats({
          totalUsers: data.data?.user_count || 0,
          totalPets: data.data?.pet_count || 0,
          totalPosts: data.data?.post_count || 0,
          pendingAdoptions: data.data?.pending_adoption_count || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchPendingAdoptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAdoptions([]);
        return;
      }

      const response = await fetch('/api/adoptions?page=1&pageSize=20&status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        handleTokenExpired();
        setAdoptions([]);
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        const pending = data.data?.list || [];
        setAdoptions(pending);
        setStats(prev => ({ ...prev, pendingAdoptions: data.data?.total || prev.pendingAdoptions }));
      }
    } catch (error) {
      console.error('Failed to fetch pending adoptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAdoptions = () => {
    navigate('/adoptions');
  };

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '宠物名称',
      dataIndex: 'pet_name',
      key: 'pet_name',
    },
    {
      title: '申请人',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: '联系电话',
      dataIndex: 'contact',
      key: 'contact',
      render: (text) => text || '-',
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/adoptions?focusId=${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <h1 className="dashboard-hero-title">管理控制台</h1>
          <p className="dashboard-hero-subtitle">系统数据统计与管理</p>
        </div>
      </section>

      <div className="stats-wrap">
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-users">
              <Statistic
                title="总用户数"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#FF9F43' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-pets">
              <Statistic
                title="总宠物数"
                value={stats.totalPets}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#54A0FF' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-posts">
              <Statistic
                title="总帖子数"
                value={stats.totalPosts}
                prefix={<MessageOutlined />}
                valueStyle={{ color: '#A29BFE' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-pending">
              <Statistic
                title="待审核"
                value={stats.pendingAdoptions}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#26D07C' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Card
        className="pending-card"
        title={
          <div className="card-title">
            <CheckCircleOutlined />
            <span>待审核领养申请</span>
          </div>
        }
        extra={
          <Button onClick={handleViewAdoptions}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={adoptions}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: '暂无待审核申请' }}
        />
      </Card>
    </div>
  );
}

export default DashboardPage;
