import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Input, Select, Space, Empty } from 'antd';
import { HeartOutlined, EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './PetListPage.css';

const { Search } = Input;
const { Option } = Select;

function PetListPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    species: '',
    status: 'available'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.species) params.append('species', filters.species);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/pets?${params}`);
      const data = await response.json();
      if (data.code === 200) {
        setPets(data.data?.list || []);
      }
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      '待领养': '#FF9F43',
      '已领养': '#26D07C',
      '待审核': '#54A0FF'
    };
    return colors[status] || '#999';
  };

  const getStatusTag = (status) => {
    const tag = status === 'available' ? '待领养' :
                status === 'adopted' ? '已领养' : '待审核';
    return <Tag color={getStatusColor(tag)}>{tag}</Tag>;
  };

  return (
    <div className="pet-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <HeartOutlined /> 寻找您的完美伴侣
          </h1>
          <p className="page-subtitle">每一只宠物都值得一个温暖的家</p>
        </div>
      </div>

      <div className="pet-filters">
        <Space size="large" wrap>
          <Search
            placeholder="搜索宠物名称或品种"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => setFilters({ ...filters, keyword: value })}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择类型"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilters({ ...filters, species: value })}
          >
            <Option value="猫">猫</Option>
            <Option value="狗">狗</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select
            placeholder="领养状态"
            value={filters.status}
            style={{ width: 150 }}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="available">待领养</Option>
            <Option value="adopted">已领养</Option>
            <Option value="pending">待审核</Option>
          </Select>
        </Space>
      </div>

      <div className="pet-list-content">
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : pets.length === 0 ? (
          <Empty description="暂无宠物信息" />
        ) : (
          <Row gutter={[24, 24]}>
            {pets.map((pet, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={pet.id}>
                <Card
                  className="pet-card"
                  hoverable
                  onClick={() => navigate(`/pets/${pet.id}`)}
                  cover={
                    <div className="pet-image-container">
                      {pet.photos && pet.photos.length > 0 ? (
                        <img
                          src={pet.photos[0]}
                          alt={pet.name}
                          className="pet-image"
                        />
                      ) : (
                        <div className="pet-image-placeholder">
                          <HeartOutlined />
                        </div>
                      )}
                      <div className="pet-overlay">
                        <Button type="primary" shape="round">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  }
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  <div className="pet-info">
                    <div className="pet-header">
                      <h3 className="pet-name">{pet.name}</h3>
                      {getStatusTag(pet.status)}
                    </div>
                    <div className="pet-details">
                      <div className="pet-detail-item">
                        <span className="detail-label">品种:</span>
                        <span className="detail-value">{pet.breed}</span>
                      </div>
                      <div className="pet-detail-item">
                        <span className="detail-label">性别:</span>
                        <span className="detail-value">{pet.gender === 'male' ? '公' : '母'}</span>
                      </div>
                      <div className="pet-detail-item">
                        <span className="detail-label">年龄:</span>
                        <span className="detail-value">{pet.age}</span>
                      </div>
                      <div className="pet-detail-item">
                        <span className="detail-label">健康:</span>
                        <span className="detail-value">{pet.health_status === 'good' ? '良好' : pet.health_status === 'fair' ? '一般' : '较差'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default PetListPage;
