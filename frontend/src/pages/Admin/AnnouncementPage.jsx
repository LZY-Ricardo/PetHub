import React, { useState } from 'react';
import { Button, Card, Form, Input } from 'antd';
import { message } from '../../utils/antdApp';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, isApiError } from '../../utils/apiClient';
import './AdminManagementPage.css';

function AnnouncementPage() {
  const [publishing, setPublishing] = useState(false);
  const [announceForm] = Form.useForm();
  const { handleTokenExpired } = useAuth();

  const handlePublishAnnouncement = async (values) => {
    setPublishing(true);
    try {
      const data = await apiClient.post('/api/admin/notifications/broadcast', values, { auth: 'required' });
      message.success(`公告发布成功，已发送给 ${data?.deliveredCount || 0} 位用户`);
      announceForm.resetFields();
    } catch (error) {
      if (isApiError(error) && error.status === 403) {
        message.error('无权限发布公告');
      } else {
        message.error(error.message || '公告发布失败，请稍后重试');
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">系统公告</h1>
          <p className="admin-management-subtitle">统一发布平台通知</p>
        </div>
      </div>

      <Card className="admin-table-card">
        <Form
          form={announceForm}
          layout="vertical"
          onFinish={handlePublishAnnouncement}
        >
          <Form.Item
            label="公告标题"
            name="title"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input maxLength={120} placeholder="例如：系统维护通知" />
          </Form.Item>

          <Form.Item
            label="公告内容"
            name="content"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <Input.TextArea rows={6} maxLength={500} showCount placeholder="请输入公告详情" />
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
