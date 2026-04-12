import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  SearchOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const isAdminUser = isAdmin();
  const canAccessAdminProfile = isAdminUser && location.pathname === '/profile';

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await apiClient.get('/api/notifications/unread-count', { auth: 'required' });
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      setUnreadCount(0);
    }
  }, [user]);

  React.useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, location.pathname]);

  React.useEffect(() => {
    const handleUnreadChanged = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notification-unread-changed', handleUnreadChanged);

    return () => {
      window.removeEventListener('notification-unread-changed', handleUnreadChanged);
    };
  }, [fetchUnreadCount]);

  const menuItems = isAdminUser
    ? [
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined />,
          label: '管理后台'
        }
      ]
    : [
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
          key: '/lost-pets',
          icon: <SearchOutlined />,
          label: '宠物寻回'
        },
        {
          key: '/forum',
          icon: <MessageOutlined />,
          label: '宠友社区'
        },
        {
          key: '/notifications',
          icon: (
            <Badge count={unreadCount} size="small" overflowCount={99}>
              <BellOutlined />
            </Badge>
          ),
          label: '消息通知'
        },
        {
          key: '/boarding',
          icon: <HeartOutlined />,
          label: '公益寄养'
        }
      ];

  const userMenuItems = isAdminUser
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: '个人中心',
          onClick: () => navigate('/profile')
        },
        {
          key: 'adminDashboard',
          icon: <DashboardOutlined />,
          label: '后台管理',
          onClick: () => navigate('/admin/dashboard')
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: () => {
            logout();
            navigate('/');
          }
        }
      ]
    : [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: '个人中心',
          onClick: () => navigate('/profile')
        },
        {
          key: 'notifications',
          icon: <BellOutlined />,
          label: unreadCount > 0 ? `消息通知（${unreadCount}）` : '消息通知',
          onClick: () => navigate('/notifications')
        },
        {
          key: 'myPets',
          icon: <HeartOutlined />,
          label: '我的宠物档案',
          onClick: () => navigate('/my-pets')
        },
        {
          key: 'publishSubmission',
          icon: <HeartOutlined />,
          label: '发布送养',
          onClick: () => navigate('/pet-submissions/new')
        },
        {
          key: 'myPetSubmissions',
          icon: <HeartOutlined />,
          label: '我的送养发布',
          onClick: () => navigate('/my-pet-submissions')
        },
        {
          key: 'myBoarding',
          icon: <HeartOutlined />,
          label: '我的寄养申请',
          onClick: () => navigate('/boarding')
        },
        {
          key: 'myAdoptions',
          icon: <HeartOutlined />,
          label: '我的领养申请',
          onClick: () => navigate('/adoptions')
        },
        {
          key: 'myLostPets',
          icon: <SearchOutlined />,
          label: '我的寻宠发布',
          onClick: () => navigate('/my-lost-pets')
        },
        {
          key: 'myForumPosts',
          icon: <MessageOutlined />,
          label: '我的社区帖子',
          onClick: () => navigate('/my-forum-posts')
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

  if (isAdminUser && !canAccessAdminProfile) {
    return <Navigate to="/admin/dashboard" replace />;
  }

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
