// 云函数代码
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log("微信支付 wxContext->{%o},event->{%o}", wxContext, event)
    var {orderNo, attach, payPrice} = event
    let len = 32
    let $chars =
        'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    let maxPos = $chars.length
    let pwd = ''
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    const spbillCreateIp = wxContext.CLIENTIP === '' ? wxContext.CLIENTIPV6 : wxContext.CLIENTIP
    console.log("用户IP",spbillCreateIp)
    payPrice = parseFloat((payPrice * 100).toFixed(1))
    const res = await cloud.cloudPay.unifiedOrder({
        "functionName": "payCallBack",
        "envId": wxContext.ENV,
        "subMchId": "1605339160",
        "nonceStr": pwd,
        "outTradeNo": orderNo,
        "totalFee": payPrice,
        "spbillCreateIp": spbillCreateIp,
        "tradeType": "JSAPI",
        "body": "商超-生鲜生活用品",
        "attach": JSON.stringify(attach)
    })
    console.log("支付返回结果", res)
    return res
}
