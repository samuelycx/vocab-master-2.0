// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 创建 progress 集合（如果不存在）
    try {
      await db.createCollection('progress')
      console.log('创建 progress 集合成功')
    } catch (e) {
      if (e.errCode !== -502003) { // 集合已存在的错误码
        console.error('创建 progress 集合失败:', e)
      }
    }

    // 创建 study_records 集合（如果不存在）
    try {
      await db.createCollection('study_records')
      console.log('创建 study_records 集合成功')
    } catch (e) {
      if (e.errCode !== -502003) {
        console.error('创建 study_records 集合失败:', e)
      }
    }

    // 创建 achievements 集合（如果不存在）
    try {
      await db.createCollection('achievements')
      console.log('创建 achievements 集合成功')
    } catch (e) {
      if (e.errCode !== -502003) {
        console.error('创建 achievements 集合失败:', e)
      }
    }

    // 创建 user_achievements 集合（如果不存在）
    try {
      await db.createCollection('user_achievements')
      console.log('创建 user_achievements 集合成功')
    } catch (e) {
      if (e.errCode !== -502003) {
        console.error('创建 user_achievements 集合失败:', e)
      }
    }

    // 创建 social 集合（如果不存在）
    try {
      await db.createCollection('social')
      console.log('创建 social 集合成功')
    } catch (e) {
      if (e.errCode !== -502003) {
        console.error('创建 social 集合失败:', e)
      }
    }

    return {
      success: true,
      message: '数据库初始化完成'
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      error: error
    }
  }
}
