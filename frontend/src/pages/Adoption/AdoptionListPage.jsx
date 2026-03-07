import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, message, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './AdoptionListPage.css';

function AdoptionListPage() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAdo, setCurrentAdo] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/adoptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setAdoptions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch adoptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setCurrentAdo(record);
    setDetailVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FF9F43',
      'approved': '#26D07C',
      'rejected': '#FF6B6B'
    };
    return colors[status] || '#999';
  };

  const getStatusText = (status) => {
    const text = {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝'
    };
    return text[status] || status;
  };

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '宠物名称',
      dataIndex: 'pet_name',
      key: 'pet_name',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: '申请人',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="adoption-list-page">
      <Card className="adoption-card" bordered={false}>
        <div className="page-header-content">
          <h1 className="page-title">我的领养申请</h1>
          <p className="page-subtitle">查看和管理您的领养申请记录</p>
        </div>

        <Table
          columns={columns}
          dataSource={adoptions}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          className="adoption-table"
        />
      </Card>

      <Modal
        title="申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentAdo && (
          <div className="adoption-detail">
            <div className="detail-section">
              <h3>宠物信息</h3>
              <p><strong>宠物名称:</strong> {currentAdo.pet_name}</p>
              <p><strong>品种:</strong> {currentAdo.pet_breed}</p>
            </div>

            <div className="detail-section">
              <h3>申请人信息</h3>
              <p><strong>姓名:</strong> {currentAdo.applicant_name}</p>
              <p><strong>联系电话:</strong> {currentAdo.phone}</p>
              <p><strong>地址:</strong> {currentAdo.address}</p>
            </div>

            <div className="detail-section">
              <h3>申请理由</h3>
              <p className="reason-text">{currentAdo.reason}</p>
            </div>

            <div className="detail-section">
              <h3>审核信息</h3>
              <p><strong>状态:</strong> <Tag color={getStatusColor(currentAdo.status)}>{getStatusText(currentAdo.status)}</Tag></p>
              {currentAdo.review_note && (
                <p><strong>审核备注:</strong> {currentAdo.review_note}</p>
              )}
              <p><strong>申请时间:</strong> {new Date(currentAdo.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdoptionListPage;
