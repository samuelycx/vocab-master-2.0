const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-5gafz7hr13d79ef4' })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    switch (event.type) {
        case 'login':
            return await login(openid)
        case 'updateProfile':
            return await updateProfile(openid, { ...event.data, isProfileSet: true })
        default:
            return { success: false, msg: 'Unknown type' }
    }
}

async function login(openid) {
    const userRes = await db.collection('users').where({ openid }).get()

    if (userRes.data.length === 0) {
        // Register new user with placeholders
        const newUser = {
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
            targetCategory: 'GENERAL'
        }
        const addRes = await db.collection('users').add({ data: newUser })
        const savedUser = { ...newUser, id: addRes._id || addRes.id }
        return { success: true, data: savedUser }
    }

    const existingUser = userRes.data[0]
    return { success: true, data: { ...existingUser, id: existingUser._id || existingUser.id } }
}

async function updateProfile(openid, data) {
    await db.collection('users').where({ openid }).update({ data })
    return { success: true }
}
