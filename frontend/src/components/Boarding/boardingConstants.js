export const BOARDING_STATUS_META = {
  pending: { text: '待处理', color: 'gold' },
  confirmed: { text: '已确认', color: 'blue' },
  boarding: { text: '寄养中', color: 'processing' },
  completed: { text: '已完成', color: 'success' },
  cancelled: { text: '已取消', color: 'default' },
  rejected: { text: '已拒绝', color: 'error' }
};

export const BOARDING_SOURCE_OPTIONS = [
  { label: '从我的宠物档案选择', value: 'profile' },
  { label: '直接填写宠物信息', value: 'manual' }
];

export const USER_PET_TYPE_OPTIONS = [
  { label: '狗', value: '狗' },
  { label: '猫', value: '猫' },
  { label: '其他', value: '其他' }
];

export const PET_GENDER_OPTIONS = [
  { label: '公', value: 'male' },
  { label: '母', value: 'female' },
  { label: '未知', value: 'unknown' }
];
