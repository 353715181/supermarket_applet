// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();


// 云函数入口函数
exports.main = async (event, context) => {
  console.log("准备查询管理员信息", event)
  const { phone } = event
  const wxContext = cloud.getWXContext()
  const result = await db.collection("management").where({
    phone: phone
  }).get()
  console.log("查询结果", result)
  return result
}