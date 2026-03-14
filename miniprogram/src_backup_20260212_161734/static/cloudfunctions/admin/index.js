const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-5gafz7hr13d79ef4' })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    
    const userRes = await db.collection('users').where({ openid: OPENID }).get()
    const user = userRes.data[0]
    
    if (!user || user.role !== 'ADMIN') {
        return { success: false, msg: 'Unauthorized' }
    }

    switch (event.type) {
        case 'createWord':
            return await createWord(event.data)
        case 'getUsers':
            return await getUsers()
        case 'banUser':
            return await banUser(event.data)
        case 'setCategory':
            return await setCategory(event.data)
        case 'toggleModule':
            return await toggleModule(event.data)
        default:
            return { success: false, msg: 'Unknown type' }
    }
}

async function createWord({ text, partOfSpeech, meanings, examples, category }) {
    try {
        await db.collection('words').add({
            data: {
                text,
                partOfSpeech,
                meanings,
                examples,
                category: category || 'GENERAL',
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
        await db.collection('users').doc(userId).update({
            data: { targetCategory: category }
        })
        return { success: true }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}

async function toggleModule({ key, enabled }) {
    try {
        const configRes = await db.collection('system').where({ key: 'modules' }).get()
        if (configRes.data.length === 0) {
            await db.collection('system').add({
                data: {
                    key: 'modules',
                    [key]: enabled,
                    updatedAt: db.serverDate()
                }
            })
        } else {
            await db.collection('system').doc(configRes.data[0]._id).update({
                data: {
                    [key]: enabled,
                    updatedAt: db.serverDate()
                }
            })
        }
        return { success: true }
    } catch (e) {
        return { success: false, msg: e.message }
    }
}
