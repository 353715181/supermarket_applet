// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(" 查询用户信息",wxContext,cloud.DYNAMIC_CURRENT_ENV)
  const resp= await db.collection("userInfo").where({
    openId:wxContext.OPENID
  }).get()
  console.log(" 查询结果",resp)
  return resp.data
}
