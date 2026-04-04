import { useEffect } from 'react';
import { App as AntdApp } from 'antd';

let appApi = null;

const getMessageApi = () => {
  if (!appApi?.message) {
    if (import.meta.env.DEV) {
      console.warn('[antdApp] message API is not ready yet.');
    }
    return null;
  }

  return appApi.message;
};

const callMessage = (method, ...args) => {
  const api = getMessageApi();
  if (!api?.[method]) {
    return undefined;
  }

  return api[method](...args);
};

export function AntdAppBridge() {
  const app = AntdApp.useApp();

  useEffect(() => {
    appApi = app;

    return () => {
      if (appApi === app) {
        appApi = null;
      }
    };
  }, [app]);

  return null;
}

export const message = {
  success: (...args) => callMessage('success', ...args),
  error: (...args) => callMessage('error', ...args),
  warning: (...args) => callMessage('warning', ...args),
  info: (...args) => callMessage('info', ...args),
  loading: (...args) => callMessage('loading', ...args),
  open: (...args) => callMessage('open', ...args),
  destroy: (...args) => callMessage('destroy', ...args)
};
