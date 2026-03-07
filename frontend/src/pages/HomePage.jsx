import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Statistic } from 'antd';
import {
  HeartOutlined,
  SearchOutlined,
  MessageOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pets: 0,
    adoptions: 0,
    users: 0,
    posts: 0
  });

  useEffect(() => {
    // Simulate fetching stats
    setTimeout(() => {
      setStats({
        pets: 150,
        adoptions: 89,
        users: 1200,
        posts: 456
      });
    }, 500);
  }, []);

  const features = [
    {
      icon: <HeartOutlined />,
      title: '领养宠物',
      description: '为每一只宠物找到温暖的家',
      action: () => navigate('/pets'),
      color: '#FF9F43'
    },
    {
      icon: <SearchOutlined />,
      title: '宠物寻回',
      description: '帮助走失的宠物回到主人身边',
      action: () => navigate('/lost-pets'),
      color: '#54A0FF'
    },
    {
      icon: <MessageOutlined />,
      title: '宠友社区',
      description: '分享养宠经验，交流心得',
      action: () => navigate('/forum'),
      color: '#26D07C'
    }
  ];

  const petCards = [
    {
      image: 'https://images.unsplash.com/photo-1552053831-7f94e00e0?w=400',
      name: '旺财',
      breed: '金毛',
      age: '2岁',
      description: '温顺友善，喜欢和人互动'
    },
    {
      image: 'https://images.unsplash.com/photo-1587300003328-d9f4f3693242?w=400',
      name: '小白',
      breed: '萨摩耶',
      age: '1.5岁',
      description: '微笑天使，需要大量运动'
    },
    {
      image: 'https://images.unsplash.com/photo-1579213830180-43f2b00e3df4?w=400',
      name: '欢欢',
      breed: '拉布拉多',
      age: '2.8岁',
      description: '友善亲人，智商高'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text animate-fade-in-up">
            <h1 className="hero-title">
              给每一个毛孩子
              <br />
              <span className="text-gradient">一个温暖的家</span>
            </h1>
            <p className="hero-description">
              宠爱有家致力于连接爱心的家庭与需要帮助的宠物，
              <br />
              让每一次相遇都成为美好的开始
            </p>
            <div className="hero-actions">
              <Button
                type="primary"
                size="large"
                icon={<HeartOutlined />}
                onClick={() => navigate('/pets')}
                className="hero-btn primary animate-fade-in-up stagger-1"
              >
                领养宠物
              </Button>
              <Button
                size="large"
                icon={<SearchOutlined />}
                onClick={() => navigate('/lost-pets')}
                className="hero-btn secondary animate-fade-in-up stagger-2"
              >
                寻找宠物
              </Button>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <Row gutter={[32, 32]}>
            <Col xs={12} sm={6}>
              <Card className="stat-card animate-scale-in stagger-1">
                <Statistic
                  title={<><HeartOutlined className="stat-icon" /></>}
                  value={stats.pets}
                  suffix="只"
                  valueStyle={{ color: '#FF9F43', fontWeight: 700 }}
                />
                <p className="stat-label">待领养宠物</p>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card animate-scale-in stagger-2">
                <Statistic
                  title={<><TrophyOutlined className="stat-icon" /></>}
                  value={stats.adoptions}
                  suffix="例"
                  valueStyle={{ color: '#26D07C', fontWeight: 700 }}
                />
                <p className="stat-label">成功领养</p>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card animate-scale-in stagger-3">
                <Statistic
                  title={<><TeamOutlined className="stat-icon" /></>}
                  value={stats.users}
                  suffix="人"
                  valueStyle={{ color: '#54A0FF', fontWeight: 700 }}
                />
                <p className="stat-label">爱心用户</p>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card animate-scale-in stagger-4">
                <Statistic
                  title={<><MessageOutlined className="stat-icon" /></>}
                  value={stats.posts}
                  suffix="篇"
                  valueStyle={{ color: '#FF6B9D', fontWeight: 700 }}
                />
                <p className="stat-label">社区帖子</p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title animate-fade-in-up">
            我们的服务
          </h2>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  className="feature-card card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  hoverable
                  onClick={feature.action}
                >
                  <div
                    className="feature-icon"
                    style={{ background: `${feature.color}15`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <Button
                    type="text"
                    icon={<ArrowRightOutlined />}
                    className="feature-action"
                    style={{ color: feature.color }}
                  >
                    了解更多
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="featured-pets-section">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <h2 className="section-title">萌宠推荐</h2>
            <Button
              type="primary"
              icon={<HeartOutlined />}
              onClick={() => navigate('/pets')}
            >
              查看全部
            </Button>
          </div>
          <Row gutter={[24, 24]}>
            {petCards.map((pet, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  className="pet-card card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  hoverable
                  cover={
                    <div className="pet-card-image">
                      <img src={pet.image} alt={pet.name} />
                    </div>
                  }
                  onClick={() => navigate(`/pets/${index + 1}`)}
                >
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">{pet.breed} · {pet.age}</p>
                  <p className="pet-description">{pet.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content animate-fade-in-up">
          <h2 className="cta-title">
            准备好迎接新的家庭成员了吗？
          </h2>
          <p className="cta-description">
            每一只宠物都在等待一个温暖的家，也许你就是那个对的人
          </p>
          <Button
            type="primary"
            size="large"
            icon={<HeartOutlined />}
            onClick={() => navigate('/pets')}
            className="cta-btn"
          >
            立即领养
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
