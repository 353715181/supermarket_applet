// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const {orderId} = event
    console.log("查询售后申请详情",event)
    return await db.collection("applyService")
        .where({
        orderId:orderId
    }).get()
}
