import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button } from 'antd';
import { message } from '../../utils/antdApp';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';
import './AuthPage.css';

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await register({
        username: values.username,
        password: values.password,
        nickname: values.nickname,
        email: values.email,
        phone: values.phone
      });
      if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-background">
        <div className="auth-orb auth-orb--one" />
        <div className="auth-orb auth-orb--two" />
        <div className="auth-orb auth-orb--three" />
        <div className="paw-print paw-1">🐾</div>
        <div className="paw-print paw-2">🐾</div>
        <div className="paw-print paw-3">🐾</div>
      </div>

      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-shell">
            <section className="auth-brand-panel">
              <div className="auth-brand-main">
                <div className="auth-brand-badge">
                  <StarOutlined />
                  治愈相遇
                </div>
                <div className="auth-logo">🐾</div>
                <h1 className="auth-title">加入宠爱有家</h1>
                <p className="auth-subtitle">
                  创建你的温暖账号，把喜欢、关注和陪伴都安放在一个更轻柔的角落里。
                </p>
                <div className="auth-brand-points">
                  <span className="auth-brand-point">记录成长</span>
                  <span className="auth-brand-point">发现领养</span>
                  <span className="auth-brand-point">分享日常</span>
                </div>
              </div>

              <div className="auth-brand-note">
                <span className="auth-brand-note-label">new story</span>
                <h2 className="auth-brand-note-title">从一个昵称开始认识彼此</h2>
                <p className="auth-brand-note-text">
                  完成注册后，你可以保存关注、参与互动，并建立自己的宠物陪伴档案。
                </p>
              </div>

              <div className="auth-paw-cluster">
                <span>🐾</span>
                <span>🐾</span>
              </div>
            </section>

            <section className="auth-form-panel">
              <div className="auth-panel-header">
                <span className="auth-panel-eyebrow">Join Us</span>
                <h2 className="auth-panel-title">创建账号</h2>
                <p className="auth-panel-text">填写基础信息，开启你的宠物关爱旅程。</p>
              </div>

              <Form
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                requiredMark={false}
                className="auth-form"
              >
                <div className="auth-form-grid">
                  <Form.Item
                    label="用户名"
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入用户名"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    label="昵称"
                    name="nickname"
                    rules={[{ required: true, message: '请输入昵称' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入昵称"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6位' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请输入密码"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    label="确认密码"
                    name="confirm"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请再次输入密码"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="请输入邮箱"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    label="手机号"
                    name="phone"
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="请输入手机号（选填）"
                      size="large"
                      className="auth-input"
                    />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                    className="auth-submit-btn"
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>

              <div className="auth-footer">
                <p>已有账号？</p>
                <Link to="/login" className="auth-link">
                  立即登录
                  <ArrowRightOutlined />
                </Link>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
