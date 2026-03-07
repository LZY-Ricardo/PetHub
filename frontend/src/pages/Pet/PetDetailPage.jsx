import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Button, Descriptions, Modal, Form, Input, message } from 'antd';
import { HeartOutlined, EnvironmentOutlined, LeftOutlined, UserOutlined } from '@ant-design/icons';
import './PetDetailPage.css';

function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adoVisible, setAdoVisible] = useState(false);
  const [adoLoading, setAdoLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPetDetail();
  }, [id]);

  const fetchPetDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pets/${id}`);
      const data = await response.json();
      if (data.code === 200) {
        setPet(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pet detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setAdoVisible(true);
  };

  const handleAdoSubmit = async (values) => {
    setAdoLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('/api/adoptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          petId: parseInt(id),
          userId: user.id,
          applicantName: values.applicantName,
          phone: values.phone,
          address: values.address,
          reason: values.reason
        })
      });
      const data = await response.json();
      if (data.code === 200) {
        message.success('领养申请已提交');
        setAdoVisible(false);
        form.resetFields();
      } else {
        message.error(data.message || '提交失败');
      }
    } catch (error) {
      message.error('提交失败');
    } finally {
      setAdoLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">加载中...</div>;
  }

  if (!pet) {
    return <div className="error-state">宠物信息不存在</div>;
  }

  const statusMap = {
    'available': { text: '待领养', color: '#FF9F43' },
    'adopted': { text: '已领养', color: '#26D07C' },
    'pending': { text: '待审核', color: '#54A0FF' }
  };

  const status = statusMap[pet.status] || { text: pet.status, color: '#999' };

  return (
    <div className="pet-detail-page">
      <div className="detail-container">
        <Button
          icon={<LeftOutlined />}
          onClick={() => navigate('/pets')}
          className="back-button"
        >
          返回列表
        </Button>

        <Card className="pet-detail-card" bordered={false}>
          <Row gutter={40}>
            <Col xs={24} md={12}>
              <div className="pet-gallery">
                {pet.photos && pet.photos.length > 0 ? (
                  <img
                    src={pet.photos[0]}
                    alt={pet.name}
                    className="main-image"
                  />
                ) : (
                  <div className="image-placeholder">
                    <HeartOutlined />
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="pet-detail-info">
                <div className="detail-header">
                  <h1 className="pet-name">{pet.name}</h1>
                  <Tag color={status.color} className="status-tag">{status.text}</Tag>
                </div>

                <div className="detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">品种</span>
                    <span className="meta-value">{pet.breed}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">性别</span>
                    <span className="meta-value">{pet.gender === 'male' ? '公' : '母'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">年龄</span>
                    <span className="meta-value">{pet.age}岁</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">健康状况</span>
                    <span className="meta-value">{pet.health_status === 'good' ? '良好' : pet.health_status === 'fair' ? '一般' : '较差'}</span>
                  </div>
                </div>

                <div className="pet-description">
                  <h3>关于我</h3>
                  <p>{pet.remarks || pet.personality || '这只宠物需要一个温暖的家。'}</p>
                </div>

                {pet.status === 'available' && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<HeartOutlined />}
                    onClick={handleAdopt}
                    className="adopt-button"
                  >
                    申请领养
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="shelter-card" bordered={false}>
          <h3>送养人信息</h3>
          <Descriptions column={2}>
            <Descriptions.Item label="联系人">{pet.shelter_name || '暂无'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{pet.shelter_contact || '暂无'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Modal
        title="领养申请"
        open={adoVisible}
        onCancel={() => setAdoVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdoSubmit}
        >
          <Form.Item
            label="申请人姓名"
            name="applicantName"
            rules={[{ required: true, message: '请输入申请人姓名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入您的姓名" />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="phone"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入您的联系电话" />
          </Form.Item>

          <Form.Item
            label="居住地址"
            name="address"
            rules={[{ required: true, message: '请输入居住地址' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入您的居住地址" />
          </Form.Item>

          <Form.Item
            label="领养理由"
            name="reason"
            rules={[{ required: true, message: '请输入领养理由' }]}
          >
            <Input.TextArea rows={4} placeholder="请简述您的领养理由和饲养条件" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={adoLoading} block size="large">
              提交申请
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PetDetailPage;
