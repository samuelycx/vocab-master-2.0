import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getFixedReviewSteps,
  advanceReviewState,
  isReviewCandidate,
  limitReviewSession
} from '../src/utils/review-policy.js';

test('getFixedReviewSteps returns the confirmed fixed schedule', () => {
  assert.deepEqual(getFixedReviewSteps(), [
    { minutes: 10 },
    { days: 1 },
    { days: 3 },
    { days: 7 },
    { days: 15 },
    { days: 30 },
    { days: 60 },
    { days: 120 }
  ]);
});

test('advanceReviewState sends learn mistakes to the first review step', () => {
  const now = new Date('2026-03-19T00:00:00.000Z');

  const result = advanceReviewState(
    { reviewStage: 4, mistakeCount: 0 },
    { isCorrect: false, isReview: false, now }
  );

  assert.equal(result.reviewStage, 0);
  assert.equal(result.nextReview.toISOString(), '2026-03-19T00:10:00.000Z');
});

test('advanceReviewState advances review answers using fixed steps', () => {
  const now = new Date('2026-03-19T00:00:00.000Z');

  const first = advanceReviewState({ reviewStage: 0 }, { isCorrect: true, isReview: true, now });
  assert.equal(first.reviewStage, 1);
  assert.equal(first.nextReview.toISOString(), '2026-03-19T00:10:00.000Z');

  const second = advanceReviewState({ reviewStage: 1 }, { isCorrect: true, isReview: true, now });
  assert.equal(second.reviewStage, 2);
  assert.equal(second.nextReview.toISOString(), '2026-03-20T00:00:00.000Z');
});

test('advanceReviewState resets wrong review answers to the first step', () => {
  const now = new Date('2026-03-19T00:00:00.000Z');

  const result = advanceReviewState(
    { reviewStage: 6, mistakeCount: 3 },
    { isCorrect: false, isReview: true, now }
  );

  assert.equal(result.reviewStage, 0);
  assert.equal(result.nextReview.toISOString(), '2026-03-19T00:10:00.000Z');
});

test('isReviewCandidate keeps mixed pool semantics', () => {
  const now = new Date('2026-03-19T12:00:00.000Z');

  assert.equal(isReviewCandidate({ mistakeCount: 2 }, now), true);
  assert.equal(isReviewCandidate({ mistakeCount: 0, nextReview: new Date('2026-03-19T11:59:00.000Z') }, now), true);
  assert.equal(isReviewCandidate({ mistakeCount: 0, nextReview: new Date('2026-03-19T12:01:00.000Z') }, now), false);
  assert.equal(isReviewCandidate({ mistakeCount: 0 }, now), false);
});

test('limitReviewSession shuffles candidates and caps the session size', () => {
  const records = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ];

  const originalOrder = records.map((record) => record.id);
  const session = limitReviewSession(records, 3, () => 0);

  assert.deepEqual(session.map((record) => record.id), ['2', '3', '4']);
  assert.deepEqual(records.map((record) => record.id), originalOrder);
});
