const cloud = require('wx-server-sdk')
const https = require('https')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    try {
        const { OPENID } = cloud.getWXContext()
        const testOpenid = event && event.data && event.data.openid
        const openid = OPENID || testOpenid
        
        const userRes = await db.collection('users').where({ openid }).get()
        const user = userRes.data[0]
        
        if (!user || user.role !== 'ADMIN') {
            return { success: false, code: 'UNAUTHORIZED', msg: 'Unauthorized' }
        }

        let result
        switch (event.type) {
            case 'createWord':
                result = await createWord(event.data)
                break
            case 'getUsers':
                result = await getUsers()
                break
            case 'banUser':
                result = await banUser(event.data)
                break
            case 'setCategory':
                result = await setCategory(event.data)
                break
            case 'toggleModule':
                result = await toggleModule(event.data)
                break
            case 'normalizeWords':
                result = await normalizeWords(event.data)
                break
            case 'fillPhonetics':
                result = await fillPhonetics(event.data)
                break
            default:
                result = { success: false, code: 'UNKNOWN_TYPE', msg: 'Unknown type' }
        }
        if (!result.code) {
            result.code = result.success ? 'OK' : 'ADMIN_ERROR'
        }
        return result
    } catch (e) {
        console.error('admin main failed:', e)
        return { success: false, code: 'ADMIN_MAIN_ERROR', msg: e.message }
    }
}

async function createWord({ text, partOfSpeech, meanings, examples, category }) {
    try {
        const safeText = String(text || '').trim()
        const safePos = String(partOfSpeech || '').trim().toLowerCase() || 'n.'
        const safeCategory = String(category || 'GENERAL').trim().toUpperCase() || 'GENERAL'
        const safeMeanings = parseArrayField(meanings).map(cleanMeaning).filter(Boolean).slice(0, 20)
        const safeExamples = parseArrayField(examples).map(item => cleanExample(item, safeText)).filter(Boolean).slice(0, 20)

        if (!safeText || safeMeanings.length === 0) {
            return { success: false, msg: 'Invalid payload' }
        }

        await db.collection('words').add({
            data: {
                text: safeText,
                partOfSpeech: safePos,
                meanings: safeMeanings,
                examples: safeExamples,
                category: safeCategory,
                createdAt: db.serverDate()
            }
        })
        return { success: true }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

async function getUsers() {
    try {
        const res = await db.collection('users').limit(100).get()
        return { success: true, data: res.data }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

async function banUser({ userId }) {
    try {
        const userRes = await db.collection('users').doc(userId).get()
        const user = userRes.data
        const newRole = user.role === 'BANNED' ? 'USER' : 'BANNED'
        
        await db.collection('users').doc(userId).update({
            data: { role: newRole }
        })
        return { success: true }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

async function setCategory({ userId, category }) {
    try {
        const safeCategory = String(category || '').trim().toUpperCase()
        if (!userId || !safeCategory) {
            return { success: false, msg: 'Invalid payload' }
        }
        await db.collection('users').doc(userId).update({
            data: { targetCategory: safeCategory }
        })
        return { success: true }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

async function toggleModule({ key, enabled }) {
    try {
        const safeKey = String(key || '').trim()
        const allowedKeys = new Set(['pk_arena_enabled'])
        if (!allowedKeys.has(safeKey)) {
            return { success: false, msg: 'Invalid module key' }
        }

        const configRes = await db.collection('system').where({ key: 'modules' }).get()
        if (configRes.data.length === 0) {
            await db.collection('system').add({
                data: {
                    key: 'modules',
                    [safeKey]: !!enabled,
                    updatedAt: db.serverDate()
                }
            })
        } else {
            await db.collection('system').doc(configRes.data[0]._id).update({
                data: {
                    [safeKey]: !!enabled,
                    updatedAt: db.serverDate()
                }
            })
        }
        return { success: true }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

function uniq(list) {
    return [...new Set(list.filter(Boolean))]
}

function normalizePos(pos, meanings) {
    const source = String(pos || '').trim().toLowerCase()
    const raw = source || String((Array.isArray(meanings) && meanings[0]) || '').trim().toLowerCase()
    if (/^n\./.test(raw)) return 'n.'
    if (/^(v\.|vi\.|vt\.)/.test(raw)) return 'v.'
    if (/^adj\./.test(raw)) return 'adj.'
    if (/^adv\./.test(raw)) return 'adv.'
    if (/^prep\./.test(raw)) return 'prep.'
    if (/^pron\./.test(raw)) return 'pron.'
    if (/^conj\./.test(raw)) return 'conj.'
    if (/^interj\./.test(raw)) return 'interj.'
    return source || 'n.'
}

function parseArrayField(value) {
    if (Array.isArray(value)) return value.map(v => String(v || '').trim())
    if (typeof value !== 'string') return []
    const raw = value.trim()
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(v => String(v || '').trim())
    } catch (e) {}
    const byLine = raw.split(/\r?\n/).map(v => v.trim()).filter(Boolean)
    if (byLine.length > 1) return byLine
    return raw.split(/[；;|]/).map(v => v.trim()).filter(Boolean)
}

function cleanMeaning(text) {
    return String(text || '')
        .replace(/^\s*(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|pron\.|conj\.|interj\.)\s*/i, '')
        .replace(/示意[:：]?\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function cleanExample(text, word) {
    let result = String(text || '')
        .replace(/示意[:：]?\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    // Replace obvious placeholder token with real word when possible.
    if (word) {
        result = result.replace(/______/g, word)
    }
    return result
}

function normalizePhonetic(p) {
    const text = String(p || '').trim()
    if (!text || text === '//' || text === '/') return ''
    if (text.startsWith('/') && text.endsWith('/')) return text
    return text
}

function pickPhoneticFromDoc(doc) {
    const direct = doc?.phonetic || doc?.pronunciation || doc?.phoneticAm || doc?.phoneticBr || doc?.usphone || doc?.ukphone
    const normalized = normalizePhonetic(direct)
    if (normalized) return normalized
    const phonetics = Array.isArray(doc?.phonetics) ? doc.phonetics : []
    const hit = phonetics.find(item => item && typeof item.text === 'string' && item.text.trim())
    return normalizePhonetic(hit && hit.text)
}

function normalizeWordDoc(doc) {
    const text = String(doc.text || '').trim()
    const meaningsRaw = parseArrayField(doc.meanings)
    const examplesRaw = parseArrayField(doc.examples)

    const meanings = uniq(meaningsRaw.map(cleanMeaning))
    const examples = uniq(examplesRaw.map(ex => cleanExample(ex, text)))
    const partOfSpeech = normalizePos(doc.partOfSpeech, meaningsRaw)
    const phonetic = pickPhoneticFromDoc(doc)

    return {
        text,
        partOfSpeech,
        meanings,
        examples,
        phonetic
    }
}

async function normalizeWords({ limit = 2000 } = {}) {
    try {
        const safeLimit = Math.min(Math.max(Number(limit) || 2000, 1), 5000)
        const res = await db.collection('words').limit(safeLimit).get()
        const rows = res.data || []

        let updated = 0
        for (const row of rows) {
            const normalized = normalizeWordDoc(row)
            const shouldUpdate =
                normalized.text !== String(row.text || '').trim() ||
                normalized.partOfSpeech !== String(row.partOfSpeech || '').trim().toLowerCase() ||
                JSON.stringify(normalized.meanings) !== JSON.stringify(parseArrayField(row.meanings)) ||
                JSON.stringify(normalized.examples) !== JSON.stringify(parseArrayField(row.examples)) ||
                normalized.phonetic !== pickPhoneticFromDoc(row)

            if (!shouldUpdate) continue

            await db.collection('words').doc(row._id).update({
                data: {
                    text: normalized.text,
                    partOfSpeech: normalized.partOfSpeech,
                    meanings: normalized.meanings,
                    examples: normalized.examples,
                    phonetic: normalized.phonetic,
                    normalizedAt: db.serverDate()
                }
            })
            updated++
        }

        return { success: true, total: rows.length, updated }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function fetchJson(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let raw = ''
            res.on('data', (chunk) => { raw += chunk })
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(raw)
                    resolve(parsed)
                } catch (e) {
                    resolve(null)
                }
            })
        }).on('error', () => resolve(null))
    })
}

function pickPhoneticFromApi(payload) {
    if (!Array.isArray(payload)) return ''
    for (const entry of payload) {
        const phonetics = Array.isArray(entry?.phonetics) ? entry.phonetics : []
        const hit = phonetics.find(p => p && typeof p.text === 'string' && p.text.trim())
        if (hit && hit.text) return String(hit.text).trim()
    }
    return ''
}

async function fillPhonetics({ limit = 500 } = {}) {
    try {
        const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 2000)
        const res = await db.collection('words').limit(safeLimit).get()
        const rows = res.data || []
        let updated = 0

        for (const row of rows) {
            const existing = pickPhoneticFromDoc(row)
            if (existing) continue

            const wordText = String(row.text || '').trim()
            if (!wordText) continue

            const apiRes = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordText)}`)
            const phonetic = normalizePhonetic(pickPhoneticFromApi(apiRes))
            if (!phonetic) {
                await sleep(120)
                continue
            }

            await db.collection('words').doc(row._id).update({
                data: {
                    phonetic,
                    phoneticUpdatedAt: db.serverDate()
                }
            })
            updated++
            await sleep(120)
        }

        return { success: true, total: rows.length, updated }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}
