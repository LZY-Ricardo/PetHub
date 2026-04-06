import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.username, values.password);

    if (result.success) {
      navigate(result.redirectPath || '/', { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-background">
        <div className="auth-orb auth-orb--one" />
        <div className="auth-orb auth-orb--two" />
        <div className="auth-orb auth-orb--three" />
        <div className="paw-print paw-1">🐾</div>
        <div className="paw-print paw-2">🐾</div>
        <div className="paw-print paw-3">🐾</div>
      </div>

      <div className="auth-container animate-fade-in-up">
        <Card className="auth-card">
          <div className="auth-shell">
            <section className="auth-brand-panel">
              <div className="auth-brand-main">
                <div className="auth-brand-badge">
                  <HeartOutlined />
                  温暖陪伴
                </div>
                <div className="auth-logo">🐾</div>
                <h1 className="auth-title">欢迎回到宠爱有家</h1>
                <p className="auth-subtitle">
                  在这里继续记录每一次相遇、守护与陪伴，把温柔留给每一只值得被爱的小生命。
                </p>
                <div className="auth-brand-points">
                  <span className="auth-brand-point">领养</span>
                  <span className="auth-brand-point">陪伴</span>
                  <span className="auth-brand-point">守护</span>
                </div>
              </div>

              <div className="auth-brand-note">
                <span className="auth-brand-note-label">今日温度</span>
                <h2 className="auth-brand-note-title">把熟悉的日常接回来</h2>
                <p className="auth-brand-note-text">
                  登录后继续查看关注的宠物、发布记录和社区互动。
                </p>
              </div>

              <div className="auth-paw-cluster">
                <span>🐾</span>
                <span>🐾</span>
              </div>
            </section>

            <section className="auth-form-panel">
              <div className="auth-panel-header">
                <span className="auth-panel-eyebrow">Welcome Back</span>
                <h2 className="auth-panel-title">登录账号</h2>
                <p className="auth-panel-text">输入用户名和密码，继续你的宠物关爱旅程。</p>
              </div>

              <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="auth-form"
              >
                <Form.Item
                  name="username"
                  label="用户名"
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
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    size="large"
                    className="auth-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    className="auth-submit-btn"
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>

              <div className="auth-footer">
                <p>还没有账号？</p>
                <Link to="/register" className="auth-link">
                  立即注册
                  <ArrowRightOutlined />
                </Link>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
