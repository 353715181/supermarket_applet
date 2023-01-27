// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const {num} = event
    // 查询
    const db = cloud.database()
    const $ = db.command.aggregate
    const _ = db.command
    var miniprogramState = ''
    if (wxContext.ENV === 'test-9gk2a9v0ee0aa199') {
        miniprogramState = 'developer'
    } else {
        miniprogramState = 'formal'
    }
    console.log(" 当前环境", wxContext.ENV, wxContext)
    //获取昨天的时间戳，getTime获取当前时间戳，24即24小时，60即60分钟，60即60秒，1000即计数单位
    var time = (new Date).getTime() - 24 * 60 * 60 * 1000 * 3;
    //获取time传入 Date 日期对象转换为字符串，如"2020/8/4"
    var day = new Date(time).toLocaleDateString();

    const shareInfo = await db.collection('order').aggregate()
        .match({
            finishDeliveryTime: _.lte(time),
            isPrize: _.eq(0),
            state: _.eq(6)
        })
        .group({
            _id: '$shareId',
            sumPrice: $.sum('$payPrice')
        })
        .limit(9999)
        .end()
    console.log("查询到的符合条件的用户信息", shareInfo)
    if (shareInfo.list.length > 0 ) {
        shareInfo.list.map(async (share) => {
            // 待更新的果币数量
            const shareId = share._id
            var goldNum = share.sumPrice
            goldNum = parseInt(goldNum + '')
            console.log(" 开始更新shareId->%s的在途果币goldNum->", shareId, goldNum)
            const updateResp = await db.collection('userInfo')
                .where({
                    openId: _.eq(share._id),
                    intransit: _.gte(goldNum)
                })
                .update({
                    data: {
                        intransit: _.inc(-goldNum),
                        goldNum: _.inc(goldNum),
                        updateTime: new Date()
                    }
                })
            console.log("share->{%o} 果币数量更新结果->%o", share, updateResp)
            if (updateResp.stats.updated > 0) {
                const updateResp = await db.collection("order").where({
                    finishDeliveryTime: _.lte(time),
                    isPrize: _.eq(0),
                    state: _.eq(6),
                    shareId: _.eq(shareId)
                })
                    .update({
                        data: {
                            isPrize: 1,
                            updateTime: new Date()
                        }
                    })
                console.log("shareId->%s的订单状态更新完毕,resp->%o", shareId, updateResp)


                console.log(" 分享人在途果币数量更新完毕", updateResp)
                // try {
                //     console.log("开始通知分享人->%s在途果币到账", shareId, goldNum, parseInt(goldNum + ""), miniprogramState)
                //     const result = await cloud.openapi.subscribeMessage.send({
                //         touser: shareId, // 通过 getWXContext 获取 OPENID
                //         page: 'pages/user/user',
                //         data: {
                //             phrase2: {
                //                 value: '到账果币'
                //             },
                //             number3: {
                //                 value: parseInt(goldNum + "")
                //             },
                //             thing4: {
                //                 value: '到账果币可以抵扣哦,快去使用吧'
                //             }
                //         },
                //         templateId: 'jpzey63z50Q6vwVe2lrplqXUKferRKMzanmU74RbrqE',
                //         miniprogramState: 'developer'
                //     })
                //     console.log("订单消息发送结果", result)
                // } catch
                //     (err) {
                //     console.log("模板消息发送失败", err)
                // }


            } else {
                console.error("shareId->%s订单状态更新失败", shareId)
            }
        })
    }
    console.log("转化后的时间", time)
    return "success"
}
