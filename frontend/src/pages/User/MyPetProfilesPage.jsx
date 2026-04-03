import React from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PET_GENDER_OPTIONS, USER_PET_TYPE_OPTIONS } from '../../components/Boarding/boardingConstants';
import './MyPetProfilesPage.css';

function MyPetProfilesPage() {
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();
  const [pets, setPets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingPet, setEditingPet] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  const getAuthHeader = React.useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchPets = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-pets', {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setPets(data.data || []);
      } else {
        message.error(data.message || '获取宠物档案失败');
      }
    } catch (error) {
      message.error('获取宠物档案失败');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, handleTokenExpired, navigate]);

  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const openCreateModal = () => {
    setEditingPet(null);
    form.resetFields();
    form.setFieldsValue({ gender: 'unknown', isSterilized: false });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingPet(record);
    form.setFieldsValue({
      name: record.name,
      petType: record.petType,
      breed: record.breed,
      gender: record.gender,
      age: record.age,
      healthNotes: record.healthNotes,
      isSterilized: record.isSterilized,
      remark: record.remark
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const response = await fetch(editingPet ? `/api/user-pets/${editingPet.id}` : '/api/user-pets', {
        method: editingPet ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(values)
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200 || data.code === 201) {
        message.success(editingPet ? '宠物档案已更新' : '宠物档案已创建');
        setModalOpen(false);
        fetchPets();
      } else {
        message.error(data.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/user-pets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        message.success('宠物档案已删除');
        fetchPets();
      } else {
        message.error(data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类型',
      dataIndex: 'petType',
      key: 'petType'
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
      render: (value) => value || '-'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      render: (value) => value || '-'
    },
    {
      title: '绝育',
      dataIndex: 'isSterilized',
      key: 'isSterilized',
      render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? '已绝育' : '未绝育'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除这条宠物档案？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="my-pet-profiles-page">
      <Card
        bordered={false}
        title="我的宠物档案"
        extra={<Button type="primary" onClick={openCreateModal}>新增宠物档案</Button>}
      >
        <Table
          rowKey="id"
          dataSource={pets}
          columns={columns}
          loading={loading}
          locale={{ emptyText: '还没有宠物档案' }}
        />
      </Card>

      <Modal
        title={editingPet ? '编辑宠物档案' : '新增宠物档案'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="宠物名称" name="name" rules={[{ required: true, message: '请输入宠物名称' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="宠物类型" name="petType" rules={[{ required: true, message: '请选择宠物类型' }]}>
            <Select options={USER_PET_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item label="品种" name="breed">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Select options={PET_GENDER_OPTIONS} />
          </Form.Item>
          <Form.Item label="年龄描述" name="age">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item label="健康与照料说明" name="healthNotes">
            <Input.TextArea rows={3} maxLength={300} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} maxLength={300} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyPetProfilesPage;
