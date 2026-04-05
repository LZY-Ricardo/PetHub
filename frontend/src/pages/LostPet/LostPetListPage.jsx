import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Modal, Form, Input, Select, Space } from 'antd';
import { message } from '../../utils/antdApp';
import { SearchOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import './LostPetListPage.css';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

function LostPetListPage() {
  const [lostPets, setLostPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { user, handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLostPets();
  }, []);

  const fetchLostPets = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/lost-pets');
      setLostPets(data?.list || []);
    } catch (error) {
      console.error('Failed to fetch lost pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    setReportVisible(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // 将单个照片URL转换为数组格式
      const photos = values.photos ? [values.photos] : [];

      // 只发送后端期望的字段
      const submitData = {
        name: values.name,
        location: values.location,
        lostTime: values.lostTime,
        description: values.description,
        photos: photos,
        contact: values.contact,
        isUrgent: false
      };

      // 过滤掉空值
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === null || submitData[key] === '') {
          delete submitData[key];
        }
      });

      await apiClient.post('/api/lost-pets', submitData, { auth: 'required' });
      message.success('发布成功');
      setReportVisible(false);
      form.resetFields();
      fetchLostPets();
    } catch (error) {
      message.error(error.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'lost' ? '#FF6B6B' : '#26D07C';
  };

  const getStatusText = (status) => {
    return status === 'lost' ? '走失中' : '已找回';
  };

  return (
    <div className="lost-pet-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">🐾 宠物寻回</h1>
          <p className="page-subtitle">帮助走失的宠物找到回家的路</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleReport}
          className="report-button"
        >
          发布寻宠启事
        </Button>
      </div>

      <div className="lost-pet-content">
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : lostPets.length === 0 ? (
          <div className="empty-state">暂无寻宠信息</div>
        ) : (
          <Row gutter={[24, 24]}>
            {lostPets.map((pet, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={pet.id}>
                <Card
                  className="lost-pet-card"
                  hoverable
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  <div className="pet-image-container">
                    {pet.photos && pet.photos.length > 0 ? (
                      <img src={pet.photos[0]} alt={pet.name} className="pet-image" />
                    ) : (
                      <div className="image-placeholder">
                        <SearchOutlined />
                      </div>
                    )}
                    <Tag
                      color={getStatusColor(pet.is_found ? 'found' : 'lost')}
                      className="status-tag"
                    >
                      {getStatusText(pet.is_found ? 'found' : 'lost')}
                    </Tag>
                  </div>

                  <div className="pet-info">
                    <h3 className="pet-name">{pet.name}</h3>
                    <div className="pet-detail">
                      <span className="label">特征:</span>
                      <span className="value">{pet.description}</span>
                    </div>
                    <div className="pet-detail location">
                      <EnvironmentOutlined />
                      <span>{pet.location}</span>
                    </div>
                    <div className="pet-detail time">
                      <span>走失于 {new Date(pet.lost_time).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="pet-detail contact">
                      <span>联系电话: {pet.contact}</span>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title="发布寻宠启事"
        open={reportVisible}
        onCancel={() => setReportVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="宠物名称"
            name="name"
            rules={[{ required: true, message: '请输入宠物名称' }]}
          >
            <Input placeholder="请输入宠物名称" />
          </Form.Item>

          <Form.Item
            label="特征描述"
            name="description"
            rules={[{ required: true, message: '请输入特征描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请描述宠物的特征，如颜色、体型、品种等" />
          </Form.Item>

          <Form.Item
            label="走失地点"
            name="location"
            rules={[{ required: true, message: '请输入走失地点' }]}
          >
            <Input placeholder="请输入走失地点" />
          </Form.Item>

          <Form.Item
            label="走失时间"
            name="lostTime"
            rules={[{ required: true, message: '请选择走失时间' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="contact"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入您的联系电话" />
          </Form.Item>

          <Form.Item
            label="照片链接（选填）"
            name="photos"
          >
            <Input placeholder="请输入宠物照片的URL" />
          </Form.Item>

          <Form.Item
            label="备注信息"
            name="note"
          >
            <TextArea rows={3} placeholder="其他需要补充的信息" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block size="large">
              发布
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default LostPetListPage;
