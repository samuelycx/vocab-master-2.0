export const FIXED_REVIEW_STEPS = Object.freeze([
  Object.freeze({ minutes: 10 }),
  Object.freeze({ days: 1 }),
  Object.freeze({ days: 3 }),
  Object.freeze({ days: 7 }),
  Object.freeze({ days: 15 }),
  Object.freeze({ days: 30 }),
  Object.freeze({ days: 60 }),
  Object.freeze({ days: 120 })
]);

function toDate(value, fallback = null) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : new Date(value.getTime());
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const normalized = new Date(value);
    return Number.isNaN(normalized.getTime()) ? fallback : normalized;
  }
  return fallback;
}

function toNonNegativeInteger(value, fallback = 0) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    return fallback;
  }
  return Math.floor(normalized);
}

function applyStep(now, step = {}) {
  const nextReview = new Date(now.getTime());

  if (step.minutes) {
    nextReview.setTime(nextReview.getTime() + step.minutes * 60 * 1000);
  } else if (step.days) {
    nextReview.setDate(nextReview.getDate() + step.days);
  }

  return nextReview;
}

function normalizeRandomValue(random) {
  const value = Number(random);
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 0.9999999999999999;
  }
  return value;
}

export function getFixedReviewSteps() {
  return FIXED_REVIEW_STEPS.map((step) => ({ ...step }));
}

export function advanceReviewState(record = {}, { isCorrect, isReview, now = new Date() } = {}) {
  const normalizedNow = toDate(now, new Date());
  const currentStage = toNonNegativeInteger(record.reviewStage, 0);
  const maxStage = FIXED_REVIEW_STEPS.length - 1;

  if (!isCorrect) {
    return {
      reviewStage: 0,
      nextReview: applyStep(normalizedNow, FIXED_REVIEW_STEPS[0])
    };
  }

  if (!isReview) {
    return {
      reviewStage: currentStage,
      nextReview: new Date(normalizedNow.getTime())
    };
  }

  const stepIndex = Math.min(currentStage, maxStage);

  return {
    reviewStage: Math.min(currentStage + 1, maxStage),
    nextReview: applyStep(normalizedNow, FIXED_REVIEW_STEPS[stepIndex])
  };
}

export function isReviewCandidate(record = {}, now = new Date()) {
  const normalizedNow = toDate(now, new Date());
  const mistakeCount = toNonNegativeInteger(record.mistakeCount, 0);
  const nextReview = toDate(record.nextReview);

  return mistakeCount > 0 || Boolean(nextReview && nextReview.getTime() <= normalizedNow.getTime());
}

export function limitReviewSession(records = [], limit = 30, random = Math.random) {
  const safeLimit = Math.max(0, toNonNegativeInteger(limit, 30));
  const shuffled = Array.isArray(records) ? [...records] : [];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(normalizeRandomValue(random()) * (index + 1));
    const temp = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled.slice(0, safeLimit);
}
