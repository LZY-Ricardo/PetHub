export class ApiError extends Error {
  constructor(message, { status = 500, code = status, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export const isApiError = (error) => error instanceof ApiError;

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const clearUnauthorizedHandler = () => {
  unauthorizedHandler = null;
};

export const createQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

const appendQueryString = (url, params) => {
  const queryString = createQueryString(params);
  if (!queryString) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
};

const getToken = () => globalThis.localStorage?.getItem('token') || null;

const buildHeaders = (headers = {}, body, authMode) => {
  const nextHeaders = { ...headers };
  const token = getToken();

  if (authMode !== 'none' && token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  if (!(body instanceof FormData) && body != null && !Object.hasOwn(nextHeaders, 'Content-Type')) {
    nextHeaders['Content-Type'] = 'application/json';
  }

  return nextHeaders;
};

const normalizeBody = (body, headers) => {
  if (body == null || body instanceof FormData) {
    return body;
  }

  const contentType = headers['Content-Type'] || headers['content-type'];
  if (contentType?.includes('application/json')) {
    return JSON.stringify(body);
  }

  return body;
};

const parseResponse = async (response) => {
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

const notifyUnauthorized = () => {
  if (typeof unauthorizedHandler === 'function') {
    unauthorizedHandler();
  }
};

export const request = async (url, options = {}) => {
  const {
    method = 'GET',
    params,
    body,
    headers,
    auth = 'none',
    onUnauthorized = 'global'
  } = options;

  const token = getToken();
  if (auth === 'required' && !token) {
    if (onUnauthorized !== 'ignore') {
      notifyUnauthorized();
    }
    throw new ApiError('未登录或token已过期', { status: 401, code: 401 });
  }

  const finalHeaders = buildHeaders(headers, body, auth);
  const response = await fetch(appendQueryString(url, params), {
    method,
    headers: finalHeaders,
    body: normalizeBody(body, finalHeaders)
  });

  const payload = await parseResponse(response);
  const message = payload?.message || `请求失败（${response.status}）`;
  const code = payload?.code ?? response.status;

  if (response.status === 401 && onUnauthorized !== 'ignore') {
    notifyUnauthorized();
  }

  if (!response.ok) {
    throw new ApiError(message, {
      status: response.status,
      code,
      data: payload?.data ?? payload
    });
  }

  if (payload && typeof payload.code === 'number' && payload.code >= 400) {
    throw new ApiError(message, {
      status: response.status,
      code: payload.code,
      data: payload.data ?? payload
    });
  }

  return payload?.data ?? payload;
};

export const apiClient = {
  request,
  get(url, options = {}) {
    return request(url, { ...options, method: 'GET' });
  },
  post(url, body, options = {}) {
    return request(url, { ...options, method: 'POST', body });
  },
  put(url, body, options = {}) {
    return request(url, { ...options, method: 'PUT', body });
  },
  patch(url, body, options = {}) {
    return request(url, { ...options, method: 'PATCH', body });
  },
  delete(url, options = {}) {
    return request(url, { ...options, method: 'DELETE' });
  }
};
