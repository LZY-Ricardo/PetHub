import React from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Select, Space, Table } from 'antd';
import { message } from '../../utils/antdApp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BoardingStatusTag from '../../components/Boarding/BoardingStatusTag';
import BoardingActionPanel from '../../components/Boarding/BoardingActionPanel';
import { BOARDING_STATUS_META } from '../../components/Boarding/boardingConstants';
import './BoardingManagementPage.css';

function BoardingManagementPage() {
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [detailRecord, setDetailRecord] = React.useState(null);
  const [actionModal, setActionModal] = React.useState({ open: false, action: null });
  const [submitting, setSubmitting] = React.useState(false);
  const [query, setQuery] = React.useState({ status: '', keyword: '' });
  const [form] = Form.useForm();

  const getAuthHeader = React.useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchRecords = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', '100');
      if (query.status) params.set('status', query.status);
      if (query.keyword) params.set('keyword', query.keyword);

      const response = await fetch(`/api/admin/boarding-applications?${params.toString()}`, {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setRecords(data.data?.list || []);
      } else {
        message.error(data.message || '获取寄养申请失败');
      }
    } catch (error) {
      message.error('获取寄养申请失败');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, handleTokenExpired, navigate, query.keyword, query.status]);

  React.useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const actionConfig = {
    approve: { title: '确认接收', url: 'review', payloadKey: 'reviewComment', extra: { action: 'approve' } },
    reject: { title: '拒绝申请', url: 'review', payloadKey: 'reviewComment', extra: { action: 'reject' } },
    checkIn: { title: '登记入住', url: 'check-in', payloadKey: 'checkInNote' },
    complete: { title: '标记完成', url: 'complete', payloadKey: 'completionNote' },
    cancelAdmin: { title: '取消申请', url: 'cancel', payloadKey: 'cancelReason' }
  };

  const handleActionSubmit = async (values) => {
    if (!detailRecord || !actionModal.action) {
      return;
    }

    const config = actionConfig[actionModal.action];
    setSubmitting(true);
    try {
      const payload = {
        ...config.extra,
        [config.payloadKey]: values.note
      };

      const response = await fetch(`/api/admin/boarding-applications/${detailRecord.id}/${config.url}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success(`${config.title}成功`);
        setActionModal({ open: false, action: null });
        setDetailRecord(data.data);
        form.resetFields();
        fetchRecords();
      } else {
        message.error(data.message || `${config.title}失败`);
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '申请ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '宠物', dataIndex: 'pet_name', key: 'pet_name' },
    { title: '申请人', dataIndex: 'user_name', key: 'user_name', render: (value) => value || '-' },
    { title: '联系方式', dataIndex: 'contact_phone', key: 'contact_phone' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status) => <BoardingStatusTag status={status} /> },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => <Button type="link" onClick={() => setDetailRecord(record)}>查看详情</Button>
    }
  ];

  return (
    <div className="boarding-management-page">
      <Card variant="borderless" title="宠物寄养管理">
        <Space style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 160 }}
            options={Object.entries(BOARDING_STATUS_META).map(([value, meta]) => ({
              label: meta.text,
              value
            }))}
            onChange={(value) => setQuery((prev) => ({ ...prev, status: value || '' }))}
          />
          <Input.Search
            placeholder="搜索宠物或申请人"
            allowClear
            onSearch={(value) => setQuery((prev) => ({ ...prev, keyword: value.trim() }))}
            style={{ width: 280 }}
          />
        </Space>

        <Table
          rowKey="id"
          dataSource={records}
          columns={columns}
          loading={loading}
          locale={{ emptyText: '暂无寄养申请' }}
        />
      </Card>

      <Modal
        title="寄养申请详情"
        open={!!detailRecord}
        onCancel={() => setDetailRecord(null)}
        footer={null}
        width={760}
        destroyOnHidden
      >
        {detailRecord && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="申请人">{detailRecord.user_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态"><BoardingStatusTag status={detailRecord.status} /></Descriptions.Item>
              <Descriptions.Item label="宠物名称">{detailRecord.pet_name}</Descriptions.Item>
              <Descriptions.Item label="宠物来源">{detailRecord.source_type === 'profile' ? '宠物档案' : '手动填写'}</Descriptions.Item>
              <Descriptions.Item label="寄养开始">{detailRecord.start_date}</Descriptions.Item>
              <Descriptions.Item label="寄养结束">{detailRecord.end_date}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{detailRecord.contact_phone}</Descriptions.Item>
              <Descriptions.Item label="紧急联系人">{detailRecord.emergency_contact || '-'}</Descriptions.Item>
              <Descriptions.Item label="特殊照料说明" span={2}>{detailRecord.special_care_notes || '-'}</Descriptions.Item>
              <Descriptions.Item label="审核备注" span={2}>{detailRecord.review_comment || '-'}</Descriptions.Item>
              <Descriptions.Item label="取消原因" span={2}>{detailRecord.cancel_reason || '-'}</Descriptions.Item>
            </Descriptions>

            <BoardingActionPanel
              actions={detailRecord.actions}
              isAdmin
              onAction={(action) => {
                form.resetFields();
                setActionModal({ open: true, action });
              }}
            />
          </Space>
        )}
      </Modal>

      <Modal
        title={actionConfig[actionModal.action]?.title || '处理寄养申请'}
        open={actionModal.open}
        onCancel={() => setActionModal({ open: false, action: null })}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleActionSubmit}>
          <Form.Item
            label="处理备注"
            name="note"
            rules={[{ required: ['reject', 'cancelAdmin'].includes(actionModal.action), message: '请输入处理备注' }]}
          >
            <Input.TextArea rows={4} maxLength={300} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default BoardingManagementPage;
