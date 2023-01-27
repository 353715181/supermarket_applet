// 云函数代码
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("查询微信订单状态 wxContext->{%o},event->{%o}",wxContext,event)
  const {orderNo}=event
  let len = 32
  let $chars =
    'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' 
  let maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }

  const res = await cloud.cloudPay.queryOrder({
    "sub_mch_id" : "1605339160",
    "out_trade_no" : orderNo,
    "nonce_str" : pwd
  })
  console.log("返回结果",res)
  return res
}
