const test = require('node:test');
const assert = require('node:assert/strict');

const {
  BOARDING_STATUS,
  isTransitionAllowed,
  getActionFlags
} = require('../src/services/boardingStateMachine');

test('allows the main boarding lifecycle transitions', () => {
  assert.equal(isTransitionAllowed(BOARDING_STATUS.PENDING, BOARDING_STATUS.CONFIRMED), true);
  assert.equal(isTransitionAllowed(BOARDING_STATUS.CONFIRMED, BOARDING_STATUS.BOARDING), true);
  assert.equal(isTransitionAllowed(BOARDING_STATUS.BOARDING, BOARDING_STATUS.COMPLETED), true);
});

test('rejects invalid transitions from terminal states and wrong hops', () => {
  assert.equal(isTransitionAllowed(BOARDING_STATUS.PENDING, BOARDING_STATUS.COMPLETED), false);
  assert.equal(isTransitionAllowed(BOARDING_STATUS.REJECTED, BOARDING_STATUS.CONFIRMED), false);
  assert.equal(isTransitionAllowed(BOARDING_STATUS.CANCELLED, BOARDING_STATUS.BOARDING), false);
});

test('returns user action flags based on current status', () => {
  assert.deepEqual(getActionFlags(BOARDING_STATUS.PENDING, 'user'), {
    canCancelByUser: true,
    canApprove: false,
    canReject: false,
    canCheckIn: false,
    canComplete: false,
    canCancelByAdmin: false
  });

  assert.deepEqual(getActionFlags(BOARDING_STATUS.BOARDING, 'user'), {
    canCancelByUser: false,
    canApprove: false,
    canReject: false,
    canCheckIn: false,
    canComplete: false,
    canCancelByAdmin: false
  });
});

test('returns admin action flags based on current status', () => {
  assert.deepEqual(getActionFlags(BOARDING_STATUS.PENDING, 'admin'), {
    canCancelByUser: false,
    canApprove: true,
    canReject: true,
    canCheckIn: false,
    canComplete: false,
    canCancelByAdmin: true
  });

  assert.deepEqual(getActionFlags(BOARDING_STATUS.CONFIRMED, 'admin'), {
    canCancelByUser: false,
    canApprove: false,
    canReject: false,
    canCheckIn: true,
    canComplete: false,
    canCancelByAdmin: true
  });
});
