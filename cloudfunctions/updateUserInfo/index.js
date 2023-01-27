// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log(" 修改用户信息", event)
    var {openId, shareNum, intransit, goldNum, usedGold, phone} = event
    // 没有openId时默认为本人
    if (!openId) {
        openId = wxContext.OPENID
    }
    let param = {};
    // 分享数量
    const _ = db.command
    if (shareNum) {
        shareNum = parseInt(shareNum)
        param.shareNum = _.inc(1)
    }
    // 在途果币数量
    if (intransit) {
        intransit = parseInt(intransit)
        console.log("在途果币数量", intransit)
        param.intransit = _.inc(intransit)
    }
    // 可用果币数量
    if (goldNum) {
        goldNum = parseInt(goldNum)
        param.goldNum = _.inc(goldNum)
    }
    // 已使用数量
    if (usedGold) {
        usedGold = parseInt(usedGold)
        param.usedGold = _.inc(usedGold)
    }
    //用户手机号
    if (phone) {
        param.phone = phone
    }
    param.updateTime = new Date()
    console.log("准备更新 用户->{%o}的用户信息", param)
    const updateresp = await db.collection("userInfo").where({
        openId: openId
    }).update({
        data: {
            ...param
        }
    })
    console.log("用户->{%s}的修改结果->{%o}", openId, updateresp)
    if (updateresp.stats.updated === 0 ) {
            param.openId = openId
            param.createTime = new Date()
        if (shareNum > 0) {
            param.shareNum = 1
        }
        const addresp = await db.collection("userInfo").add({
            data: {
                ...param
            }
        })
        console.log("用户->{%s}的添加结果->{%o}", openId, addresp)
        return addresp
    } else {
        return updateresp
    }

}
