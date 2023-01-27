// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    console.log(" 开始修改商品信息", event)
    const {param} = event
    return await db.collection("goodsList")
        .doc(param._id)
        .update({
            data: {
                goodsName: param.goodsName,
                tagName: param.tagName,
                originPrice: param.originPrice != null ? param.originPrice : '',
                price: parseFloat(param.price),
                inventory: parseInt(param.inventory),
                maxBuy: parseInt(param.maxBuy),
                costPrice: parseFloat(param.costPrice),
                categoryName: param.categoryName,
                categoryId: param.categoryId,
                discount: parseFloat(param.discount),
                fileId: param.fileId,
                imgUrl: param.imgUrl,
                isSale: param.isSale,
                updateTime: new Date().getTime()
            }
        })
}
