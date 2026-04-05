import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Upload } from 'antd';
import { message } from '../../utils/antdApp';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';

const { TextArea } = Input;

function PetSubmissionPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();

  const uploadImage = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pet');

      const data = await apiClient.post('/api/upload/image', formData, { auth: 'required' });
      onSuccess({ url: data.url });
    } catch (error) {
      onError(error);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await apiClient.post('/api/pets/submissions', {
          ...values,
          photos: fileList
            .filter((item) => item.status === 'done')
            .map((item) => item.response?.url || item.url)
        }, { auth: 'required' });
      message.success('发布成功');
      navigate('/my-pet-submissions', { replace: true });
    } catch (error) {
      message.error(error.message || '发布失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card variant="borderless">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ marginBottom: 8 }}>发布送养</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>填写宠物信息后提交审核</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ healthStatus: 'good', sterilized: false }}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Form.Item label="宠物名称" name="name" rules={[{ required: true, message: '请输入宠物名称' }]}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label="品种" name="breed" rules={[{ required: true, message: '请输入品种' }]}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别' }]}>
              <Select options={[{ label: '公', value: 'male' }, { label: '母', value: 'female' }]} />
            </Form.Item>
            <Form.Item label="年龄" name="age" rules={[{ required: true, message: '请输入年龄' }]}>
              <InputNumber min={0} max={30} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="健康状况" name="healthStatus" rules={[{ required: true, message: '请选择健康状况' }]}>
              <Select options={[{ label: '良好', value: 'good' }, { label: '一般', value: 'fair' }, { label: '需治疗', value: 'poor' }]} />
            </Form.Item>
            <Form.Item label="已绝育" name="sterilized" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </div>

          <Form.Item label="性格特点" name="personality">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="疫苗情况" name="vaccination">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="送养说明" name="remarks" rules={[{ required: true, message: '请输入送养说明' }]}>
            <TextArea rows={5} maxLength={500} showCount />
          </Form.Item>

          <Form.Item label="宠物照片">
            <Upload.Dragger
              multiple
              accept="image/*"
              customRequest={uploadImage}
              fileList={fileList}
              onChange={({ fileList: nextFileList }) => setFileList(nextFileList.slice(-5))}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p>上传 1-5 张宠物照片</p>
            </Upload.Dragger>
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<PlusOutlined />}>
              提交审核
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default PetSubmissionPage;
