import React from 'react';
import { Card } from 'antd';

const AdminPlaceholderPage = ({ title }) => {
  return (
    <Card variant="borderless">
      <h1 style={{ marginBottom: 8 }}>{title}</h1>
      <p style={{ margin: 0, color: '#6b7280' }}>页面建设中</p>
    </Card>
  );
};

export default AdminPlaceholderPage;
