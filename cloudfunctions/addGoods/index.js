// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("添加商品", wxContext)
  console.log("event数据", event)
  const {categoryId,categoryName,describe,fileId,goodsName,imgUrl,inventory,isSale,originPrice,price,saleNum,tagName}=event
  const resp= await db.collection("goodsList").add({
      data:{
        categoryId:categoryId,
        categoryName:categoryName,
        describe:describe,
        fileId:fileId,
        goodsName:goodsName,
        imgUrl:imgUrl,
        inventory:inventory,
        isSale:isSale,
        originPrice:originPrice,
        price:price,
        saleNum:saleNum,
        tagName:tagName,
        createTime:new Date().getTime
      }
  })
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    data: resp
  }
}
