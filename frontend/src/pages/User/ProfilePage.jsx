import React from 'react';
import { Card, Descriptions, Button, Tag, Space, Divider, Avatar, message, Modal, Form, Input, Select, Upload, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { user, updateUser, handleTokenExpired, logout } = useAuth();
  const navigate = useNavigate();
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    adoptionCount: 0,
    boardingCount: 0,
    lostPetCount: 0,
    forumPostCount: 0
  });

  React.useEffect(() => {
    const fetchUserStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);
        const response = await fetch('/api/auth/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          handleTokenExpired();
          navigate('/login', { replace: true });
          return;
        }

        const data = await response.json();
        if (data.code === 200 && data.data) {
          setStats({
            adoptionCount: Number(data.data.adoptionCount) || 0,
            boardingCount: Number(data.data.boardingCount) || 0,
            lostPetCount: Number(data.data.lostPetCount) || 0,
            forumPostCount: Number(data.data.forumPostCount) || 0
          });
        }
      } catch (error) {
        // 忽略统计接口错误，页面其余内容可正常展示
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [handleTokenExpired, navigate]);

  const handleAvatarUpload = async (file) => {
    const isValid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    if (!isValid) {
      message.error('仅支持 JPG/PNG/WebP 格式的图片');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过 5MB');
      return false;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return false;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('头像上传成功');
        updateUser({ ...user, avatar: data.data.avatar });
      } else {
        message.error(data.message || '头像上传失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setAvatarUploading(false);
    }
    return false;
  };

  const handleEditProfile = () => {
    form.setFieldsValue({
      nickname: user.nickname,
      contact_info: user.contact_info
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();

      if (data.code === 200) {
        message.success('个人信息更新成功');
        updateUser(data.data);
        setEditModalVisible(false);
      } else {
        message.error(data.message || '更新失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();

      if (data.code === 200) {
        message.success('密码修改成功，请重新登录');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
        // 延迟1秒后退出登录
        setTimeout(() => {
          logout(false);
          navigate('/login', { replace: true });
        }, 1000);
      } else {
        message.error(data.message || '密码修改失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTag = (role) => {
    const roleConfig = {
      'admin': { color: '#FF9F43', text: '管理员' },
      'user': { color: '#26D07C', text: '普通用户' }
    };
    const config = roleConfig[role] || { color: '#999', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusTag = (status) => {
    return status === 1
      ? <Tag color="#26D07C">正常</Tag>
      : <Tag color="#FF6B6B">禁用</Tag>;
  };

  return (
    <div className="profile-page">
      <Card className="profile-card" variant="borderless">
        <div className="profile-header">
          <Upload
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={avatarUploading}
          >
            <div className="avatar-upload-wrapper">
              <Avatar
                size={80}
                src={user.avatar}
                icon={!user.avatar && <UserOutlined />}
                className="profile-avatar"
              />
              <div className="avatar-upload-overlay">
                {avatarUploading ? <Spin size="small" /> : <CameraOutlined />}
              </div>
            </div>
          </Upload>
          <div className="profile-title">
            <h2>{user.nickname}</h2>
            <div className="profile-meta">
              {getRoleTag(user.role)}
              {getStatusTag(user.status)}
            </div>
          </div>
          <div className="profile-actions">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditProfile}
            >
              编辑资料
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={() => setPasswordModalVisible(true)}
            >
              修改密码
            </Button>
          </div>
        </div>

        <Divider />

        <Descriptions title="基本信息" column={2} bordered>
          <Descriptions.Item label="用户名">
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label="昵称">
            {user.nickname}
          </Descriptions.Item>
          <Descriptions.Item label="联系方式">
            <Space>
              <PhoneOutlined />
              {user.contact_info || '未设置'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            <Space>
              <MailOutlined />
              {user.email || '未设置'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="用户角色">
            {getRoleTag(user.role)}
          </Descriptions.Item>
          <Descriptions.Item label="账号状态">
            {getStatusTag(user.status)}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {new Date(user.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
            {new Date(user.updated_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div className="profile-section">
          <h3>账号统计</h3>
          <div className="stats-grid">
            <div className="stat-item" onClick={() => navigate('/adoptions')}>
              <div className="stat-value">{statsLoading ? '-' : stats.adoptionCount}</div>
              <div className="stat-label">领养申请</div>
            </div>
            <div className="stat-item" onClick={() => navigate('/boarding')}>
              <div className="stat-value">{statsLoading ? '-' : stats.boardingCount}</div>
              <div className="stat-label">寄养申请</div>
            </div>
            <div className="stat-item" onClick={() => navigate('/my-pets')}>
              <div className="stat-value">档案</div>
              <div className="stat-label">我的宠物</div>
            </div>
            <div className="stat-item" onClick={() => navigate('/my-lost-pets')}>
              <div className="stat-value">{statsLoading ? '-' : stats.lostPetCount}</div>
              <div className="stat-label">寻宠发布</div>
            </div>
            <div className="stat-item" onClick={() => navigate('/my-forum-posts')}>
              <div className="stat-value">{statsLoading ? '-' : stats.forumPostCount}</div>
              <div className="stat-label">社区帖子</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 编辑资料弹窗 */}
      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" maxLength={20} />
          </Form.Item>

          <Form.Item
            label="联系方式"
            name="contact_info"
            rules={[
              { required: true, message: '请输入联系方式' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="当前密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位）" />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
