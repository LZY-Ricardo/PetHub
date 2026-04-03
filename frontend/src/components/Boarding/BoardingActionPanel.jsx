import React from 'react';
import { Button, Space } from 'antd';

function BoardingActionPanel({ actions = {}, isAdmin = false, onAction, disabled = false }) {
  if (!actions) {
    return null;
  }

  return (
    <Space wrap>
      {actions.canCancelByUser && !isAdmin && (
        <Button danger disabled={disabled} onClick={() => onAction('cancel')}>
          取消申请
        </Button>
      )}
      {actions.canApprove && isAdmin && (
        <Button type="primary" disabled={disabled} onClick={() => onAction('approve')}>
          确认接收
        </Button>
      )}
      {actions.canReject && isAdmin && (
        <Button danger disabled={disabled} onClick={() => onAction('reject')}>
          拒绝
        </Button>
      )}
      {actions.canCheckIn && isAdmin && (
        <Button disabled={disabled} onClick={() => onAction('checkIn')}>
          登记入住
        </Button>
      )}
      {actions.canComplete && isAdmin && (
        <Button disabled={disabled} onClick={() => onAction('complete')}>
          标记完成
        </Button>
      )}
      {actions.canCancelByAdmin && isAdmin && (
        <Button danger disabled={disabled} onClick={() => onAction('cancelAdmin')}>
          取消申请
        </Button>
      )}
    </Space>
  );
}

export default BoardingActionPanel;
