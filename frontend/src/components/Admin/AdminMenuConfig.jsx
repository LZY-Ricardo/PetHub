import React from 'react';
import {
  DashboardOutlined,
  HeartOutlined,
  AuditOutlined,
  SolutionOutlined,
  SearchOutlined,
  ShopOutlined,
  MessageOutlined,
  BellOutlined,
  TeamOutlined
} from '@ant-design/icons';

export const adminMenuItems = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘'
  },
  {
    key: '/admin/pet-submissions',
    icon: <AuditOutlined />,
    label: '送养发布审核'
  },
  {
    key: '/admin/adoptions',
    icon: <SolutionOutlined />,
    label: '领养申请管理'
  },
  {
    key: '/admin/pets',
    icon: <HeartOutlined />,
    label: '领养宠物管理'
  },
  {
    key: '/admin/lost-pets',
    icon: <SearchOutlined />,
    label: '宠物寻回管理'
  },
  {
    key: '/admin/forum',
    icon: <MessageOutlined />,
    label: '宠友社区管理'
  },
  {
    key: '/admin/boarding',
    icon: <ShopOutlined />,
    label: '宠物寄养管理'
  },
  {
    key: '/admin/announcements',
    icon: <BellOutlined />,
    label: '系统公告'
  },
  {
    key: '/admin/notifications',
    icon: <BellOutlined />,
    label: '公告管理'
  },
  {
    key: '/admin/users',
    icon: <TeamOutlined />,
    label: '普通用户管理'
  },
  {
    key: '/admin/admin-accounts',
    icon: <TeamOutlined />,
    label: '管理员账户'
  }
];
