import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Input, Space, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import './AdoptionListPage.css';

function AdoptionListPage() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentAdo, setCurrentAdo] = useState(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdminView = user?.role === 'admin';
  const focusId = searchParams.get('focusId');

  useEffect(() => {
    fetchAdoptions();
  }, [isAdminView]);

  useEffect(() => {
    if (!focusId || adoptions.length === 0) {
      return;
    }

    const target = adoptions.find((item) => String(item.id) === String(focusId));
    if (target) {
      setCurrentAdo(target);
      setDetailVisible(true);
    }
  }, [focusId, adoptions]);

  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // 如果没有token，清空数据并提示登录
      if (!token) {
        message.warning('请先登录');
        setAdoptions([]);
        setLoading(false);
        return;
      }

      const endpoint = isAdminView
        ? '/api/adoptions?page=1&pageSize=100'
        : '/api/adoptions/my';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // 处理401未授权（token过期或无效）
      if (response.status === 401) {
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAdoptions([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // 处理API错误
      if (data.code !== 200) {
        message.error(data.message || '获取申请列表失败');
        setAdoptions([]);
        return;
      }

      const list = isAdminView ? (data.data?.list || []) : (data.data || []);
      setAdoptions(list);
    } catch (error) {
      console.error('Failed to fetch adoptions:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setCurrentAdo(record);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);

    if (focusId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('focusId');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const openReviewModal = (record, status) => {
    setReviewTarget(record);
    setReviewStatus(status);
    setReviewComment('');
    setReviewVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget) {
      return;
    }

    setReviewing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.warning('请先登录');
        return;
      }

      const payload = {
        status: reviewStatus,
        reviewComment: reviewComment.trim()
      };

      const response = await fetch(`/api/adoptions/${reviewTarget.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      if (response.status === 403) {
        message.error('无权限执行审核操作');
        return;
      }

      const data = await response.json();
      if (data.code !== 200) {
        message.error(data.message || '审核失败');
        return;
      }

      message.success(reviewStatus === 'approved' ? '已通过申请' : '已驳回申请');
      setReviewVisible(false);
      setReviewTarget(null);

      if (currentAdo && currentAdo.id === reviewTarget.id) {
        setCurrentAdo({
          ...currentAdo,
          status: reviewStatus,
          review_comment: reviewComment.trim()
        });
      }

      fetchAdoptions();
    } catch (error) {
      console.error('Failed to review adoption:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setReviewing(false);
    }
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
      key: 'applicant_name',
      render: (_, record) => record.applicant_name || record.user_name || record.username || '-',
    },
    {
      title: '联系电话',
      key: 'phone',
      render: (_, record) => record.phone || record.contact || record.user_contact || '-',
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
      width: isAdminView ? 280 : 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {isAdminView && record.status === 'pending' && (
            <>
              <Button
                type="link"
                style={{ color: '#26D07C' }}
                onClick={() => openReviewModal(record, 'approved')}
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                onClick={() => openReviewModal(record, 'rejected')}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="adoption-list-page">
      <Card className="adoption-card" bordered={false}>
        <div className="page-header-content">
          <h1 className="page-title">{isAdminView ? '领养申请管理' : '我的领养申请'}</h1>
          <p className="page-subtitle">
            {isAdminView ? '查看和处理用户提交的领养申请' : '查看和管理您的领养申请记录'}
          </p>
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
        onCancel={handleCloseDetail}
        footer={isAdminView && currentAdo?.status === 'pending' ? (
          <Space>
            <Button danger onClick={() => openReviewModal(currentAdo, 'rejected')}>
              驳回申请
            </Button>
            <Button type="primary" onClick={() => openReviewModal(currentAdo, 'approved')}>
              通过申请
            </Button>
          </Space>
        ) : null}
        width={600}
      >
        {currentAdo && (
          <div className="adoption-detail">
            <div className="detail-section">
              <h3>宠物信息</h3>
              <p><strong>宠物名称:</strong> {currentAdo.pet_name}</p>
              <p><strong>品种:</strong> {currentAdo.pet_breed || currentAdo.breed}</p>
            </div>

            <div className="detail-section">
              <h3>申请人信息</h3>
              <p><strong>姓名:</strong> {currentAdo.applicant_name || currentAdo.user_name || currentAdo.username || '未填写'}</p>
              <p><strong>联系电话:</strong> {currentAdo.phone || currentAdo.contact || currentAdo.user_contact || '未填写'}</p>
              <p><strong>地址:</strong> {currentAdo.address || '未填写'}</p>
            </div>

            <div className="detail-section">
              <h3>申请理由</h3>
              <p className="reason-text">{currentAdo.reason || '未填写'}</p>
            </div>

            <div className="detail-section">
              <h3>审核信息</h3>
              <p><strong>状态:</strong> <Tag color={getStatusColor(currentAdo.status)}>{getStatusText(currentAdo.status)}</Tag></p>
              {currentAdo.review_comment && (
                <p><strong>审核备注:</strong> {currentAdo.review_comment}</p>
              )}
              <p><strong>申请时间:</strong> {new Date(currentAdo.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={reviewStatus === 'approved' ? '通过领养申请' : '驳回领养申请'}
        className="adoption-review-modal"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        onOk={handleSubmitReview}
        confirmLoading={reviewing}
        okText="确认"
        cancelText="取消"
      >
        <p style={{ marginBottom: 12 }}>
          {reviewTarget ? `申请ID：${reviewTarget.id}，宠物：${reviewTarget.pet_name}` : ''}
        </p>
        <Input.TextArea
          rows={4}
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder={reviewStatus === 'approved' ? '可选：填写通过备注' : '可选：填写驳回原因'}
          maxLength={300}
          showCount
        />
      </Modal>
    </div>
  );
}

export default AdoptionListPage;
