const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const RANKS = [
    { level: 1, title: '流浪者 (Wanderer)', vocabRequired: 0, icon: '' },
    { level: 2, title: '新手 (Novice)', vocabRequired: 30, icon: '' },
    { level: 3, title: '学徒 (Apprentice)', vocabRequired: 80, icon: '' },
    { level: 4, title: '巡林客 (Ranger)', vocabRequired: 150, icon: '' },
    { level: 5, title: '探索者 (Explorer)', vocabRequired: 250, icon: '' },
    { level: 6, title: '冒险家 (Adventurer)', vocabRequired: 350, icon: '' },
    { level: 7, title: '佣兵 (Mercenary)', vocabRequired: 480, icon: '' },
    { level: 8, title: '老兵 (Veteran)', vocabRequired: 600, icon: '' },
    { level: 9, title: '骑士 (Knight)', vocabRequired: 750, icon: '' },
    { level: 10, title: '学者 (Scholar)', vocabRequired: 900, icon: '' },
    { level: 11, title: '魔导师 (Mage)', vocabRequired: 1050, icon: '' },
    { level: 12, title: '大师 (Master)', vocabRequired: 1150, icon: '' },
    { level: 13, title: '宗师 (Grandmaster)', vocabRequired: 1250, icon: '' },
    { level: 14, title: '传说 (Legend)', vocabRequired: 1300, icon: '' },
    { level: 15, title: '半神 (Demigod)', vocabRequired: 1301, icon: '' }
]

const DEFAULT_ACHIEVEMENTS = [
    { id: 'growth_first_use', key: 'FIRST_USE', name: '初来乍到', description: '第一次使用程序', category: 'GROWTH', icon: '' },
    { id: 'growth_1', key: 'FIRST_BLOOD', name: '第一滴血', description: '完成第一次答对', category: 'GROWTH', icon: '' },
    { id: 'growth_xp_100', key: 'XP_100', name: '初露锋芒', description: '累计获得 100 经验值', category: 'GROWTH', icon: '' },
    { id: 'growth_xp_1000', key: 'XP_1000', name: '经验丰富', description: '累计获得 1000 经验值', category: 'GROWTH', icon: '' },

    { id: 'cons_3', key: 'STREAK_3', name: '初出茅庐', description: '连续打卡 3 天', category: 'CONSISTENCY', icon: '' },
    { id: 'cons_5', key: 'STREAK_5', name: '坚持不懈', description: '连续打卡 5 天', category: 'CONSISTENCY', icon: '' },
    { id: 'cons_7', key: 'STREAK_7', name: '习惯成自然', description: '连续打卡 7 天', category: 'CONSISTENCY', icon: '' },
    { id: 'cons_10', key: 'STREAK_10', name: '十全十美', description: '连续打卡 10 天', category: 'CONSISTENCY', icon: '' },
    { id: 'cons_14', key: 'STREAK_14', name: '风雨无阻', description: '连续打卡 14 天', category: 'CONSISTENCY', icon: '' },
    { id: 'cons_21', key: 'STREAK_21', name: '自律大师', description: '连续打卡 21 天', category: 'CONSISTENCY', icon: '' },
    { id: 'cons_30', key: 'STREAK_30', name: '月度模范', description: '连续打卡 30 天', category: 'CONSISTENCY', icon: '' },

    { id: 'prec_5', key: 'COMBO_5', name: '五连绝世', description: '连续答对 5 题', category: 'PRECISION', icon: '' },
    { id: 'prec_10', key: 'COMBO_10', name: '不可阻挡', description: '连续答对 10 题', category: 'PRECISION', icon: '' },
    { id: 'prec_20', key: 'COMBO_20', name: '神射手', description: '连续答对 20 题', category: 'PRECISION', icon: '' },
    { id: 'prec_30', key: 'COMBO_30', name: '超神', description: '连续答对 30 题', category: 'PRECISION', icon: '' },
    { id: 'prec_50', key: 'COMBO_50', name: '鹰眼', description: '连续答对 50 题', category: 'PRECISION', icon: '' },

    { id: 'vol_10', key: 'WORDS_10', name: '积跬步', description: '掌握 10 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_30', key: 'WORDS_30', name: '入门', description: '掌握 30 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_50', key: 'WORDS_50', name: '第一桶金', description: '掌握 50 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_100', key: 'WORDS_100', name: '百词斩', description: '掌握 100 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_200', key: 'WORDS_200', name: '积少成多', description: '掌握 200 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_500', key: 'WORDS_500', name: '博闻强识', description: '掌握 500 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_650', key: 'WORDS_650', name: '半壁江山', description: '掌握 650 个单词 (50%)', category: 'VOLUME', icon: '' },
    { id: 'vol_1000', key: 'WORDS_1000', name: '千词斩', description: '掌握 1000 个单词', category: 'VOLUME', icon: '' },
    { id: 'vol_1300', key: 'WORDS_1300', name: '大满贯', description: '掌握全库 1300+ 个单词', category: 'VOLUME', icon: '' },

    { id: 'wealth_50', key: 'COINS_50', name: '零花钱', description: '累计获得 50 金币', category: 'WEALTH', icon: '' },
    { id: 'wealth_100', key: 'COINS_100', name: '储蓄罐', description: '累计获得 100 金币', category: 'WEALTH', icon: '' },
    { id: 'wealth_500', key: 'COINS_500', name: '第一桶金', description: '累计获得 500 金币', category: 'WEALTH', icon: '' },
    { id: 'wealth_1000', key: 'COINS_1000', name: '小富翁', description: '累计获得 1000 金币', category: 'WEALTH', icon: '' },
    { id: 'wealth_5000', key: 'COINS_5000', name: '财阀', description: '累计获得 5000 金币', category: 'WEALTH', icon: '' },

    { id: 'spec_night', key: 'NIGHT_OWL', name: '夜猫子', description: '在凌晨 0:00 - 4:00 之间完成一次学习', category: 'SPECIAL', icon: '' },
    { id: 'spec_morning', key: 'EARLY_BIRD', name: '早起的鸟儿', description: '在清晨 5:00 - 7:00 之间完成一次学习', category: 'SPECIAL', icon: '' }
]

exports.main = async (event, context) => {
    try {
        const { OPENID } = cloud.getWXContext()
        const testOpenid = event && event.data && event.data.openid
        const openid = OPENID || testOpenid

        if (!openid) {
            return {
                success: false,
                code: 'MISSING_OPENID',
                msg: 'Missing OPENID. Please call from mini program client or pass data.openid in cloud test.'
            }
        }

        try {
            const userRes = await db.collection('users').where({ openid }).limit(1).get()
            const user = (userRes.data || [])[0]
            if (user && user.role === 'BANNED') {
                return { success: false, code: 'UNAUTHORIZED', msg: 'Unauthorized' }
            }
        } catch (e) {
            console.warn('progress user role check failed:', e)
        }

        let result
        switch (event.type) {
            case 'syncProgress':
                result = await syncProgress(openid, event.data)
                break
            case 'getStats':
                result = await getStats(openid)
                break
            case 'getAchievements':
                result = await getAchievements()
                break
            case 'getReviews':
                result = await getReviews(openid, event.data)
                break
            case 'getMistakes':
                result = await getMistakes(openid, event.data)
                break
            case 'getLearnedWords':
                result = await getLearnedWords(openid, event.data)
                break
            case 'getLeaderboard':
                result = await getLeaderboard(event.data)
                break
            case 'getSocialFeed':
                result = await getSocialFeed(openid, event.data)
                break
            default:
                result = { success: false, code: 'UNKNOWN_TYPE', msg: 'Unknown type' }
        }

        if (!result.code) {
            result.code = result.success ? 'OK' : 'PROGRESS_ERROR'
        }
        return result
    } catch (e) {
        console.error('progress main failed:', e)
        return { success: false, code: 'PROGRESS_MAIN_ERROR', msg: e.message }
    }
}

async function ensureAchievementsSeeded() {
    const res = await db.collection('achievements').get()
    const existing = res.data || []
    const existingIds = new Set(existing.map(item => item.id))

    const missing = DEFAULT_ACHIEVEMENTS.filter(item => !existingIds.has(item.id))
    for (const ach of missing) {
        await db.collection('achievements').add({ data: ach })
    }

    if (missing.length === 0) return existing
    const refreshed = await db.collection('achievements').get()
    return refreshed.data || DEFAULT_ACHIEVEMENTS
}

function getRankByVocab(vocabCount) {
    let current = RANKS[0]
    for (const rank of RANKS) {
        if (vocabCount >= rank.vocabRequired) {
            current = rank
        } else {
            break
        }
    }
    return current
}

function readArrayField(value) {
    if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean)
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed)) return parsed.map(v => String(v || '').trim()).filter(Boolean)
        } catch (e) {}
        return value.split(/[；;|]/).map(v => v.trim()).filter(Boolean)
    }
    return []
}

function cleanMeaningText(text) {
    return String(text || '')
        .replace(/^\s*(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|pron\.|conj\.|interj\.)\s*/i, '')
        .replace(/示意[:：]?\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function normalizeWordForRead(word) {
    if (!word) return { text: 'Unknown', meanings: [] }
    const meanings = readArrayField(word.meanings).map(cleanMeaningText).filter(Boolean)
    const examples = readArrayField(word.examples)
        .map(v => String(v || '').replace(/示意[:：]?\s*/gi, '').trim())
        .filter(Boolean)
    const phoneticDirect = word.phonetic || word.pronunciation || word.phoneticAm || word.phoneticBr || word.usphone || word.ukphone
    const phonetics = Array.isArray(word.phonetics) ? word.phonetics : []
    const phoneticFromList = (phonetics.find(item => item && typeof item.text === 'string' && item.text.trim()) || {}).text
    return {
        ...word,
        meanings,
        examples,
        phonetic: String(phoneticDirect || phoneticFromList || '').trim(),
        partOfSpeech: String(word.partOfSpeech || '').trim().toLowerCase() || 'n.'
    }
}

async function getUnlockedAchievementIds(openid) {
    const res = await db.collection('user_achievements').where({ openid }).get()
    return new Set((res.data || []).map(item => item.achievementId).filter(Boolean))
}

function toAchievementMap(list) {
    return list.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {})
}

function collectNewAchievementIds({ user, masteredCount, maxCombo, unlockedSet }) {
    const newIds = []

    const volumeMap = {
        vol_10: 10,
        vol_30: 30,
        vol_50: 50,
        vol_100: 100,
        vol_200: 200,
        vol_500: 500,
        vol_650: 650,
        vol_1000: 1000,
        vol_1300: 1300
    }
    Object.entries(volumeMap).forEach(([id, req]) => {
        if (masteredCount >= req && !unlockedSet.has(id)) newIds.push(id)
    })

    const streakMap = {
        cons_3: 3,
        cons_5: 5,
        cons_7: 7,
        cons_10: 10,
        cons_14: 14,
        cons_21: 21,
        cons_30: 30
    }
    Object.entries(streakMap).forEach(([id, req]) => {
        if ((user.streak || 0) >= req && !unlockedSet.has(id)) newIds.push(id)
    })

    if ((user.totalCorrect || 0) >= 1 && !unlockedSet.has('growth_1')) {
        newIds.push('growth_1')
    }
    const xpMap = { growth_xp_100: 100, growth_xp_1000: 1000 }
    Object.entries(xpMap).forEach(([id, req]) => {
        if ((user.xp || 0) >= req && !unlockedSet.has(id)) newIds.push(id)
    })

    const wealthMap = {
        wealth_50: 50,
        wealth_100: 100,
        wealth_500: 500,
        wealth_1000: 1000,
        wealth_5000: 5000
    }
    Object.entries(wealthMap).forEach(([id, req]) => {
        if ((user.coins || 0) >= req && !unlockedSet.has(id)) newIds.push(id)
    })

    const comboMap = { prec_5: 5, prec_10: 10, prec_20: 20, prec_30: 30, prec_50: 50 }
    Object.entries(comboMap).forEach(([id, req]) => {
        if ((maxCombo || 0) >= req && !unlockedSet.has(id)) newIds.push(id)
    })

    const hour = new Date().getHours()
    if (hour >= 0 && hour < 4 && !unlockedSet.has('spec_night')) newIds.push('spec_night')
    if (hour >= 5 && hour < 7 && !unlockedSet.has('spec_morning')) newIds.push('spec_morning')

    return [...new Set(newIds)]
}

function dayDiff(lastActive) {
    if (!lastActive) return null
    const raw = lastActive.toDate ? lastActive.toDate() : new Date(lastActive)
    if (!(raw instanceof Date) || Number.isNaN(raw.getTime())) return null
    const now = new Date()
    const a = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate())
    const b = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

async function syncProgress(openid, { wordId, status, xp, coins, maxCombo = 0 } = {}) {
    if (!wordId || typeof wordId !== 'string') {
        return { success: false, code: 'INVALID_WORD_ID', msg: 'Invalid wordId' }
    }
    const safeStatus = status === 'MASTERED' ? 'MASTERED' : 'LEARNING'
    const safeXp = Math.max(0, Math.min(Number(xp) || 0, 80))
    const safeCoins = Math.max(0, Math.min(Number(coins) || 0, 20))
    const safeMaxCombo = Number(maxCombo) || 0

    const recordRes = await db.collection('progress').where({ openid, wordId }).get()

    const existingRecord = recordRes.data[0]
    const currentMistakeCount = Number(existingRecord?.mistakeCount) || 0
    const nextMistakeCount = safeStatus === 'MASTERED' ? currentMistakeCount : currentMistakeCount + 1

    if (recordRes.data.length === 0) {
        await db.collection('progress').add({
            data: {
                openid,
                wordId,
                status: safeStatus,
                repetition: 1,
                mistakeCount: safeStatus === 'MASTERED' ? 0 : 1,
                learnedAt: db.serverDate(),
                lastReviewedAt: db.serverDate()
            }
        })
    } else {
        await db.collection('progress').where({ openid, wordId }).update({
            data: {
                status: safeStatus,
                repetition: _.inc(1),
                mistakeCount: nextMistakeCount,
                lastReviewedAt: db.serverDate()
            }
        })
    }

    const userRes = await db.collection('users').where({ openid }).get()
    let prevUser = userRes.data[0] || {}

    if (!prevUser.openid) {
        const initUser = {
            openid,
            username: '准备出发的小萌新',
            role: 'USER',
            avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            level: 1,
            xp: 0,
            coins: 0,
            streak: 0,
            totalCorrect: 0,
            isProfileSet: false,
            createdAt: db.serverDate(),
            targetCategory: 'GENERAL',
            lastActive: db.serverDate()
        }
        await db.collection('users').add({ data: initUser })
        prevUser = initUser
    }

    if (prevUser.role === 'BANNED') {
        return { success: false, code: 'UNAUTHORIZED', msg: 'Unauthorized' }
    }

    const prevXp = Number(prevUser.xp) || 0
    const prevCoins = Number(prevUser.coins) || 0
    const prevCorrect = Number(prevUser.totalCorrect) || 0
    const prevStreak = Number(prevUser.streak) || 0
    const prevMaxCombo = Number(prevUser.maxCombo) || 0

    const dd = dayDiff(prevUser.lastActive)
    let nextStreak = 1
    if (dd === 0) nextStreak = prevStreak || 1
    else if (dd === 1) nextStreak = Math.max(1, prevStreak + 1)

    const nextUser = {
        xp: prevXp + safeXp,
        coins: prevCoins + safeCoins,
        totalCorrect: prevCorrect + (safeStatus === 'MASTERED' ? 1 : 0),
        streak: nextStreak,
        maxCombo: Math.max(prevMaxCombo, safeMaxCombo),
        lastActive: db.serverDate()
    }

    const learnedCount = await db.collection('progress').where({ openid, status: 'MASTERED' }).count()
    const rank = getRankByVocab(learnedCount.total || 0)

    nextUser.level = rank.level
    nextUser.rankTitle = rank.title
    nextUser.rankIcon = rank.icon

    await db.collection('users').where({ openid }).update({ data: nextUser })

    const allAchievements = await ensureAchievementsSeeded()
    const achMap = toAchievementMap(allAchievements)
    const unlockedSet = await getUnlockedAchievementIds(openid)

    const mergedUser = {
        ...prevUser,
        ...nextUser
    }

    const newAchievementIds = collectNewAchievementIds({
        user: mergedUser,
        masteredCount: learnedCount.total || 0,
        maxCombo: nextUser.maxCombo,
        unlockedSet
    })

    for (const achievementId of newAchievementIds) {
        const existsRes = await db.collection('user_achievements')
            .where({ openid, achievementId })
            .limit(1)
            .get()

        if ((existsRes.data || []).length > 0) {
            unlockedSet.add(achievementId)
            continue
        }

        try {
            await db.collection('user_achievements').add({
                data: {
                    openid,
                    achievementId,
                    unlockedAt: db.serverDate()
                }
            })
            unlockedSet.add(achievementId)
        } catch (e) {
            console.warn('insert user_achievement failed:', achievementId, e)
        }
    }

    const allUnlocked = Array.from(unlockedSet).map(id => achMap[id]).filter(Boolean)
    const newlyUnlocked = newAchievementIds.map(id => achMap[id]).filter(Boolean)

    const updatedRes = await db.collection('users').where({ openid }).get()
    const updatedUser = updatedRes.data[0] || mergedUser

    return {
        success: true,
        data: {
            user: {
                ...updatedUser,
                totalLearned: learnedCount.total || 0,
                achievements: allUnlocked,
                id: updatedUser._id || updatedUser.id
            },
            leveledUp: (updatedUser.level || 1) > (prevUser.level || 1),
            achievements: newlyUnlocked
        }
    }
}

async function getStats(openid) {
    const userRes = await db.collection('users').where({ openid }).get()
    if (userRes.data.length === 0) return { success: false }

    const user = userRes.data[0]
    const learnedCount = await db.collection('progress').where({ openid, status: 'MASTERED' }).count()
    const rank = getRankByVocab(learnedCount.total || 0)

    const allAchievements = await ensureAchievementsSeeded()
    const achMap = toAchievementMap(allAchievements)
    const unlockedSet = await getUnlockedAchievementIds(openid)
    if (unlockedSet.size === 0) {
        try {
            await db.collection('user_achievements').add({
                data: {
                    openid,
                    achievementId: 'growth_first_use',
                    unlockedAt: db.serverDate()
                }
            })
            unlockedSet.add('growth_first_use')
        } catch (e) {
            console.warn('auto grant first-use achievement failed:', e)
        }
    }
    const unlocked = Array.from(unlockedSet).map(id => achMap[id]).filter(Boolean)

    return {
        success: true,
        data: {
            user: {
                ...user,
                level: rank.level,
                rankTitle: rank.title,
                rankIcon: rank.icon,
                totalLearned: learnedCount.total,
                achievements: unlocked,
                id: user._id || user.id
            },
            totalLearned: learnedCount.total
        }
    }
}

async function getAchievements() {
    const allAchievements = await ensureAchievementsSeeded()
    return {
        success: true,
        data: allAchievements
    }
}

async function getReviews(openid, { limit = 20 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50))

    const progressRes = await db.collection('progress')
        .where({
            openid
        })
        .orderBy('lastReviewedAt', 'asc')
        .limit(safeLimit)
        .get()

    const progressList = progressRes.data || []
    if (progressList.length === 0) {
        return { success: true, data: [] }
    }

    const wordIds = [...new Set(progressList.map(item => item.wordId).filter(Boolean))]
    if (wordIds.length === 0) {
        return { success: true, data: [] }
    }

    const wordsRes = await db.collection('words').where({
        _id: _.in(wordIds)
    }).get()

    const wordMap = wordsRes.data.reduce((acc, word) => {
        acc[word._id] = word
        return acc
    }, {})

    const result = progressList
        .map(item => wordMap[item.wordId])
        .filter(Boolean)

    return { success: true, data: result }
}

async function getMistakes(openid, { limit = 20 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50))
    const progressRes = await db.collection('progress')
        .where({
            openid,
            mistakeCount: _.gt(0)
        })
        .orderBy('mistakeCount', 'desc')
        .limit(safeLimit)
        .get()

    const progressList = progressRes.data || []
    if (progressList.length === 0) return { success: true, data: [] }

    const wordIds = [...new Set(progressList.map(item => item.wordId).filter(Boolean))]
    if (wordIds.length === 0) return { success: true, data: [] }

    const wordsRes = await db.collection('words').where({
        _id: _.in(wordIds)
    }).get()
    const wordMap = (wordsRes.data || []).reduce((acc, word) => {
        acc[word._id] = word
        return acc
    }, {})

    const result = progressList
        .map(item => {
            const word = normalizeWordForRead(wordMap[item.wordId])
            if (!word) return null
            return { ...word, _mistakeCount: Number(item.mistakeCount) || 0 }
        })
        .filter(Boolean)

    return { success: true, data: result }
}

async function getLearnedWords(openid, { page = 1, limit = 20, search = '' }) {
    const safePage = Math.max(1, Number(page) || 1)
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50))
    const skip = (safePage - 1) * safeLimit

    let wordIds = []
    let isFiltered = false

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
        status: _.neq('NEW')
    }

    if (isFiltered) {
        queryFilter.wordId = _.in(wordIds)
    }

    const progressRes = await db.collection('progress')
        .where(queryFilter)
        .orderBy('lastReviewedAt', 'desc')
        .skip(skip)
        .limit(safeLimit)
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
        word: normalizeWordForRead(wordMap[progress.wordId])
    }))

    const totalCount = await db.collection('progress').where(queryFilter).count()
    const totalPages = Math.max(1, Math.ceil(totalCount.total / safeLimit))

    return {
        success: true,
        data: result,
        lastPage: totalPages,
        total: totalCount.total
    }
}

async function getLeaderboard({ limit = 20 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100))
    const userRes = await db.collection('users')
        .where({
            role: _.neq('BANNED')
        })
        .orderBy('xp', 'desc')
        .limit(safeLimit)
        .get()

    const users = (userRes.data || []).map((u, idx) => ({
        id: u._id || u.id,
        username: u.username,
        avatar: u.avatar,
        level: Number(u.level) || 1,
        xp: Number(u.xp) || 0,
        rank: idx + 1
    }))

    return { success: true, data: users }
}

async function getSocialFeed(openid, { limit = 20 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50))
    const allAchievements = await ensureAchievementsSeeded()
    const achMap = toAchievementMap(allAchievements)

    const feedRes = await db.collection('user_achievements')
        .orderBy('unlockedAt', 'desc')
        .limit(safeLimit * 3)
        .get()

    const rows = feedRes.data || []
    if (rows.length === 0) return { success: true, data: [] }

    const dedupedRows = []
    const seen = new Set()
    for (const row of rows) {
        const key = `${row.openid || ''}::${row.achievementId || ''}`
        if (seen.has(key)) continue
        seen.add(key)
        dedupedRows.push(row)
    }

    const openids = [...new Set(dedupedRows.map(r => r.openid).filter(Boolean))].slice(0, 100)
    let userMap = {}

    if (openids.length > 0) {
        const usersRes = await db.collection('users').where({
            openid: _.in(openids)
        }).get()
        userMap = (usersRes.data || []).reduce((acc, u) => {
            acc[u.openid] = u
            return acc
        }, {})
    }

    const data = dedupedRows
        .map((row, idx) => {
            const user = userMap[row.openid]
            const ach = achMap[row.achievementId]
            if (!user || !ach || user.role === 'BANNED') return null
            return {
                id: row._id || `feed_${idx}`,
                username: user.username || 'User',
                title: ach.name || '解锁成就',
                timestamp: row.unlockedAt
            }
        })
        .filter(Boolean)
        .slice(0, safeLimit)

    return { success: true, data }
}
