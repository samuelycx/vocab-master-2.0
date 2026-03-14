const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-5gafz7hr13d79ef4' })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    switch (event.type) {
        case 'getSessionWords':
            return await getSessionWords(event.data)
        case 'searchWords':
            return await searchWords(event.data)
        default:
            return { success: false, msg: 'Unknown type' }
    }
}

async function getSessionWords({ count }) {
    const res = await db.collection('words')
        .aggregate()
        .sample({ size: count || 10 })
        .end()

    return { success: true, data: res.list }
}

async function searchWords({ query }) {
    if (!query || typeof query !== 'string') {
        return { success: true, data: [] };
    }

    try {
        const res = await db.collection('words')
            .where({
                text: db.RegExp({
                    regexp: String(query),
                    options: 'i',
                })
            })
            .get()

        return { success: true, data: res.data }
    } catch (e) {
        console.error('Search Words Error:', e)
        return { success: false, msg: e.message, data: [] }
    }
}
