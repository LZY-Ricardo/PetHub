import React from 'react';
import { Button, Card, Descriptions, Input, Modal, Space, Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BoardingStatusTag from '../../components/Boarding/BoardingStatusTag';
import BoardingActionPanel from '../../components/Boarding/BoardingActionPanel';
import './MyBoardingListPage.css';

function MyBoardingListPage() {
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [detailRecord, setDetailRecord] = React.useState(null);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);

  const getAuthHeader = React.useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchRecords = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/boarding-applications/my', {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setRecords(data.data || []);
      } else {
        message.error(data.message || '获取寄养申请失败');
      }
    } catch (error) {
      message.error('获取寄养申请失败');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, handleTokenExpired, navigate]);

  React.useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleCancel = async () => {
    if (!detailRecord) {
      return;
    }

    if (!cancelReason.trim()) {
      message.warning('请输入取消原因');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/boarding-applications/${detailRecord.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ cancelReason })
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('寄养申请已取消');
        setCancelModalOpen(false);
        setCancelReason('');
        fetchRecords();
      } else {
        message.error(data.message || '取消失败');
      }
    } catch (error) {
      message.error('取消失败');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: '宠物',
      dataIndex: 'pet_name',
      key: 'pet_name'
    },
    {
      title: '寄养时间',
      key: 'dateRange',
      render: (_, record) => `${record.start_date?.slice(0, 10)} 至 ${record.end_date?.slice(0, 10)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <BoardingStatusTag status={status} />
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => setDetailRecord(record)}>
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="my-boarding-list-page">
      <Card
        variant="borderless"
        title="我的寄养申请"
        extra={<Button type="primary" onClick={() => navigate('/boarding/apply')}>新建申请</Button>}
      >
        <Table
          rowKey="id"
          dataSource={records}
          columns={columns}
          loading={loading}
          locale={{ emptyText: '还没有寄养申请' }}
        />
      </Card>

      <Modal
        title="寄养申请详情"
        open={!!detailRecord}
        onCancel={() => setDetailRecord(null)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        {detailRecord && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="宠物名称">{detailRecord.pet_name}</Descriptions.Item>
              <Descriptions.Item label="状态"><BoardingStatusTag status={detailRecord.status} /></Descriptions.Item>
              <Descriptions.Item label="宠物来源">{detailRecord.source_type === 'profile' ? '宠物档案' : '手动填写'}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{detailRecord.contact_phone}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{detailRecord.start_date}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{detailRecord.end_date}</Descriptions.Item>
              <Descriptions.Item label="紧急联系人">{detailRecord.emergency_contact || '-'}</Descriptions.Item>
              <Descriptions.Item label="取消原因">{detailRecord.cancel_reason || '-'}</Descriptions.Item>
              <Descriptions.Item label="特殊照料说明" span={2}>{detailRecord.special_care_notes || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{detailRecord.remark || '-'}</Descriptions.Item>
            </Descriptions>

            <BoardingActionPanel
              actions={detailRecord.actions}
              onAction={(action) => {
                if (action === 'cancel') {
                  setCancelModalOpen(true);
                }
              }}
            />
          </Space>
        )}
      </Modal>

      <Modal
        title="取消寄养申请"
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onOk={handleCancel}
        confirmLoading={actionLoading}
        destroyOnHidden
      >
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          placeholder="请输入取消原因"
        />
      </Modal>
    </div>
  );
}

export default MyBoardingListPage;
