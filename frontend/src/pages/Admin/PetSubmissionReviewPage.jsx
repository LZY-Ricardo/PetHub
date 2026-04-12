import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Space, Table, Tag } from 'antd';
import { message } from '../../utils/antdApp';
import { CheckOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';

function PetSubmissionReviewPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { handleTokenExpired } = useAuth();
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/pets/pending-submissions', {
        auth: 'required',
        params: { page: 1, pageSize: 100 }
      });
      setList(data?.list || []);
    } catch (error) {
      message.error(error.message || '获取待审核列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const submitReview = async () => {
    if (!reviewingItem) {
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.put(`/api/pets/submissions/${reviewingItem.id}/review`, {
          status: reviewStatus,
          reviewComment
      }, { auth: 'required' });
      message.success('审核完成');
      setReviewingItem(null);
      setReviewComment('');
      fetchList();
    } catch (error) {
      message.error(error.message || '审核失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '宠物名称', dataIndex: 'name', key: 'name' },
    { title: '品种', dataIndex: 'breed', key: 'breed' },
    { title: '发布人', dataIndex: 'owner_name', key: 'owner_name', render: (text) => text || '-' },
    { title: '来源', dataIndex: 'source_type', key: 'source_type', render: () => <Tag color="blue">用户发布</Tag> },
    { title: '当前状态', dataIndex: 'status', key: 'status', render: () => <Tag color="gold">审核中</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<CheckOutlined />} onClick={() => { setReviewingItem(record); setReviewStatus('approved'); setReviewComment(''); }}>
            审核
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card variant="borderless">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ marginBottom: 8 }}>送养发布审核</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>处理普通用户提交的送养发布</p>
        </div>

        <Table rowKey="id" columns={columns} dataSource={list} loading={loading} locale={{ emptyText: '暂无待审核送养发布' }} />
      </Card>

      <Modal
        title={reviewStatus === 'approved' ? '通过送养发布' : '驳回送养发布'}
        open={Boolean(reviewingItem)}
        onCancel={() => setReviewingItem(null)}
        onOk={submitReview}
        confirmLoading={submitting}
        okText={reviewStatus === 'approved' ? '确认通过' : '确认驳回'}
      >
        {reviewingItem && (
          <>
            <p style={{ marginBottom: 16 }}>宠物：{reviewingItem.name}</p>
            <Space style={{ marginBottom: 16 }}>
              <Button type={reviewStatus === 'approved' ? 'primary' : 'default'} onClick={() => setReviewStatus('approved')}>
                通过
              </Button>
              <Button danger={reviewStatus === 'rejected'} type={reviewStatus === 'rejected' ? 'primary' : 'default'} onClick={() => setReviewStatus('rejected')}>
                驳回
              </Button>
            </Space>
            <Input.TextArea
              rows={4}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder={reviewStatus === 'approved' ? '可选：填写通过备注' : '请填写驳回原因'}
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default PetSubmissionReviewPage;
