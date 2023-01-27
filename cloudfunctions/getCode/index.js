// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const {openId} = event
    // 获取小程序码，A接口

    try {
        const result = await cloud.openapi.wxacode.get({
            path: '/pages/index/index?shareId=' + openId,
            width: 430
        })
        console.log(" 二维码上传结果", result.buffer, openId)
        return await cloud.uploadFile({
            cloudPath: 'code/' + openId + '.png',
            fileContent: result.buffer
        })
    } catch (err) {
        return err
    }
}
