import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { message } from '../../utils/antdApp';
import {
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  SolutionOutlined,
  ShopOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, isApiError } from '../../utils/apiClient';
import './DashboardPage.css';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalPosts: 0,
    pendingAdoptions: 0,
    pendingSubmissions: 0,
    pendingBoarding: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/admin/dashboard', { auth: 'required' });
      setStats({
        totalUsers: Number(data?.user_count) || 0,
        totalPets: Number(data?.pet_count) || 0,
        totalPosts: Number(data?.post_count) || 0,
        pendingAdoptions: Number(data?.pending_adoption_count) || 0,
        pendingSubmissions: Number(data?.pending_submission_count) || 0,
        pendingBoarding: Number(data?.pending_boarding_count) || 0
      });
    } catch (error) {
      if (isApiError(error) && error.status === 403) {
        message.error('无权限访问管理数据');
      } else {
        message.error(error.message || '获取仪表盘数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPending = useMemo(() => {
    return stats.pendingSubmissions + stats.pendingAdoptions + stats.pendingBoarding;
  }, [stats.pendingAdoptions, stats.pendingBoarding, stats.pendingSubmissions]);

  const pendingCards = [
    {
      key: 'submission',
      title: '待审核送养发布',
      value: stats.pendingSubmissions,
      icon: <AuditOutlined />,
      actionLabel: '去审核',
      onClick: () => navigate('/admin/pet-submissions')
    },
    {
      key: 'adoption',
      title: '待处理领养申请',
      value: stats.pendingAdoptions,
      icon: <SolutionOutlined />,
      actionLabel: '去处理',
      onClick: () => navigate('/admin/adoptions')
    },
    {
      key: 'boarding',
      title: '待处理寄养申请',
      value: stats.pendingBoarding,
      icon: <ShopOutlined />,
      actionLabel: '去处理',
      onClick: () => navigate('/admin/boarding')
    }
  ];

  const quickLinks = [
    {
      key: 'pet-submissions',
      title: '送养审核',
      description: '处理用户发布的待审核送养信息',
      icon: <AuditOutlined />,
      onClick: () => navigate('/admin/pet-submissions')
    },
    {
      key: 'adoptions',
      title: '领养申请',
      description: '查看并审核用户领养申请',
      icon: <SolutionOutlined />,
      onClick: () => navigate('/admin/adoptions')
    },
    {
      key: 'boarding',
      title: '寄养管理',
      description: '跟进公益寄养申请状态流转',
      icon: <ShopOutlined />,
      onClick: () => navigate('/admin/boarding')
    },
    {
      key: 'announcements',
      title: '系统公告',
      description: '统一发布和管理系统公告',
      icon: <NotificationOutlined />,
      onClick: () => navigate('/admin/announcements')
    }
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <div>
            <h1 className="dashboard-hero-title">管理控制台</h1>
            <p className="dashboard-hero-subtitle">查看核心数据、待处理事项和常用入口</p>
          </div>
          <div className="dashboard-hero-badge">
            <span className="dashboard-hero-badge-label">当前待处理</span>
            <span className="dashboard-hero-badge-value">{totalPending}</span>
          </div>
        </div>
      </section>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>核心统计</h2>
        </div>
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-users" loading={loading}>
              <Statistic
                title="总用户数"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#FF9F43' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-pets" loading={loading}>
              <Statistic
                title="总宠物数"
                value={stats.totalPets}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#54A0FF' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-posts" loading={loading}>
              <Statistic
                title="总帖子数"
                value={stats.totalPosts}
                prefix={<MessageOutlined />}
                valueStyle={{ color: '#A29BFE' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card stat-pending" loading={loading}>
              <Statistic
                title="总待处理"
                value={totalPending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#26D07C' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>待处理事项</h2>
        </div>
        <Row gutter={[24, 24]}>
          {pendingCards.map((item) => (
            <Col key={item.key} xs={24} md={8}>
              <Card className="queue-card" loading={loading}>
                <div className="queue-card-header">
                  <span className="queue-card-icon">{item.icon}</span>
                  <span className="queue-card-title">{item.title}</span>
                </div>
                <div className="queue-card-value">{item.value}</div>
                <Button onClick={item.onClick}>{item.actionLabel}</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>快捷入口</h2>
        </div>
        <Row gutter={[24, 24]}>
          {quickLinks.map((item) => (
            <Col key={item.key} xs={24} sm={12} xl={6}>
              <Card className="quick-link-card" hoverable onClick={item.onClick}>
                <div className="quick-link-icon">{item.icon}</div>
                <div className="quick-link-title">{item.title}</div>
                <div className="quick-link-description">{item.description}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default DashboardPage;
