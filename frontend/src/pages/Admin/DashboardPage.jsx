import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    fetchStats();
    fetchPendingAdoptions();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app, this would be a single API call
      const [usersRes, petsRes, postsRes] = await Promise.all([
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/pets'),
        fetch('/api/forum/posts')
      ]);

      const usersData = await usersRes.json();
      const petsData = await petsRes.json();
      const postsData = await postsRes.json();

      setStats({
        totalUsers: usersData.data?.length || 0,
        totalPets: petsData.data?.length || 0,
        totalPosts: postsData.data?.length || 0,
        pendingAdoptions: 0 // Will be updated by fetchPendingAdoptions
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchPendingAdoptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/adoptions/admin', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.code === 200) {
        const pending = data.data?.filter(a => a.status === 'pending') || [];
        setAdoptions(pending);
        setStats(prev => ({ ...prev, pendingAdoptions: pending.length }));
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
      dataIndex: 'applicant_name',
      key: 'applicant_name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
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
          onClick={() => navigate('/adoptions')}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">管理控制台</h1>
        <p className="page-subtitle">系统数据统计与管理</p>
      </div>

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
