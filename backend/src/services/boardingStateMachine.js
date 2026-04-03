const BOARDING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  BOARDING: 'boarding',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

const ALLOWED_TRANSITIONS = {
  [BOARDING_STATUS.PENDING]: [BOARDING_STATUS.CONFIRMED, BOARDING_STATUS.REJECTED, BOARDING_STATUS.CANCELLED],
  [BOARDING_STATUS.CONFIRMED]: [BOARDING_STATUS.BOARDING, BOARDING_STATUS.CANCELLED],
  [BOARDING_STATUS.BOARDING]: [BOARDING_STATUS.COMPLETED],
  [BOARDING_STATUS.COMPLETED]: [],
  [BOARDING_STATUS.CANCELLED]: [],
  [BOARDING_STATUS.REJECTED]: []
};

const USER_CANCELABLE_STATUSES = [BOARDING_STATUS.PENDING, BOARDING_STATUS.CONFIRMED];
const ADMIN_CANCELABLE_STATUSES = [BOARDING_STATUS.PENDING, BOARDING_STATUS.CONFIRMED];

const isTransitionAllowed = (currentStatus, nextStatus) => {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
};

const getActionFlags = (status, role = 'user') => {
  const isAdmin = role === 'admin';

  return {
    canCancelByUser: !isAdmin && USER_CANCELABLE_STATUSES.includes(status),
    canApprove: isAdmin && status === BOARDING_STATUS.PENDING,
    canReject: isAdmin && status === BOARDING_STATUS.PENDING,
    canCheckIn: isAdmin && status === BOARDING_STATUS.CONFIRMED,
    canComplete: isAdmin && status === BOARDING_STATUS.BOARDING,
    canCancelByAdmin: isAdmin && ADMIN_CANCELABLE_STATUSES.includes(status)
  };
};

module.exports = {
  BOARDING_STATUS,
  ALLOWED_TRANSITIONS,
  USER_CANCELABLE_STATUSES,
  ADMIN_CANCELABLE_STATUSES,
  isTransitionAllowed,
  getActionFlags
};
