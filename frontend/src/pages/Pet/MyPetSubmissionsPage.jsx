import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Upload
} from 'antd';
import { EditOutlined, RedoOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { TextArea } = Input;

function MyPetSubmissionsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();

  const fetchList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pets/my-submissions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setList(data.data || []);
      } else {
        message.error(data.message || '获取送养发布失败');
      }
    } catch (error) {
      message.error('获取送养发布失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const uploadImage = async ({ file, onSuccess, onError }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pet');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.code === 200) {
        onSuccess({ url: data.data.url });
      } else {
        onError(new Error(data.message || '上传失败'));
      }
    } catch (error) {
      onError(error);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFileList((item.photos || []).map((url, index) => ({
      uid: `${item.id}-${index}`,
      name: `photo-${index + 1}`,
      status: 'done',
      url
    })));
    form.setFieldsValue({
      name: item.name,
      breed: item.breed,
      gender: item.gender,
      age: Number(item.age),
      healthStatus: item.health_status,
      personality: item.personality,
      vaccination: item.vaccination,
      sterilized: Boolean(item.sterilized),
      remarks: item.remarks
    });
  };

  const handleUpdate = async (values) => {
    if (!editingItem) {
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pets/my-submissions/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          photos: fileList
            .filter((item) => item.status === 'done')
            .map((item) => item.response?.url || item.url)
        })
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('更新成功');
        setEditingItem(null);
        form.resetFields();
        fetchList();
      } else {
        message.error(data.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pets/my-submissions/${id}/resubmit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('已重新提交审核');
        fetchList();
      } else {
        message.error(data.message || '提交失败');
      }
    } catch (error) {
      message.error('提交失败');
    }
  };

  const statusTag = (status) => {
    const map = {
      pending: ['gold', '待审核'],
      approved: ['green', '已通过'],
      rejected: ['red', '已驳回']
    };
    const [color, text] = map[status] || ['default', status];
    return <Tag color={color}>{text}</Tag>;
  };

  const petStatusTag = (status) => {
    const map = {
      pending: ['processing', '审核中'],
      available: ['gold', '待领养'],
      adopted: ['green', '已领养'],
      off_shelf: ['default', '已下架']
    };
    const [color, text] = map[status] || ['default', status];
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    { title: '宠物名称', dataIndex: 'name', key: 'name' },
    { title: '发布审核', dataIndex: 'submission_status', key: 'submission_status', render: statusTag },
    { title: '领养状态', dataIndex: 'status', key: 'status', render: petStatusTag },
    { title: '审核备注', dataIndex: 'submission_comment', key: 'submission_comment', render: (text) => text || '-' },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => new Date(value).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {['pending', 'rejected'].includes(record.submission_status) && !['adopted', 'off_shelf'].includes(record.status) && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {record.submission_status === 'rejected' && (
            <Button type="link" icon={<RedoOutlined />} onClick={() => handleResubmit(record.id)}>
              重新提交
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card variant="borderless">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>我的送养发布</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>管理自己发布的送养信息</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/pet-submissions/new')}>
            新建发布
          </Button>
        </div>

        <Table rowKey="id" columns={columns} dataSource={list} loading={loading} locale={{ emptyText: '暂无送养发布' }} />
      </Card>

      <Modal
        title="编辑送养发布"
        open={!!editingItem}
        onCancel={() => {
          setEditingItem(null);
          form.resetFields();
          setFileList([]);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Form.Item label="宠物名称" name="name" rules={[{ required: true, message: '请输入宠物名称' }]}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label="品种" name="breed" rules={[{ required: true, message: '请输入品种' }]}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别' }]}>
              <Select options={[{ label: '公', value: 'male' }, { label: '母', value: 'female' }]} />
            </Form.Item>
            <Form.Item label="年龄" name="age" rules={[{ required: true, message: '请输入年龄' }]}>
              <InputNumber min={0} max={30} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="健康状况" name="healthStatus" rules={[{ required: true, message: '请选择健康状况' }]}>
              <Select options={[{ label: '良好', value: 'good' }, { label: '一般', value: 'fair' }, { label: '需治疗', value: 'poor' }]} />
            </Form.Item>
            <Form.Item label="已绝育" name="sterilized" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </div>

          <Form.Item label="性格特点" name="personality">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="疫苗情况" name="vaccination">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="送养说明" name="remarks" rules={[{ required: true, message: '请输入送养说明' }]}>
            <TextArea rows={5} maxLength={500} showCount />
          </Form.Item>

          <Form.Item label="宠物照片">
            <Upload.Dragger
              multiple
              accept="image/*"
              customRequest={uploadImage}
              fileList={fileList}
              onChange={({ fileList: nextFileList }) => setFileList(nextFileList.slice(-5))}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p>上传 1-5 张宠物照片</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyPetSubmissionsPage;
