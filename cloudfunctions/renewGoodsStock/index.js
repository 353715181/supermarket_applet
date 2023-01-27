// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log("开始更新库存", event)
    const {operationType, goodsList} = event
    if (goodsList.length > 0) {
        const _ = db.command
        goodsList.map(async (goods) => {
            const result = await db.collection('goodsList').doc(goods._id)
                .update({
                    data: {
                        inventory: _.inc(goods.buyNum * operationType)
                    }
                });
            console.log("goodsId->%s的更新结果",
                goods._id, result
            )
        })
    }
    return 'success'
}
