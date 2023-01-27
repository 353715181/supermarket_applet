// 云函数代码
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log("申请退款 wxContext", wxContext, event)
    const {orderNo, refundNo, payPrice, refundPrice} = event
    let len = 32
    let $chars =
        'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    let maxPos = $chars.length
    let pwd = ''
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    var temp={
        "functionName": "refundCallBack",
        "envId": wxContext.ENV,
        "sub_mch_id": "1605339160",
        "nonce_str": pwd,
        "out_refund_no": refundNo,
        "total_fee": parseInt((payPrice).toFixed(0)),
        "refund_fee": parseInt((refundPrice).toFixed(0)),
        "out_trade_no": orderNo,
    }
    console.log(" 参数格式",temp)

    const res = await cloud.cloudPay.refund({
        "functionName": "refundCallBack",
        "envId": wxContext.ENV,
        "sub_mch_id": "1605339160",
        "nonce_str": pwd,
        "out_refund_no": refundNo,
        "total_fee": parseInt((payPrice).toFixed(0)),
        "refund_fee": parseInt((refundPrice).toFixed(0)),
        "out_trade_no": orderNo,
    })
    console.log("申请退款返回结果", res)
    return res
}
