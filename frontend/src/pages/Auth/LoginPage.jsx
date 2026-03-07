import React, { useState } from 'react';
import { Form, Input, Button, Card, Divider, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined
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
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <Card className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🐾</div>
            <h1 className="auth-title">欢迎回来</h1>
            <p className="auth-subtitle">登录宠爱有家，继续您的爱心之旅</p>
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
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                size="large"
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
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

          <Divider plain>或</Divider>

          <div className="auth-footer">
            <p>还没有账号？</p>
            <Link to="/register" className="auth-link">
              立即注册
              <MailOutlined />
            </Link>
          </div>
        </Card>

        <div className="auth-decoration">
          <div className="paw-print paw-1">🐾</div>
          <div className="paw-print paw-2">🐾</div>
          <div className="paw-print paw-3">🐾</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
