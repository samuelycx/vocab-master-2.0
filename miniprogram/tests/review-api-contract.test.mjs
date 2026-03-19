import test from 'node:test';
import assert from 'node:assert/strict';

import { API } from '../src/api.js';

function installWxMock(handler) {
  globalThis.wx = {
    cloud: {
      callFunction: handler
    }
  };
}

test('getReviewCount reads the total pending count from the cloud response', async () => {
  installWxMock(async ({ name, data }) => {
    assert.equal(name, 'progress');
    assert.equal(data.type, 'getReviewCount');
    return {
      result: {
        success: true,
        data: {
          total: 12
        }
      }
    };
  });

  const total = await API.getReviewCount('user-1');

  assert.equal(total, 12);
});

test('getReviewSession requests the dedicated review session endpoint', async () => {
  installWxMock(async ({ name, data }) => {
    assert.equal(name, 'progress');
    assert.equal(data.type, 'getReviewSession');
    assert.equal(data.data.limit, 30);
    return {
      result: {
        success: true,
        data: [{ id: 'word-1' }, { id: 'word-2' }]
      }
    };
  });

  const session = await API.getReviewSession('user-1');

  assert.deepEqual(session, [{ id: 'word-1' }, { id: 'word-2' }]);
});

test('getReviews stays as a compatibility alias for the review session endpoint', async () => {
  installWxMock(async ({ data }) => {
    assert.equal(data.type, 'getReviewSession');
    assert.equal(data.data.limit, 20);
    return {
      result: {
        success: true,
        data: [{ id: 'word-3' }]
      }
    };
  });

  const session = await API.getReviews('user-1');

  assert.deepEqual(session, [{ id: 'word-3' }]);
});

test('syncProgress forwards the current session mode to the cloud function', async () => {
  installWxMock(async ({ name, data }) => {
    assert.equal(name, 'progress');
    assert.equal(data.type, 'syncProgress');
    assert.deepEqual(data.data, {
      wordId: 'word-9',
      status: 'MASTERED',
      xp: 10,
      coins: 1,
      maxCombo: 3,
      mode: 'review'
    });
    return {
      result: {
        success: true,
        data: {
          ok: true
        }
      }
    };
  });

  const response = await API.syncProgress('user-1', 'word-9', 'MASTERED', 10, 1, 3, 'review');

  assert.equal(response.success, true);
});
