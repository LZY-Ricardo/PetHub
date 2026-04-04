import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag
} from 'antd';
import { message } from '../../utils/antdApp';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminManagementPage.css';

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
];

const statusMap = {
  pending: { color: 'gold', text: '待审核' },
  approved: { color: 'green', text: '已通过' },
  rejected: { color: 'red', text: '已驳回' }
};

function AdoptionStatusTag({ value }) {
  const config = statusMap[value] || { color: 'default', text: value || '-' };
  return <Tag color={config.color}>{config.text}</Tag>;
}

function AdoptionManagementPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();

  const requestJson = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      handleTokenExpired();
      navigate('/login', { replace: true });
      return null;
    }

    const data = await response.json();
    if (data.code !== 200) {
      throw new Error(data.message || '请求失败');
    }
    return data.data;
  };

  const fetchStats = async () => {
    try {
      const data = await requestJson('/api/adoptions/stats');
      if (data) {
        setStats(data);
      }
    } catch (error) {
      message.error(error.message || '获取申请统计失败');
    }
  };

  const fetchList = async (nextPagination = pagination, nextFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPagination.current),
        pageSize: String(nextPagination.pageSize)
      });

      if (nextFilters.status) {
        params.append('status', nextFilters.status);
      }

      if (nextFilters.keyword) {
        params.append('keyword', nextFilters.keyword);
      }

      const data = await requestJson(`/api/adoptions?${params.toString()}`);
      if (!data) {
        return;
      }

      setList(data.list || []);
      setPagination((prev) => ({
        ...prev,
        current: data.page || nextPagination.current,
        pageSize: data.pageSize || nextPagination.pageSize,
        total: data.total || 0
      }));
    } catch (error) {
      message.error(error.message || '获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id, visible = true) => {
    if (visible) {
      setDetailVisible(true);
    }
    setDetailLoading(true);
    try {
      const data = await requestJson(`/api/adoptions/${id}`);
      if (data) {
        setCurrentRecord(data);
      }
    } catch (error) {
      message.error(error.message || '获取申请详情失败');
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchList();
  }, []);

  useEffect(() => {
    const focusId = searchParams.get('focusId');
    if (focusId) {
      loadDetail(focusId);
    }
  }, [searchParams]);

  const handleSearch = () => {
    const nextPagination = { ...pagination, current: 1 };
    setPagination(nextPagination);
    fetchList(nextPagination, filters);
  };

  const handleReset = () => {
    const nextFilters = { keyword: '', status: '' };
    const nextPagination = { ...pagination, current: 1 };
    setFilters(nextFilters);
    setPagination(nextPagination);
    fetchList(nextPagination, nextFilters);
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
      await requestJson(`/api/adoptions/${reviewTarget.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: reviewStatus,
          reviewComment: reviewComment.trim()
        })
      });

      message.success(reviewStatus === 'approved' ? '申请已通过' : '申请已驳回');
      setReviewVisible(false);
      setReviewTarget(null);
      fetchStats();
      fetchList();
      if (currentRecord?.id === reviewTarget.id) {
        loadDetail(reviewTarget.id, false);
      }
    } catch (error) {
      message.error(error.message || '审核失败');
    } finally {
      setReviewing(false);
    }
  };

  const columns = [
    {
      title: '申请信息',
      key: 'application',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>#{record.id} · {record.pet_name}</div>
          <div style={{ marginTop: 4, color: '#6b7280' }}>{record.breed || '-'}</div>
        </div>
      )
    },
    {
      title: '申请人',
      key: 'applicant',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{record.user_name || record.username || '-'}</div>
          <div style={{ marginTop: 4, color: '#6b7280' }}>{record.contact || record.phone || '-'}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => <AdoptionStatusTag value={value} />
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => loadDetail(record.id)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => openReviewModal(record, 'approved')}>
              通过
            </Button>
          )}
          {record.status === 'pending' && (
            <Button type="link" danger icon={<CloseOutlined />} onClick={() => openReviewModal(record, 'rejected')}>
              驳回
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">领养申请管理</h1>
          <p className="admin-management-subtitle">集中处理申请流转、审核记录与申请人信息。</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="申请总数" value={stats.total || 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="待审核" value={stats.pending || 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="已通过" value={stats.approved || 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="已驳回" value={stats.rejected || 0} />
          </Card>
        </Col>
      </Row>

      <Card className="admin-filter-card">
        <div className="admin-filter-row">
          <Input
            allowClear
            style={{ width: 240 }}
            placeholder="搜索宠物 / 申请人 / 联系方式"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            style={{ width: 160 }}
            value={filters.status}
            options={statusOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>
      </Card>

      <Card className="admin-table-card">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          className="admin-management-table"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              const nextPagination = { ...pagination, current: page, pageSize };
              setPagination(nextPagination);
              fetchList(nextPagination);
            }
          }}
        />
      </Card>

      <Drawer
        title="申请详情"
        width={640}
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setCurrentRecord(null);
          if (searchParams.get('focusId')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('focusId');
            setSearchParams(nextParams, { replace: true });
          }
        }}
        destroyOnHidden
      >
        {currentRecord && !detailLoading && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="申请编号">#{currentRecord.id}</Descriptions.Item>
              <Descriptions.Item label="宠物名称">{currentRecord.pet_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="宠物状态">{currentRecord.pet_status || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请人">{currentRecord.user_name || currentRecord.username || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{currentRecord.contact || currentRecord.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="居住地址">{currentRecord.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请状态">
                <AdoptionStatusTag value={currentRecord.status} />
              </Descriptions.Item>
              <Descriptions.Item label="审核人">{currentRecord.reviewer_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="审核时间">
                {currentRecord.reviewed_at ? new Date(currentRecord.reviewed_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {currentRecord.created_at ? new Date(currentRecord.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">申请理由</h3>
              <p className="admin-detail-text">{currentRecord.reason || '暂无'}</p>
            </div>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">养宠经验</h3>
              <p className="admin-detail-text">{currentRecord.experience || '暂无'}</p>
            </div>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">审核备注</h3>
              <p className="admin-detail-text">{currentRecord.review_comment || '暂无'}</p>
            </div>

            {currentRecord.status === 'pending' && (
              <div className="admin-card-actions" style={{ marginTop: 24 }}>
                <Button danger onClick={() => openReviewModal(currentRecord, 'rejected')}>
                  驳回申请
                </Button>
                <Button type="primary" onClick={() => openReviewModal(currentRecord, 'approved')}>
                  通过申请
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>

      <Modal
        title={reviewStatus === 'approved' ? '通过领养申请' : '驳回领养申请'}
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        onOk={handleSubmitReview}
        confirmLoading={reviewing}
        okText="确认"
        cancelText="取消"
        destroyOnHidden
      >
        <p style={{ marginBottom: 12 }}>
          {reviewTarget ? `申请 #${reviewTarget.id} · ${reviewTarget.pet_name}` : ''}
        </p>
        <Input.TextArea
          rows={4}
          value={reviewComment}
          onChange={(event) => setReviewComment(event.target.value)}
          placeholder={reviewStatus === 'approved' ? '填写通过备注（可选）' : '填写驳回原因（可选）'}
          maxLength={300}
          showCount
        />
      </Modal>
    </div>
  );
}

export default AdoptionManagementPage;
