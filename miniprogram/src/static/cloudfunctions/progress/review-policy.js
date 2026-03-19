const FIXED_REVIEW_STEPS = Object.freeze([
    Object.freeze({ minutes: 10 }),
    Object.freeze({ days: 1 }),
    Object.freeze({ days: 3 }),
    Object.freeze({ days: 7 }),
    Object.freeze({ days: 15 }),
    Object.freeze({ days: 30 }),
    Object.freeze({ days: 60 }),
    Object.freeze({ days: 120 })
])

function toDate(value, fallback) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? fallback : new Date(value.getTime())
    }

    if (value && typeof value.toDate === 'function') {
        const converted = value.toDate()
        return toDate(converted, fallback)
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? fallback : parsed
    }

    return fallback
}

function toNonNegativeInteger(value, fallback = 0) {
    const normalized = Number(value)
    if (!Number.isFinite(normalized) || normalized < 0) {
        return fallback
    }
    return Math.floor(normalized)
}

function applyStep(now, step) {
    const nextReview = new Date(now.getTime())
    if (step && step.minutes) {
        nextReview.setTime(nextReview.getTime() + step.minutes * 60 * 1000)
    } else if (step && step.days) {
        nextReview.setDate(nextReview.getDate() + step.days)
    }
    return nextReview
}

function normalizeRandomValue(value) {
    const num = Number(value)
    if (!Number.isFinite(num) || num <= 0) {
        return 0
    }
    if (num >= 1) {
        return 0.9999999999999999
    }
    return num
}

function advanceReviewState(record, options) {
    const currentRecord = record || {}
    const runtimeOptions = options || {}
    const now = toDate(runtimeOptions.now, new Date())
    const isCorrect = Boolean(runtimeOptions.isCorrect)
    const isReview = Boolean(runtimeOptions.isReview)
    const currentStage = toNonNegativeInteger(currentRecord.reviewStage, 0)
    const maxStage = FIXED_REVIEW_STEPS.length - 1

    if (!isCorrect) {
        return {
            reviewStage: 0,
            nextReview: applyStep(now, FIXED_REVIEW_STEPS[0])
        }
    }

    if (!isReview) {
        return {
            reviewStage: currentStage,
            nextReview: null
        }
    }

    const stepIndex = Math.min(currentStage, maxStage)
    return {
        reviewStage: Math.min(currentStage + 1, maxStage),
        nextReview: applyStep(now, FIXED_REVIEW_STEPS[stepIndex])
    }
}

function isReviewCandidate(record, now) {
    const currentRecord = record || {}
    const nowDate = toDate(now, new Date())
    const mistakeCount = toNonNegativeInteger(currentRecord.mistakeCount, 0)
    const nextReview = toDate(currentRecord.nextReview, null)

    return mistakeCount > 0 || Boolean(nextReview && nextReview.getTime() <= nowDate.getTime())
}

function limitReviewSession(records, limit = 30, random = Math.random) {
    const safeLimit = Math.max(0, toNonNegativeInteger(limit, 30))
    const shuffled = Array.isArray(records) ? [...records] : []

    for (let idx = shuffled.length - 1; idx > 0; idx -= 1) {
        const randomIndex = Math.floor(normalizeRandomValue(random()) * (idx + 1))
        const temp = shuffled[idx]
        shuffled[idx] = shuffled[randomIndex]
        shuffled[randomIndex] = temp
    }

    return shuffled.slice(0, safeLimit)
}

module.exports = {
    FIXED_REVIEW_STEPS,
    advanceReviewState,
    isReviewCandidate,
    limitReviewSession
}
