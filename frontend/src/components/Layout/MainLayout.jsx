import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  SearchOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/pets',
      icon: <HeartOutlined />,
      label: '领养宠物'
    },
    {
      key: '/adoptions',
      icon: <SearchOutlined />,
      label: '我的申请'
    },
    {
      key: '/lost-pets',
      icon: <SearchOutlined />,
      label: '宠物寻回'
    },
    {
      key: '/forum',
      icon: <MessageOutlined />,
      label: '宠友社区'
    }
  ];

  if (isAdmin()) {
    menuItems.push({
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '管理后台'
    });
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        // 退出登录后跳转到首页
        navigate('/');
      }
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="logo-icon">🐾</div>
            <h1 className="logo-text">宠爱有家</h1>
          </div>

          <div className="menu-section">
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="main-menu"
            />
          </div>

          <div className="user-section">
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Avatar
                    size="large"
                    src={user.avatar}
                    icon={!user.avatar && <UserOutlined />}
                    className="user-avatar"
                  />
                  <span className="user-name">{user.nickname}</span>
                </div>
              </Dropdown>
            ) : (
              <div className="auth-buttons">
                <Button
                  type="text"
                  onClick={() => navigate('/login')}
                  className="auth-btn"
                >
                  登录
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/register')}
                  className="auth-btn primary"
                >
                  注册
                </Button>
              </div>
            )}
          </div>

          <Button
            className="mobile-menu-btn"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </Header>

      <Content className="main-content">
        <Outlet />
      </Content>

      <Footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>关于我们</h3>
            <p>宠爱有家致力于为每一只宠物找到温暖的家</p>
          </div>
          <div className="footer-section">
            <h3>联系方式</h3>
            <p>邮箱: contact@petplatform.com</p>
            <p>电话: 400-888-8888</p>
          </div>
          <div className="footer-section">
            <h3>关注我们</h3>
            <p>微信公众号: 宠爱有家</p>
            <p>微博: @宠爱有家平台</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 宠爱有家 - 宠物管理与服务平台 | 毕业设计作品</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
