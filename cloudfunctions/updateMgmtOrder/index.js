// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const {id, order} = event
    console.log("入参", event)
    var miniprogramState=''
    if (wxContext.ENV==='test-9gk2a9v0ee0aa199'){
        miniprogramState='developer'
    }else {
        miniprogramState='formal'
    }
    if (order.state === 5) {
        try {
            const result = await cloud.openapi.subscribeMessage.send({
                touser: openId, // 通过 getWXContext 获取 OPENID
                page: 'pages/orderDetail/orderDetail?id=' + id,
                data: {
                    character_string6: {
                        value: order.orderNo
                    },
                    phone_number5: {
                        value: order.startDeliveryPhone
                    },
                    thing1: {
                        value: order.stateName
                    }
                },
                templateId: 'Rb6cyQ-NFD9iOvEzjXwaWGSb2nDoilkTOsVCICmQmQ8',
                miniprogramState: miniprogramState
            })
            console.log("订单消息发送结果", result)
        } catch (err) {
            console.log("模板消息发送失败", err)
        }
    }
    return await db.collection("order")
        .doc(id)
        .update({
            data: {
                ...order
            }
        })
}
