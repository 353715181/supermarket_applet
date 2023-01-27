// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("查询请求参数", wxContext)
  console.log("event数据", event)
  var { collectionName, pageSize, skipNum, goodsName, categoryId, isSale, orderBy, desc } = event;
  if (!pageSize) {
    pageSize = 10;
  }
  if (!skipNum) {
    skipNum = 0;
  }
  if (!orderBy) {
    orderBy = 'crateTime'
  }
  // 1生序 2降序
  if (desc === 1) {
    desc = 'asc'
  } else {
    desc = 'desc'
  }
  let temp = db.collection(collectionName);
  // 是否在售
  if (isSale) {
    temp = temp.where({
      isSale: isSale
    })
  }
  // 分类id
  if (categoryId) {
    temp = temp.where({
      categoryId: categoryId
    })
  }
  // 商品名称
  if (goodsName) {
    temp = temp.where({
      goodsName: db.RegExp({regexp: "ddd",options: 'i',})
    })
  }
  console.log(' sql',temp)
  // 是否在售 分类id 商品名称
  return await temp
    .orderBy(orderBy, desc)
    .skip(skipNum)
    .limit(pageSize)
    .get();


}