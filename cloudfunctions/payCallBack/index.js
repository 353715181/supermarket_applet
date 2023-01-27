// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log("支付回调结果", event)
    var miniprogramState = ''
    if (wxContext.ENV === 'test-9gk2a9v0ee0aa199') {
        miniprogramState = 'developer'
    } else {
        miniprogramState = 'formal'
    }
    var {attach, transactionId, totalFee, outTradeNo, returnCode} = event
    // 修改订单状态
    const updateResult = await db.collection("order").where({
        orderNo: outTradeNo
    }).update({
        data: {
            state: 2,
            stateName: "支付成功,商家待接单",
            transactionId: transactionId,
            payDate: new Date(),
            updateTime: new Date()
        }
    })
    console.log(" 订单数据更新结果", updateResult)
    attach = JSON.parse(attach)
    console.log(" 准备更新分享人在途果币数量", attach, attach && attach.shareOpenId)
    if (attach && attach.shareOpenId) {
        var intransit = totalFee * 0.01
        console.log(" 开始更新分享人->%s在途果币数量", attach.shareOpenId, intransit)
        try {
            const res = await cloud.callFunction({
                // 要调用的云函数名称
                name: 'updateUserInfo',
                // 传递给云函数的参数
                data: {
                    openId: attach.shareOpenId,
                    intransit: intransit,
                }
            })
            console.log(" 分享人在途果币数量更新完毕", res)
        } catch (e) {
            console.error(" 分享人在途果币数量更新异常" ,e)
        }

        if (intransit.toFixed(0) > 0) {
            try {
                console.log("开始通知分享人->%s在途果币到账", attach.shareOpenId, intransit)
                const result = await cloud.openapi.subscribeMessage.send({
                    touser: attach.shareOpenId, // 通过 getWXContext 获取 OPENID
                    page: 'pages/user/user',
                    data: {
                        phrase2: {
                            value: '在途果币'
                        },
                        number3: {
                            value: parseInt(intransit + "")
                        },
                        thing4: {
                            value: '受邀用户收货3天内不取消订单将自动到账'
                        }
                    },
                    templateId: 'jpzey63z50Q6vwVe2lrplqXUKferRKMzanmU74RbrqE',
                    miniprogramState: miniprogramState
                })
                console.log("订单消息发送结果", result)
            } catch (err) {
                console.log("模板消息发送失败", err)
            }
        }
    }
// 增加分享人在途果币
    return {
        errcode: 0, errmsg: "回调成功"
    }
}
