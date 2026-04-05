import React from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { message } from '../../utils/antdApp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
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

  const fetchPets = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/user-pets', { auth: 'required' });
      setPets(data || []);
    } catch (error) {
      message.error(error.message || '获取宠物档案失败');
    } finally {
      setLoading(false);
    }
  }, [handleTokenExpired, navigate]);

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
      await apiClient.request(editingPet ? `/api/user-pets/${editingPet.id}` : '/api/user-pets', {
        method: editingPet ? 'PUT' : 'POST',
        auth: 'required',
        body: values
      });
      message.success(editingPet ? '宠物档案已更新' : '宠物档案已创建');
      setModalOpen(false);
      fetchPets();
    } catch (error) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/user-pets/${id}`, { auth: 'required' });
      message.success('宠物档案已删除');
      fetchPets();
    } catch (error) {
      message.error(error.message || '删除失败');
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
        variant="borderless"
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
