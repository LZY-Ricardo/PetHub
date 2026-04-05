import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ApiError,
  clearUnauthorizedHandler,
  createQueryString,
  request,
  setUnauthorizedHandler
} from './apiClient.js';

const createJsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: {
    get(name) {
      return name.toLowerCase() === 'content-type' ? 'application/json' : null;
    }
  },
  async json() {
    return body;
  }
});

test('createQueryString skips empty values and expands arrays', () => {
  const queryString = createQueryString({
    page: 2,
    keyword: 'cat',
    empty: '',
    missing: undefined,
    filters: ['pending', 'approved']
  });

  assert.equal(queryString, 'page=2&keyword=cat&filters=pending&filters=approved');
});

test('request attaches bearer token for required auth requests', async () => {
  let requestOptions = null;
  global.localStorage = {
    getItem(key) {
      return key === 'token' ? 'token-123' : null;
    }
  };
  global.fetch = async (_, options) => {
    requestOptions = options;
    return createJsonResponse({ code: 200, data: { ok: true } });
  };

  const result = await request('/api/demo', { auth: 'required' });

  assert.deepEqual(result, { ok: true });
  assert.equal(requestOptions.headers.Authorization, 'Bearer token-123');
});

test('request omits content-type when body is FormData', async () => {
  let requestOptions = null;
  global.localStorage = {
    getItem() {
      return 'token-123';
    }
  };
  global.fetch = async (_, options) => {
    requestOptions = options;
    return createJsonResponse({ code: 200, data: { ok: true } });
  };

  const formData = new FormData();
  formData.append('file', 'demo');

  await request('/api/upload', {
    method: 'POST',
    auth: 'required',
    body: formData
  });

  assert.equal(requestOptions.body, formData);
  assert.equal(Object.hasOwn(requestOptions.headers, 'Content-Type'), false);
});

test('request triggers unauthorized handler on 401 response', async () => {
  let unauthorizedCalls = 0;
  global.localStorage = {
    getItem() {
      return 'token-123';
    }
  };
  global.fetch = async () => createJsonResponse({ code: 401, message: 'expired' }, 401);
  setUnauthorizedHandler(() => {
    unauthorizedCalls += 1;
  });

  await assert.rejects(
    () => request('/api/secure', { auth: 'required' }),
    (error) => {
      assert.equal(error instanceof ApiError, true);
      assert.equal(error.status, 401);
      assert.equal(error.message, 'expired');
      return true;
    }
  );
  assert.equal(unauthorizedCalls, 1);
  clearUnauthorizedHandler();
});

test('request throws ApiError when api code indicates failure', async () => {
  global.localStorage = {
    getItem() {
      return null;
    }
  };
  global.fetch = async () => createJsonResponse({ code: 400, message: 'bad request' }, 200);

  await assert.rejects(
    () => request('/api/fail'),
    (error) => {
      assert.equal(error instanceof ApiError, true);
      assert.equal(error.status, 200);
      assert.equal(error.code, 400);
      assert.equal(error.message, 'bad request');
      return true;
    }
  );
});
