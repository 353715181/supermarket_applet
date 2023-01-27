// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const {orderId, handleData} = event
    console.log("开始修改售后申请内容", orderId,handleData)
    const updateResult = await db.collection("applyService")
        .where({
            orderId: orderId
        })
        .update({
            data: {
                ...handleData
            }
        })
    console.log(" 修改结果", updateResult)
    return updateResult
}
