// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();


// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log("退款回执消息", event)
    const openId = wxContext.OPENID
    // 退款金额（分） ，退款id，退款成功时间，订单号
    const {refundFee, refundId, successTime, outTradeNo, totalFee} = event
    //  查询订单详情
    const queryResult = await db.collection("order").where({
        orderNo: outTradeNo
    }).get()
    console.log("订单->{%s}查询结果", outTradeNo, queryResult)
    const result = queryResult.data[0]
    console.log(" 获取订单->{%s}数据", outTradeNo, result)
    const {isRefund} = result
    //防止重复调用
    if (isRefund === 1) {
        console.log(" 订单->{%s}已退款", outTradeNo)
        return {
            errcode: 0,
            errmsg: "回调成功"
        }
    }
    const _ = db.command
    // 回滚用户使用的虚拟币
    if (refundFee === totalFee && result.freePrice !== 0) {
        const goldNum = parseInt(result.freePrice * 100 + '')
        console.log("开始回滚用户->{%s}的果币数量->", openId, goldNum)
        var param = {}
        const usedGold = goldNum * -1
        param.goldNum = _.inc(goldNum)
        param.usedGold = _.inc(usedGold)
        console.log("开始更改用户->{%s}的数据库数据 param->", openId, param)
        const updateresp = await db.collection("userInfo").where({
            openId: openId
        }).update({
            data: {
                ...param
            }
        })
        console.log("用户->{%s}回滚结果->", openId, updateresp)
    } else {
        console.log("部分退款不需要回滚果币", result)
    }
    //回滚 分享人获得的虚拟币
    if (result && result.shareId) {
        const shareId = result.shareId
        var shareParam = {}
        var goldUpdateNum = parseInt(refundFee * 0.01 + "")
        var intransit = goldUpdateNum * -1
        shareParam.intransit = _.inc(intransit)
        console.log("开始修改分享人->%s 在途果币 ", shareId, goldUpdateNum)
        const updateShareResult = await db.collection("userInfo").where({
            openId: shareId
        }).update({
            data: {
                ...shareParam
            }
        })
        console.log("完成修改分享人->{%s}在途果币结果->", shareId, updateShareResult)
    } else {
        console.log("订单没有分享人", result)
    }
    console.log(" 开始修改订单退款状态")
    const updateRefund = await db.collection("order").where({
        orderNo: outTradeNo
    }).update({
        data: {
            isRefund: 1
        }
    })
    console.log(" 修改订单退款结果", updateRefund)
    return {
        errcode: 0, errmsg: "回调成功"
    }
}
