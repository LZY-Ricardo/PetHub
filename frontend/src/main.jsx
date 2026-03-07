import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// Custom theme - Warm & Playful Editorial style
const theme = {
  token: {
    // Primary warm colors - friendly and approachable
    colorPrimary: '#FF9F43',
    colorSuccess: '#26D07C',
    colorWarning: '#FFA502',
    colorError: '#EE5A52',
    colorInfo: '#54A0FF',

    // Background colors - warm cream tones
    colorBgBase: '#FFFDF7',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F5F3EF',

    // Typography - Noto Serif for headings, Noto Sans for body
    fontFamily: 'Noto Sans SC, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    borderRadius: 12,

    // Border - soft and subtle
    colorBorder: '#E8E4DD',
    colorBorderSecondary: '#F0EDE6',
  },
  components: {
    Button: {
      borderRadius: 24,
      fontWeight: 600,
      controlHeight: 44,
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 44,
    },
    Modal: {
      borderRadius: 20,
    },
    Tag: {
      borderRadius: 8,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
