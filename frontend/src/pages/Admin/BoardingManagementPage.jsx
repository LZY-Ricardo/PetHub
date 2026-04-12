import React from 'react';
import { Card, Col, Row, Statistic, Tag } from 'antd';
import './AdminManagementPage.css';

const rolloutItems = [
  { title: '服务配置', status: 'blocked', meta: '无后端模型' },
  { title: '预约列表', status: 'blocked', meta: '无数据表' },
  { title: '价格策略', status: 'pending', meta: '待业务确认' },
  { title: '入住检查', status: 'pending', meta: '待流程设计' }
];

const statusTagMap = {
  ready: ['green', '已就绪'],
  pending: ['gold', '待设计'],
  blocked: ['red', '未接入']
};

function BoardingManagementPage() {
  return (
    <div className="admin-management-page">
      <div className="admin-management-header">
        <div>
          <h1 className="admin-management-title">宠物寄养管理</h1>
          <p className="admin-management-subtitle">当前仓库尚未接入寄养业务后端，这里先收口为后台控制台壳页。</p>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="admin-stats-card">
            <Statistic title="服务状态" value="未接入" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-stats-card">
            <Statistic title="可用接口" value={0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-stats-card">
            <Statistic title="待补模块" value={rolloutItems.length} />
          </Card>
        </Col>
      </Row>

      <div className="admin-grid">
        <Card className="admin-table-card admin-grid-col-8" title="接入清单">
          <div className="admin-status-list">
            {rolloutItems.map((item) => {
              const [color, text] = statusTagMap[item.status];
              return (
                <div key={item.title} className="admin-status-item">
                  <div className="admin-status-item-main">
                    <span className="admin-status-title">{item.title}</span>
                    <span className="admin-status-meta">{item.meta}</span>
                  </div>
                  <Tag color={color}>{text}</Tag>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="admin-note-card admin-grid-col-4" title="下一阶段">
          <div className="admin-stack">
            <div className="admin-metric-chip">建表与 DAO</div>
            <div className="admin-metric-chip">预约状态流转</div>
            <div className="admin-metric-chip">商家 / 门店模型</div>
            <div className="admin-metric-chip">价格与时段配置</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BoardingManagementPage;
