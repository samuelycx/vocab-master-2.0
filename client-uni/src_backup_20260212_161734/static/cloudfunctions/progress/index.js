const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-5gafz7hr13d79ef4' })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()

    switch (event.type) {
        case 'syncProgress':
            return await syncProgress(OPENID, event.data)
        case 'getStats':
            return await getStats(OPENID)
        case 'getLearnedWords':
            return await getLearnedWords(OPENID, event.data)
        default:
            return { success: false, msg: 'Unknown type' }
    }
}

async function syncProgress(openid, { wordId, status, xp, coins }) {
    // 1. Update/Create Study Record
    const recordRes = await db.collection('progress').where({ openid, wordId }).get()

    if (recordRes.data.length === 0) {
        await db.collection('progress').add({
            data: {
                openid,
                wordId,
                status,
                repetition: 1,
                learnedAt: db.serverDate(),
                lastReviewedAt: db.serverDate()
            }
        })
    } else {
        await db.collection('progress').where({ openid, wordId }).update({
            data: {
                status,
                repetition: _.inc(1),
                lastReviewedAt: db.serverDate()
            }
        })
    }

    // 2. Update User Stats
    await db.collection('users').where({ openid }).update({
        data: {
            xp: _.inc(xp || 0),
            coins: _.inc(coins || 0),
            totalCorrect: _.inc(status === 'MASTERED' ? 1 : 0)
        }
    })

    // 3. Get Updated User & Check Gamification
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]

    // Simplified Level Up / Achievement check for cloud side
    // In a real app, this logic would be more complex
    const leveledUp = xp > 0 && Math.floor((user.xp - xp) / 100) < Math.floor(user.xp / 100)

    return {
        success: true,
        data: {
            user,
            leveledUp,
            achievements: [] // Achievements can be added here later
        }
    }
}

async function getStats(openid) {
    const userRes = await db.collection('users').where({ openid }).get()
    if (userRes.data.length === 0) return { success: false }

    const learnedCount = await db.collection('progress').where({ openid, status: 'MASTERED' }).count()

    return {
        success: true,
        data: {
            ...userRes.data[0],
            totalLearned: learnedCount.total
        }
    }
}

async function getLearnedWords(openid, { page = 1, limit = 20, search = '' }) {
    const skip = (page - 1) * limit

    let wordIds = []
    let isFiltered = false

    // If search is provided, we need to find matching words first
    if (search && search.trim()) {
        const matchingWords = await db.collection('words').where({
            text: db.RegExp({
                regexp: String(search),
                options: 'i'
            })
        }).get()

        if (matchingWords.data.length === 0) {
            return { success: true, data: [], lastPage: 1 }
        }
        wordIds = matchingWords.data.map(w => w._id)
        isFiltered = true
    }

    let queryFilter = {
        openid,
        status: 'MASTERED'
    }

    if (isFiltered) {
        queryFilter.wordId = _.in(wordIds)
    }

    const progressRes = await db.collection('progress')
        .where(queryFilter)
        .orderBy('lastReviewedAt', 'desc')
        .skip(skip)
        .limit(limit)
        .get()

    const progressList = progressRes.data

    if (progressList.length === 0) {
        return {
            success: true,
            data: [],
            lastPage: 1
        }
    }

    const currentWordIds = progressList.map(p => p.wordId)
    const wordsRes = await db.collection('words').where({
        _id: _.in(currentWordIds)
    }).get()

    const wordMap = wordsRes.data.reduce((acc, word) => {
        acc[word._id] = word
        return acc
    }, {})

    const result = progressList.map(progress => ({
        id: progress._id,
        status: progress.status,
        repetition: progress.repetition,
        nextReview: progress.nextReview,
        word: wordMap[progress.wordId] || { text: 'Unknown', meanings: '[]' }
    }))

    const totalCount = await db.collection('progress').where(queryFilter).count()
    const totalPages = Math.ceil(totalCount.total / limit)

    return {
        success: true,
        data: result,
        lastPage: totalPages
    }
}
