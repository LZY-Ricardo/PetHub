import React from 'react';
import { Tag } from 'antd';
import { BOARDING_STATUS_META } from './boardingConstants';

function BoardingStatusTag({ status }) {
  const meta = BOARDING_STATUS_META[status] || {
    text: status || '未知状态',
    color: 'default'
  };

  return <Tag color={meta.color}>{meta.text}</Tag>;
}

export default BoardingStatusTag;
