import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminMenuItems } from '../Admin/AdminMenuConfig.jsx';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const EXPANDED_SIDER_WIDTH = 220;
const COLLAPSED_SIDER_WIDTH = 80;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

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
        navigate('/login', { replace: true });
      }
    }
  ];

  return (
    <Layout className="admin-layout">
      <Sider
        width={EXPANDED_SIDER_WIDTH}
        breakpoint="lg"
        collapsedWidth={COLLAPSED_SIDER_WIDTH}
        collapsed={collapsed}
        className="admin-sider"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        <div
          className="admin-logo"
          onClick={() => navigate('/admin/dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              navigate('/admin/dashboard');
            }
          }}
        >
          <span className="admin-logo-mark">🐾</span>
          {!collapsed && <span className="admin-logo-text">宠爱有家后台</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={adminMenuItems}
          className="admin-menu"
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout
        className="admin-main-layout"
        style={{ marginLeft: collapsed ? COLLAPSED_SIDER_WIDTH : EXPANDED_SIDER_WIDTH }}
      >
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
            className="admin-trigger"
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="admin-user">
              <Avatar
                size="large"
                src={user?.avatar}
                icon={!user?.avatar && <UserOutlined />}
              />
              <div className="admin-user-meta">
                <span className="admin-user-name">{user?.nickname || '管理员'}</span>
                <span className="admin-user-role">后台管理</span>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
