import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Empty, List, Space, Tag, Typography, message } from 'antd';
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationPage.css';

const { Text } = Typography;

function NotificationPage() {
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const notifyUnreadCountChanged = () => {
    window.dispatchEvent(new CustomEvent('notification-unread-changed'));
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?page=1&pageSize=100&unreadOnly=${unreadOnly}`, {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setNotifications(data.data?.list || []);
      } else {
        message.error(data.message || '获取通知失败');
      }
    } catch (err) {
      message.error('获取通知失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setNotifications((prev) => prev.map((item) => (
          item.id === id ? { ...item, is_read: 1, read_at: new Date().toISOString() } : item
        )));
        notifyUnreadCountChanged();
      }
    } catch (err) {
      message.error('标记已读失败');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('已全部标记为已读');
        setNotifications((prev) => prev.map((item) => ({
          ...item,
          is_read: 1,
          read_at: item.read_at || new Date().toISOString()
        })));
        notifyUnreadCountChanged();
      }
    } catch (err) {
      message.error('操作失败');
    }
  };

  const getTypeText = (type) => {
    if (type === 'adoption') return '领养';
    if (type === 'boarding') return '寄养';
    if (type === 'forum') return '社区';
    return '系统';
  };

  const getTypeColor = (type) => {
    if (type === 'adoption') return 'green';
    if (type === 'boarding') return 'orange';
    if (type === 'forum') return 'blue';
    return 'default';
  };

  const handleOpenDetail = async (item) => {
    if (!item.is_read) {
      await markAsRead(item.id);
    }

    if (item.action_url) {
      navigate(item.action_url);
    }
  };

  return (
    <div className="notification-page">
      <Card className="notification-card" variant="borderless">
        <div className="notification-header">
          <div>
            <h1 className="notification-title">
              <BellOutlined /> 消息通知
            </h1>
            <p className="notification-subtitle">查看系统消息、寄养进度和业务提醒</p>
          </div>
          <Space>
            <Button
              type={unreadOnly ? 'default' : 'primary'}
              onClick={() => setUnreadOnly(false)}
            >
              全部
            </Button>
            <Button
              type={unreadOnly ? 'primary' : 'default'}
              onClick={() => setUnreadOnly(true)}
            >
              仅未读
            </Button>
            <Button icon={<CheckCircleOutlined />} onClick={markAllAsRead}>
              全部已读
            </Button>
          </Space>
        </div>

        {notifications.length === 0 && !loading ? (
          <Empty description="暂无通知" style={{ margin: '48px 0' }} />
        ) : (
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`notification-item ${item.is_read ? 'read' : 'unread'}`}
                actions={[
                  !item.is_read ? (
                    <Button type="link" onClick={() => markAsRead(item.id)}>
                      标记已读
                    </Button>
                  ) : null,
                  item.action_url ? (
                    <Button type="link" onClick={() => handleOpenDetail(item)}>
                      查看详情
                    </Button>
                  ) : null
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={(
                    <Space>
                      <Tag color={getTypeColor(item.type)}>{getTypeText(item.type)}</Tag>
                      <span>{item.title}</span>
                      {!item.is_read && <Badge status="processing" text="未读" />}
                    </Space>
                  )}
                  description={(
                    <div>
                      <div className="notification-content">{item.content}</div>
                      <Text type="secondary">
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </Text>
                    </div>
                  )}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default NotificationPage;
