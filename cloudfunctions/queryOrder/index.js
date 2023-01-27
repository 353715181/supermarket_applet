// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();


// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const {level, orderState, index, pageSize} = event
    console.log("查询订单", event)
    const result = await db.collection("order")
        .where({
            removed: 0,
            state: orderState
        })
        .orderBy("sendTime", orderState === 6 ? 'desc' : 'asc')
        .orderBy("createTimes", orderState === 6 ? 'desc' : 'asc')
        .skip(index)
        .limit(pageSize)
        .get()
    const $ = db.command.aggregate
    const count = await db.collection("order")
        .aggregate()
        .match({
            removed: 0
        })
        .group({
            _id: '$state',
            count: $.sum(1)
        }).end()
    console.log("状态统计结果", count)
    return {data: result.data, countMap: count.list};
}
