import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Switch, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminManagementPage.css';

function AnnouncementPage() {
  const [publishing, setPublishing] = useState(false);
  const [announceForm] = Form.useForm();
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();

  const handlePublishAnnouncement = async (values) => {
    setPublishing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.warning('请先登录');
        return;
      }

      const response = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      if (response.status === 403) {
        message.error('无权限发布公告');
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success(`公告发布成功，已发送给 ${data.data?.deliveredCount || 0} 位用户`);
        announceForm.resetFields();
      } else {
        message.error(data.message || '公告发布失败');
      }
    } catch (error) {
      message.error('公告发布失败，请稍后重试');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">系统公告</h1>
          <p className="admin-management-subtitle">统一发布平台通知，控制发送范围与是否包含自己。</p>
        </div>
      </div>

      <Card className="admin-table-card">
        <Form
          form={announceForm}
          layout="vertical"
          onFinish={handlePublishAnnouncement}
          initialValues={{ targetRole: 'all', excludeSender: false }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="公告标题"
                name="title"
                rules={[{ required: true, message: '请输入公告标题' }]}
              >
                <Input maxLength={120} placeholder="例如：系统维护通知" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="发送范围"
                name="targetRole"
                rules={[{ required: true, message: '请选择发送范围' }]}
              >
                <Select
                  options={[
                    { label: '全部用户', value: 'all' },
                    { label: '普通用户', value: 'user' },
                    { label: '管理员', value: 'admin' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="公告内容"
            name="content"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <Input.TextArea rows={6} maxLength={500} showCount placeholder="请输入公告详情" />
          </Form.Item>

          <Form.Item name="excludeSender" valuePropName="checked">
            <Switch checkedChildren="不发送给自己" unCheckedChildren="包含自己" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={publishing}>
            发布公告
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default AnnouncementPage;
