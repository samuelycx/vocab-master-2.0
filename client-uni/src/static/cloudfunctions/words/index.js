const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toArrayField(value) {
    if (Array.isArray(value)) {
        return value.map(v => String(v || '').trim()).filter(Boolean)
    }
    if (typeof value !== 'string') return []
    const raw = value.trim()
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return parsed.map(v => String(v || '').trim()).filter(Boolean)
        }
    } catch (e) {}
    return raw.split(/[；;|]/).map(v => v.trim()).filter(Boolean)
}

function pickPhonetic(word) {
    const direct = word?.phonetic
        || word?.pronunciation
        || word?.phoneticAm
        || word?.phoneticBr
        || word?.usphone
        || word?.ukphone
    if (direct && String(direct).trim()) return String(direct).trim()

    const phonetics = Array.isArray(word?.phonetics) ? word.phonetics : []
    const hit = phonetics.find(item => item && typeof item.text === 'string' && item.text.trim())
    return hit && hit.text ? String(hit.text).trim() : ''
}

function normalizeWord(word) {
    const text = String(word?.text || '').trim()
    const meanings = toArrayField(word?.meanings)
    const examples = toArrayField(word?.examples)
    const phonetic = pickPhonetic(word)
    return {
        ...word,
        text,
        meanings,
        examples,
        phonetic
    }
}

exports.main = async (event, context) => {
    try {
        let result
        switch (event.type) {
            case 'getSessionWords':
                result = await getSessionWords(event.data)
                break
            case 'searchWords':
                result = await searchWords(event.data)
                break
            default:
                result = { success: false, code: 'UNKNOWN_TYPE', msg: 'Unknown type' }
        }
        if (!result.code) {
            result.code = result.success ? 'OK' : 'WORDS_ERROR'
        }
        return result
    } catch (e) {
        console.error('words main failed:', e)
        return { success: false, code: 'WORDS_MAIN_ERROR', msg: e.message, data: [] }
    }
}

async function getSessionWords({ count } = {}) {
    const safeCount = Math.max(1, Math.min(Number(count) || 10, 100))
    const res = await db.collection('words')
        .aggregate()
        .sample({ size: Math.min(500, safeCount * 5) })
        .end()

    const words = (res.list || [])
        .map(normalizeWord)
        .filter(w => w.text && Array.isArray(w.meanings) && w.meanings.length > 0)
        .slice(0, safeCount)

    return { success: true, data: words }
}

async function searchWords({ query } = {}) {
    if (!query || typeof query !== 'string') {
        return { success: true, data: [] };
    }

    try {
        const normalizedQuery = String(query).trim().slice(0, 64)
        if (!normalizedQuery) {
            return { success: true, data: [] }
        }

        const res = await db.collection('words')
            .where({
                text: db.RegExp({
                    regexp: escapeRegExp(normalizedQuery),
                    options: 'i',
                })
            })
            .limit(50)
            .get()

        return { success: true, data: res.data }
    } catch (e) {
        console.error('Search Words Error:', e)
        return { success: false, code: 'SEARCH_FAILED', msg: e.message, data: [] }
    }
}
