import React from 'react';
import { Alert, Button, Card, DatePicker, Form, Input, Select, Space } from 'antd';
import dayjs from 'dayjs';
import {
  BOARDING_SOURCE_OPTIONS,
  PET_GENDER_OPTIONS,
  USER_PET_TYPE_OPTIONS
} from './boardingConstants';

function BoardingApplicationForm({ userPets = [], onSubmit, submitting = false, onManagePets }) {
  const [form] = Form.useForm();
  const sourceType = Form.useWatch('sourceType', form) || 'profile';

  const handleFinish = (values) => {
    const [start, end] = values.dateRange || [];
    const payload = {
      sourceType: values.sourceType,
      linkedPetId: values.linkedPetId || null,
      petSnapshot: values.sourceType === 'manual' ? {
        name: values.petName,
        type: values.petType,
        breed: values.petBreed,
        age: values.petAge,
        gender: values.petGender,
        healthNotes: values.petHealthNotes
      } : null,
      startDate: start ? dayjs(start).format('YYYY-MM-DD HH:mm:ss') : null,
      endDate: end ? dayjs(end).format('YYYY-MM-DD HH:mm:ss') : null,
      contactPhone: values.contactPhone,
      emergencyContact: values.emergencyContact,
      specialCareNotes: values.specialCareNotes,
      remark: values.remark
    };

    onSubmit(payload, form);
  };

  return (
    <Card variant="borderless">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          sourceType: 'profile'
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          label="宠物来源"
          name="sourceType"
          rules={[{ required: true, message: '请选择宠物来源' }]}
        >
          <Select options={BOARDING_SOURCE_OPTIONS} />
        </Form.Item>

        {sourceType === 'profile' ? (
          <>
            {userPets.length === 0 && (
              <Alert
                type="warning"
                showIcon
                message="还没有宠物档案"
                description={(
                  <Space>
                    <span>先补一条宠物档案，再提交寄养申请。</span>
                    <Button type="link" onClick={onManagePets}>
                      去管理宠物档案
                    </Button>
                  </Space>
                )}
                style={{ marginBottom: 16 }}
              />
            )}
            <Form.Item
              label="选择宠物"
              name="linkedPetId"
              rules={[{ required: true, message: '请选择宠物档案' }]}
            >
              <Select
                placeholder="选择我的宠物档案"
                options={userPets.map((item) => ({
                  label: `${item.name}${item.breed ? ` · ${item.breed}` : ''}`,
                  value: item.id
                }))}
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="宠物名称"
              name="petName"
              rules={[{ required: true, message: '请输入宠物名称' }]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item
              label="宠物类型"
              name="petType"
              rules={[{ required: true, message: '请选择宠物类型' }]}
            >
              <Select options={USER_PET_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item label="品种" name="petBreed">
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label="年龄描述" name="petAge">
              <Input maxLength={50} placeholder="例如：2岁、8个月" />
            </Form.Item>
            <Form.Item label="性别" name="petGender">
              <Select options={PET_GENDER_OPTIONS} />
            </Form.Item>
            <Form.Item label="健康与照料说明" name="petHealthNotes">
              <Input.TextArea rows={3} maxLength={300} />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="寄养时间"
          name="dateRange"
          rules={[{ required: true, message: '请选择寄养时间' }]}
        >
          <DatePicker.RangePicker
            showTime
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          label="联系方式"
          name="contactPhone"
          rules={[{ required: true, message: '请输入联系方式' }]}
        >
          <Input maxLength={30} />
        </Form.Item>

        <Form.Item label="紧急联系人" name="emergencyContact">
          <Input maxLength={100} />
        </Form.Item>

        <Form.Item label="特殊照料说明" name="specialCareNotes">
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={submitting}>
          提交寄养申请
        </Button>
      </Form>
    </Card>
  );
}

export default BoardingApplicationForm;
