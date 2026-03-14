const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    try {
        const wxContext = cloud.getWXContext()
        const openid = wxContext.OPENID || (event && event.data && event.data.openid)

        if (!openid) {
            return {
                success: false,
                code: 'MISSING_OPENID',
                msg: 'Missing OPENID. Please call from mini program client or pass data.openid in cloud test.'
            }
        }

        let result
        switch (event.type) {
            case 'login':
                result = await login(openid, event.data || {})
                break
            case 'updateProfile':
                result = await updateProfile(openid, { ...event.data, isProfileSet: true })
                break
            default:
                result = { success: false, code: 'UNKNOWN_TYPE', msg: 'Unknown type' }
        }

        if (!result.code) {
            result.code = result.success ? 'OK' : 'AUTH_ERROR'
        }
        return result
    } catch (e) {
        console.error('auth main failed:', e)
        return { success: false, code: 'AUTH_MAIN_ERROR', msg: e.message }
    }
}

async function login(openid, data = {}) {
    const userRes = await db.collection('users').where({ openid }).get()
    
    // 获取设备信息
    const deviceInfo = data && data.deviceInfo ? data.deviceInfo : null
    const deviceId = deviceInfo ? `${deviceInfo.model}_${deviceInfo.system}` : null

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
            targetCategory: 'GENERAL',
            // 设备绑定
            deviceId: deviceId,
            deviceBindTime: deviceId ? db.serverDate() : null
        }
        const addRes = await db.collection('users').add({ data: newUser })

        // 首次使用自动解锁一个基础成就，避免成就墙初始为空
        try {
            await db.collection('user_achievements').add({
                data: {
                    openid,
                    achievementId: 'growth_first_use',
                    unlockedAt: db.serverDate()
                }
            })
        } catch (e) {
            console.warn('init first-use achievement failed:', e)
        }

        const savedUser = { ...newUser, id: addRes._id || addRes.id }
        return { success: true, data: savedUser }
    }

    const existingUser = userRes.data[0]

    if (existingUser.role === 'BANNED') {
        return {
            success: false,
            code: 'USER_BANNED',
            msg: '账号已被封禁，请联系管理员'
        }
    }
    
    // 检查设备绑定
    if (existingUser.deviceId && deviceId && existingUser.deviceId !== deviceId) {
        // 设备不匹配，拒绝登录
        return {
            success: false,
            code: 'DEVICE_MISMATCH',
            msg: '此账号已在其他设备绑定，如需更换设备请联系家长'
        }
    }
    
    // 首次绑定设备或设备匹配
    if (!existingUser.deviceId && deviceId) {
        await db.collection('users').where({ openid }).update({
            data: {
                deviceId: deviceId,
                deviceBindTime: db.serverDate()
            }
        })
        existingUser.deviceId = deviceId
        existingUser.deviceBindTime = new Date()
    }
    
    return { success: true, data: { ...existingUser, id: existingUser._id || existingUser.id } }
}

async function updateProfile(openid, data) {
    const payload = data || {}
    const safeData = {
        isProfileSet: true
    }
    if (typeof payload.username === 'string') {
        const normalized = payload.username.trim().slice(0, 24)
        if (normalized) {
            safeData.username = normalized
        }
    }
    if (typeof payload.avatar === 'string') {
        safeData.avatar = payload.avatar.trim().slice(0, 512)
    }
    await db.collection('users').where({ openid }).update({ data: safeData })
    return { success: true }
}
