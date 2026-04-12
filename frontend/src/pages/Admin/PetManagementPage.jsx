import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  message
} from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminManagementPage.css';

const sourceOptions = [
  { label: '全部来源', value: '' },
  { label: '平台发布', value: 'platform' },
  { label: '用户发布', value: 'user' }
];

const submissionOptions = [
  { label: '全部审核状态', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
];

const statusOptions = [
  { label: '全部领养状态', value: '' },
  { label: '审核中', value: 'pending' },
  { label: '待领养', value: 'available' },
  { label: '已领养', value: 'adopted' },
  { label: '已下架', value: 'off_shelf' }
];

const genderOptions = [
  { label: '公', value: 'male' },
  { label: '母', value: 'female' }
];

const healthOptions = [
  { label: '健康', value: 'good' },
  { label: '一般', value: 'fair' },
  { label: '较差', value: 'poor' }
];

const tagMap = {
  source: {
    platform: { color: 'purple', text: '平台发布' },
    user: { color: 'blue', text: '用户发布' }
  },
  submission: {
    pending: { color: 'gold', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已驳回' }
  },
  status: {
    pending: { color: 'processing', text: '审核中' },
    available: { color: 'gold', text: '待领养' },
    adopted: { color: 'green', text: '已领养' },
    off_shelf: { color: 'default', text: '已下架' }
  }
};

function StatusTag({ value, type }) {
  const config = tagMap[type][value] || { color: 'default', text: value || '-' };
  return <Tag color={config.color}>{config.text}</Tag>;
}

function PetManagementPage() {
  const [stats, setStats] = useState({
    total: 0,
    submission_pending: 0,
    available: 0,
    adopted: 0
  });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPet, setCurrentPet] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    sourceType: '',
    submissionStatus: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();
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
      const data = await requestJson('/api/pets/statistics');
      if (data) {
        setStats(data);
      }
    } catch (error) {
      message.error(error.message || '获取宠物统计失败');
    }
  };

  const fetchList = async (nextPagination = pagination, nextFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPagination.current),
        pageSize: String(nextPagination.pageSize)
      });

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const data = await requestJson(`/api/pets?${params.toString()}`);
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
      message.error(error.message || '获取宠物列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchList();
  }, []);

  const handleSearch = () => {
    const nextPagination = { ...pagination, current: 1 };
    setPagination(nextPagination);
    fetchList(nextPagination, filters);
  };

  const handleReset = () => {
    const nextFilters = {
      keyword: '',
      sourceType: '',
      submissionStatus: '',
      status: ''
    };
    const nextPagination = { ...pagination, current: 1 };
    setFilters(nextFilters);
    setPagination(nextPagination);
    fetchList(nextPagination, nextFilters);
  };

  const openDetail = async (petId) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const data = await requestJson(`/api/pets/${petId}`);
      if (data) {
        setCurrentPet(data);
      }
    } catch (error) {
      message.error(error.message || '获取宠物详情失败');
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = (record) => {
    setEditingPet(record);
    form.setFieldsValue({
      name: record.name,
      breed: record.breed,
      gender: record.gender,
      age: record.age,
      healthStatus: record.health_status,
      personality: record.personality,
      vaccination: record.vaccination,
      sterilized: Boolean(record.sterilized),
      status: record.status,
      submissionStatus: record.submission_status,
      remarks: record.remarks
    });
    setEditVisible(true);
  };

  const handleUpdatePet = async (values) => {
    if (!editingPet) {
      return;
    }

    setSubmitting(true);
    try {
      await requestJson(`/api/pets/${editingPet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
      message.success('宠物信息已更新');
      setEditVisible(false);
      setEditingPet(null);
      fetchStats();
      fetchList();
      if (currentPet?.id === editingPet.id) {
        openDetail(editingPet.id);
      }
    } catch (error) {
      message.error(error.message || '更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const updatePetStatus = async (record, nextStatus) => {
    try {
      await requestJson(`/api/pets/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });
      message.success(nextStatus === 'off_shelf' ? '宠物已下架' : '宠物已重新上架');
      fetchStats();
      fetchList();
      if (currentPet?.id === record.id) {
        openDetail(record.id);
      }
    } catch (error) {
      message.error(error.message || '状态更新失败');
    }
  };

  const deletePet = async (record) => {
    try {
      await requestJson(`/api/pets/${record.id}`, {
        method: 'DELETE'
      });
      message.success('宠物记录已删除');
      fetchStats();
      fetchList();
      if (currentPet?.id === record.id) {
        setDetailVisible(false);
        setCurrentPet(null);
      }
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '宠物信息',
      key: 'pet',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{record.name}</div>
          <div style={{ marginTop: 4, color: '#6b7280' }}>{record.breed || '-'}</div>
        </div>
      )
    },
    {
      title: '来源',
      dataIndex: 'source_type',
      render: (value) => <StatusTag value={value} type="source" />
    },
    {
      title: '发布审核',
      dataIndex: 'submission_status',
      render: (value) => <StatusTag value={value} type="submission" />
    },
    {
      title: '领养状态',
      dataIndex: 'status',
      render: (value) => <StatusTag value={value} type="status" />
    },
    {
      title: '发布人',
      key: 'owner_name',
      render: (_, record) => record.owner_name || record.creator_name || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          {record.status !== 'adopted' && (
            <Button
              type="link"
              onClick={() => updatePetStatus(record, record.status === 'off_shelf' ? 'available' : 'off_shelf')}
            >
              {record.status === 'off_shelf' ? '上架' : '下架'}
            </Button>
          )}
          {record.status !== 'adopted' && (
            <Popconfirm
              title="确认删除该宠物记录？"
              description="删除后不可恢复。"
              okText="删除"
              cancelText="取消"
              onConfirm={() => deletePet(record)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">领养宠物管理</h1>
          <p className="admin-management-subtitle">维护领养池宠物资料、状态与送养来源。</p>
        </div>
        <div className="admin-stat-chip">
          <ReloadOutlined />
          <span>最近同步</span>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="宠物总数" value={stats.total || 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="待审核发布" value={stats.submission_pending || 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="待领养" value={stats.available || 0} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-stats-card">
            <Statistic title="已领养" value={stats.adopted || 0} />
          </Card>
        </Col>
      </Row>

      <Card className="admin-filter-card">
        <div className="admin-filter-row">
          <Input
            allowClear
            style={{ width: 220 }}
            placeholder="搜索宠物名 / 品种"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            style={{ width: 160 }}
            value={filters.sourceType}
            onChange={(value) => setFilters((prev) => ({ ...prev, sourceType: value }))}
            options={sourceOptions}
          />
          <Select
            style={{ width: 160 }}
            value={filters.submissionStatus}
            onChange={(value) => setFilters((prev) => ({ ...prev, submissionStatus: value }))}
            options={submissionOptions}
          />
          <Select
            style={{ width: 160 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={statusOptions}
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
        title="宠物详情"
        width={560}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {currentPet && !detailLoading && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="宠物名称">{currentPet.name}</Descriptions.Item>
              <Descriptions.Item label="品种">{currentPet.breed || '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">{currentPet.gender === 'male' ? '公' : '母'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{currentPet.age ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="健康状态">
                {healthOptions.find((item) => item.value === currentPet.health_status)?.label || currentPet.health_status || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="发布来源">
                <StatusTag value={currentPet.source_type} type="source" />
              </Descriptions.Item>
              <Descriptions.Item label="发布审核">
                <StatusTag value={currentPet.submission_status} type="submission" />
              </Descriptions.Item>
              <Descriptions.Item label="领养状态">
                <StatusTag value={currentPet.status} type="status" />
              </Descriptions.Item>
              <Descriptions.Item label="发布人">{currentPet.owner_name || currentPet.creator_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="疫苗情况">{currentPet.vaccination || '-'}</Descriptions.Item>
              <Descriptions.Item label="已绝育">{currentPet.sterilized ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="照片数量">{Array.isArray(currentPet.photos) ? currentPet.photos.length : 0}</Descriptions.Item>
            </Descriptions>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">性格描述</h3>
              <p className="admin-detail-text">{currentPet.personality || '暂无'}</p>
            </div>

            <div className="admin-detail-block">
              <h3 className="admin-detail-block-title">备注</h3>
              <p className="admin-detail-text">{currentPet.remarks || '暂无'}</p>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="编辑宠物信息"
        open={editVisible}
        onCancel={() => {
          setEditVisible(false);
          setEditingPet(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdatePet}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="宠物名称" rules={[{ required: true, message: '请输入宠物名称' }]}>
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="breed" label="品种" rules={[{ required: true, message: '请输入品种' }]}>
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                <Select options={genderOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
                <InputNumber min={0} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="healthStatus" label="健康状态">
                <Select options={healthOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="submissionStatus" label="发布审核状态">
                <Select options={submissionOptions.filter((item) => item.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="领养状态">
                <Select options={statusOptions.filter((item) => item.value)} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="personality" label="性格描述">
                <Input.TextArea rows={3} maxLength={200} showCount />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="vaccination" label="疫苗情况">
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="remarks" label="备注">
                <Input.TextArea rows={4} maxLength={300} showCount />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="sterilized" label="绝育状态" valuePropName="checked">
                <Switch checkedChildren="已绝育" unCheckedChildren="未绝育" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default PetManagementPage;
