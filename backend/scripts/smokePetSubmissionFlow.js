require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const USERNAME = process.env.SMOKE_USER || 'xiaoming';
const USER_PASSWORD = process.env.SMOKE_USER_PASSWORD || '123456';
const ADMIN_USERNAME = process.env.SMOKE_ADMIN || 'admin';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || 'admin123';

async function resolveBaseUrl() {
  if (process.env.SMOKE_BASE_URL) {
    return process.env.SMOKE_BASE_URL;
  }

  const candidates = [
    `http://localhost:${process.env.PORT || 3000}/api`,
    'http://localhost:3001/api'
  ];

  for (const candidate of candidates) {
    try {
      const healthUrl = candidate.replace(/\/api$/, '/health');
      const response = await fetch(healthUrl);
      if (response.ok) {
        return candidate;
      }
    } catch (error) {
      // 继续尝试下一个候选地址
    }
  }

  throw new Error('无法探测到可用的后端服务地址，请设置 SMOKE_BASE_URL');
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.code >= 400) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${data.message || response.statusText}`);
  }
  return data;
}

async function login(baseUrl, username, password) {
  const data = await requestJson(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return data.data.token;
}

async function main() {
  const BASE_URL = await resolveBaseUrl();
  const userToken = await login(BASE_URL, USERNAME, USER_PASSWORD);
  const adminToken = await login(BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD);
  const petName = `联调送养犬_${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(8, 14)}`;

  const created = await requestJson(`${BASE_URL}/pets/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      name: petName,
      breed: '拉布拉多',
      gender: 'male',
      age: 3,
      healthStatus: 'good',
      personality: '温顺',
      vaccination: '已完成',
      sterilized: true,
      remarks: '联调用送养发布，请勿长期保留',
      photos: []
    })
  });

  const petId = created.data.id;

  const pending = await requestJson(`${BASE_URL}/pets/pending-submissions?page=1&pageSize=100`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  const reviewed = await requestJson(`${BASE_URL}/pets/submissions/${petId}/review`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'approved',
      reviewComment: '联调通过'
    })
  });

  const publicList = await requestJson(`${BASE_URL}/pets?keyword=${encodeURIComponent(petName)}`);
  const notifications = await requestJson(`${BASE_URL}/notifications?page=1&pageSize=10&type=adoption`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  const summary = {
    baseUrl: BASE_URL,
    petName,
    createdId: petId,
    createdSubmissionStatus: created.data.submission_status,
    pendingSubmissionFound: pending.data.list.some((item) => item.id === petId),
    reviewSubmissionStatus: reviewed.data.submission_status,
    reviewPetStatus: reviewed.data.status,
    publicFoundCount: publicList.data.total,
    latestNotificationTitle: notifications.data.list?.[0]?.title || null
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
