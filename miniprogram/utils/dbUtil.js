const db = wx.cloud.database();

/**
 *  获取所有问题数据
 * @param {*} params 集合名
 */
export const getAllQuestionData = (params) => {
    const collection = db.collection(params);
    return new Promise((resolve, reject) => {
        collection.orderBy('num', 'asc').get({
            success: (result) => {
                console.log(result);
                resolve(result.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}
/**
 *  获取集合的所有数据
 * @param {*} params 集合名
 */
export const getAllData = (params) => {
    const collection = db.collection(params);
    return new Promise((resolve, reject) => {
        collection.get({
            success: (result) => {
                console.log(result);
                resolve(result.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  获取集合的所有数据
 * @param {*} params 集合名
 */
export const getAllCategory = () => {
    const collection = db.collection("category");
    return new Promise((resolve, reject) => {
        collection.orderBy("num", "asc").get({
            success: (result) => {
                console.log(result);
                resolve(result.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    })
}

/**
 *  获取集合的分页数据
 * @param {*} params 集合名,目标页,页面数据量
 */
export const getPageData = (params) => {
    console.log(params)
    const collectionName = params.collectionName;
    const skipNum = params.skipNum;
    const pageSize = params.pageSize;
    console.log("集合名:%s,起始序号:%s,页面大小:%s", collectionName, skipNum, pageSize);
    // 分页查询
    return new Promise((resolve, reject) => {

        const $ = db.command.aggregate
        db.collection(collectionName).aggregate()
            .match({
                isSale: "1"
            })
            .project({
                categoryId: 1,
                categoryName:1,
                costPrice:1,
                createTime:1,
                discount:1,
                fileId:1,
                goodsName:1,
                imgUrl:1,
                inventory:1,
                isSale:1,
                maxBuy:1,
                originPrice:1,
                tagName:1,
                updateTime:1,
                price:$.divide([$.trunc($.multiply(['$price', '$discount',100])), 100]),
                goodsId:1,
                detailInfo:1,
                source:1,
                picUrls:1,

            })
            .sort({'updateTime':-1})
            .skip(skipNum)
            .limit(pageSize)
            .end({
                success: (result) => {
                    console.log(result);
                    resolve(result.list);
                },
                fail: (err) => {
                    reject(err);
                }
            })

    })
}

/**
 *  获取集合数据总数
 * @param {*} params 集合名
 */
export const getCollectionSize = (params) => {
    console.log("开始获取集合%s的数据总数", params)
    const _ = db.command
    return new Promise((resolve, reject) => {
        db.collection(params).where({state: _.gte(6)}).count().then(res => {
            console.log("集合总数获取成功:", res)
            resolve(res)
        })
    })
}


/**
 *  获取某分类下的商品总数
 * @param {*} params 集合名。分类id
 */
export const getGoodsListSizeByCate = (params) => {
    const collectionName = params.collectionName;
    const categoryId = params.categoryId;
    console.log("开始获取集合->%s的分类->%s数据总数", collectionName, categoryId)
    return new Promise((resolve, reject) => {
        db.collection(collectionName).where({
            categoryId: categoryId.toString(),
            isSale: '1'
        }).count().then(res => {
            console.log("分类%s总数获取成功:%s", categoryId, res.total)
            resolve(res.total)
        })
    })
}


/**
 *  通过分类获取商品列表
 * @param {*} params 分类id
 */
export const getGoodsListByCategory = (params) => {
    // 集合名称
    const collectionName = params.collectionName;
    // 起始序号
    const skipNum = params.skipNum;
    // 返回数据数量
    const pageSize = params.pageSize;
    // 分类id
    const categoryId = params.categoryId;
    console.log("通过分类获取商品列表->collectionName->%s,skipNum->%s,pageSize->%s,categoryId->%s", collectionName, skipNum, pageSize, categoryId);
    return new Promise((resolve, reject) => {

        const $ = db.command.aggregate
        db.collection(collectionName)
            .aggregate()
            .match({
                isSale:"1",
                categoryId:categoryId.toString()
            })
            .project({
                categoryId: 1,
                categoryName:1,
                costPrice:1,
                createTime:1,
                discount:1,
                fileId:1,
                goodsName:1,
                imgUrl:1,
                inventory:1,
                isSale:1,
                maxBuy:1,
                originPrice:1,
                tagName:1,
                updateTime:1,
                price:$.divide([$.trunc($.multiply(['$price', '$discount',100])), 100]),
                goodsId:1,
                detailInfo:1,
                source:1,
                picUrls:1
            })
            .sort({'_id':-1})
            .skip(skipNum)
            .limit(pageSize)
            .end({
                success: (result) => {
                    console.log("分类查询",result);
                    resolve(result.list);
                },
                fail: (err) => {
                    reject(err);
                }
            })
    })
}


/**
 *  保存用户地址
 * @param {*} address 用户地址信息
 */
export const addAddressInfo = (params) => {
    console.log("开始保存用户地址信息", params)
    const userName = params.userName;
    const userPhone = params.userPhone;
    const address = params.address;
    const roomNum = params.roomNum;
    // const isMain = params.isMain;
    const addressCollection = db.collection('address');
    var myDate = new Date();
    return new Promise((resolve, reject) => {
        addressCollection.add({
            data: {
                userName: userName,
                userPhone: userPhone,
                address: address,
                roomNum: roomNum,
                // isMain: isMain,
                createdTime: myDate.toTimeString,
                removed: 0
            }
        }).then(res => {
            resolve(res)
        }).catch(console.err)
    })
}


/**
 *  获取用户地址列表
 * @param {*} address 用户地址信息
 */
export const getAddressList = (params) => {
    console.log("开始查询用户地址信息列表", params)
    const openid = params.openid;
    const addressCollection = db.collection('address');
    var myDate = new Date();
    return new Promise((resolve, reject) => {
        addressCollection.where({
            _openid: openid,
            removed: 0
        })
            .orderBy('createTime', 'desc')
            .get({
                success: (result) => {
                    console.log("成功获取用户地址列表：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  根据数据id获取用户地址信息
 * @param {*} address 用户地址信息
 */
export const getAddrById = (id) => {
    console.log("开始根据数据id获取用户地址信息", id)

    const addressCollection = db.collection('address');
    return new Promise((resolve, reject) => {
        addressCollection
            .doc(id)
            .get({
                success: (result) => {
                    console.log("成功获取用户id->{%s}地址信息->{%o}：", id, result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}

/**
 *  根据数据id修改用户地址信息
 * @param {*} address 用户地址信息
 */
export const updateAddrById = (params) => {
    console.log("开始根据数据id修改用户地址信息", params);
    const userName = params.userName;
    const userPhone = params.userPhone;
    const address = params.address;
    const roomNum = params.roomNum;
    const id = params.id;
    const isRemoved = params.isRemoved;
    var myDate = new Date();

    const addressCollection = db.collection('address');
    return new Promise((resolve, reject) => {
        addressCollection
            .doc(id)
            .update({
                data: {
                    // todo
                    userName: userName,
                    userPhone: userPhone,
                    address: address,
                    roomNum: roomNum,
                    removed: isRemoved
                },
                success: (result) => {
                    console.log("成功更新用户id->{%s}地址信息->{%o}：", id, result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  获取配送时间列表
 * @param {*}  用户地址信息
 */
export const getDeliveryTimeList = () => {
    const timeList = db.collection('deliveryTime');
    var myDate = new Date();
    return new Promise((resolve, reject) => {
        timeList
            .orderBy("day", 'asc')
            .orderBy("hour", 'asc')
            .orderBy("min", 'asc')
            .get({
                success: (result) => {
                    console.log("成功获取配送时间列表", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}

/**
 *  根据关键字获取分页数据
 * @param {*} params 集合名,目标页,页面数据量
 */
export const searchDataByPage = (params) => {
    console.log(params)
    const collectionName = params.collectionName;
    const keyWords = params.keyWords;
    const skipNum = params.skipNum;
    const pageSize = params.pageSize;
    console.log("集合名:%s,关键字:%s,起始序号:%s,页面大小:%s", collectionName, keyWords, skipNum, pageSize);
    // 分页查询
    return new Promise((resolve, reject) => {

        const $ = db.command.aggregate
        db.collection(collectionName)
            .aggregate()
            .match({
                isSale:"1",
                goodsName: db.RegExp({
                    regexp: keyWords,
                    options: 'i',
                }),
            })
            .project({
                categoryId: 1,
                categoryName:1,
                costPrice:1,
                createTime:1,
                discount:1,
                fileId:1,
                goodsName:1,
                imgUrl:1,
                inventory:1,
                isSale:1,
                maxBuy:1,
                originPrice:1,
                tagName:1,
                updateTime:1,
                price:$.divide([$.trunc($.multiply(['$price', '$discount',100])), 100]),
                goodsId:1,
                detailInfo:1,
                source:1,
                picUrls:1,
            })
            .sort({'_id':-1})
            .skip(skipNum)
            .limit(pageSize)
            .end({
                success: (result) => {
                    console.log("关键字查询",result);
                    resolve(result.list);
                },
                fail: (err) => {
                    reject(err);
                }
            })
    })
}


/**
 *  保存用户意见
 * @param {*}  用户意见
 */
export const addOpinion = (params) => {
    console.log("开始保存用户意见", params)
    const imgUrl = params.imgUrl;
    const text = params.text;
    // const isMain = params.isMain;
    const addressCollection = db.collection('opinion');
    var myDate = new Date();
    return new Promise((resolve, reject) => {
        addressCollection.add({
            data: {
                imgUrl: imgUrl,
                text: text,
                createdTime: myDate.toTimeString,
            }
        }).then(res => {
            resolve();
        }).catch(console.err)
    })
}


/**
 *  保存订单售后信息
 * @param {*}  售后信息
 */
export const addApplyService = (params) => {
    console.log("开始保存订单售后信息", params)
    const applyType = params.applyType;
    const applyRemarks = params.applyRemarks;
    const orderId = params.orderId;
    const imgList = params.imgList;
    // const isMain = params.isMain;
    const collection = db.collection('applyService');
    return new Promise((resolve, reject) => {
        collection.add({
            data: {
                applyType: applyType,
                applyRemarks: applyRemarks,
                orderId: orderId,
                imgList: imgList,
                createdTime: new Date().Format("yyyy-MM-dd HH:mm:ss"),
            }
        }).then(res => {
            resolve();
        }).catch(console.err)
    })
}


/**
 *  根据id删除数据
 * @param {id,collectionName}  数据id，集合名
 */
export const deleteById = (params) => {
    console.log("删除集合中数据", params)
    const collectionName = params.collectionName;
    const id = params.id;
    const collection = db.collection(collectionName);
    return new Promise((resolve, reject) => {
        collection.doc(id)
            .update({
                data: {
                    removed: 1
                },
                success: (result) => {
                    console.log(result);
                    resolve(result)
                },
                fail: (err) => {
                    reject(err);
                }
            })


    })
}

/**
 *  提交订单
 * @param {*}  用户意见
 */
export const submitOrder = (params) => {
    console.log("开始提交订单", params)
    // const isMain = params.isMain;
    const orderCollection = db.collection('order');
    var myDate = new Date();
    return new Promise((resolve, reject) => {
        orderCollection.add({
            data: {
                orderNo: params.orderNo,
                sendTime: params.sendTime,
                receiveAddr: params.receiveAddr,
                receiveRoomNum: params.receiveRoomNum,
                receiveName: params.receiveName,
                receivePhone: params.receivePhone,
                goodsList: params.goodsList,
                totalPrice: params.totalPrice,
                deliverPrice: params.deliverPrice,
                freePrice: params.freePrice,
                state: params.state,
                stateName: params.stateName,
                createdTime: new Date().Format("yyyy-MM-dd HH:mm:ss"),
                createTimes: new Date().getTime(),
                remarks: params.remarks,
                removed: 0,
                goodsCount: params.goodsCount,
                payPrice: params.payPrice,
                shareId: params.shareId,
                isPrize: params.isPrize,
                outStock: params.outStock
            }
        }).then(res => {
            console.log("保存结果", res)
            resolve(res._id);
        }).catch(console.err)
    })
}


/**
 *  根据数据id获取订单信息
 * @param {*} id 订单里的数据id
 */
export const getOrderById = (id) => {
    console.log("根据数据id获取订单信息", id)
    const goodsList = db.collection('order');
    return new Promise((resolve, reject) => {
        goodsList
            .doc(id)
            .get({
                success: (result) => {
                    console.log("获取订单数据结果：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}

/**
 *  分页获取某用户的所有订单
 * @param {*} openId 用户id
 */
export const PageAllOrder = (openId, skipNum, pageSize) => {
    console.log("分页获取某用户的所有订单", openId, skipNum, pageSize)
    const orderList = db.collection('order');
    return new Promise((resolve, reject) => {
        orderList.skip(skipNum).limit(pageSize)
            .where({
                _openid: openId,
                removed: 0
            })
            .orderBy('createdTime', 'desc')
            .get({
                success: (result) => {
                    console.log("分页获取某用户的所有订单 结果", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 * 分页获取我的订单
 * @param openId 用户openId
 * @param skipNum 起始索引
 * @param pageSize 页面大小
 * @param active 订单页面状态
 * @returns {Promise<unknown>}
 */
export const pageMyOrder = (openId, skipNum, pageSize, active) => {
    console.log("分页获取我的订单", openId, skipNum, pageSize, active)
    const orderList = db.collection('order');
    const _ = db.command
    var param = {}
    //所有
    if (active === '0') {
        param._openid = openId
        param.removed = 0
    }
    //代付款
    if (active === '1') {
        param._openid = openId
        param.state = 1
        param.removed = 0
    }
    //待收货
    if (active === '2') {
        param._openid = openId
        param.state = _.in([2, 3, 4, 5])
        param.removed = 0
    }
    //售后
    if (active === '3') {
        param._openid = openId
        param.state = _.gt(6)
        param.removed = 0
    }
    return new Promise((resolve, reject) => {
        orderList
            .where({...param})
            .skip(skipNum).limit(pageSize)
            .orderBy('createdTime', 'desc')
            .get({
                success: (result) => {
                    console.log("分页获取我的订单 结果", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  获取某用户的所有订单总数
 * @param {*} openId 用户id
 */
export const getAllOrderCount = (openId) => {
    console.log("获取某用户的所有订单总数", openId)
    const orderList = db.collection('order');
    return new Promise((resolve, reject) => {
        orderList
            .where({
                _openid: openId,
                removed: 0
            })
            .count()
            .then(res => {
                console.log("获取某用户的所有订单总数 结果", res);
                resolve(res.total)
            })
    })
}


/**
 *  分页获取待支付订单列表
 * @param {*} openId 用户id
 */
export const PageWaitPayOrder = (openId, skipNum, pageSize) => {
    console.log("分页获取待支付订单列表", openId)
    const goodsList = db.collection('order');
    return new Promise((resolve, reject) => {
        goodsList.skip(skipNum).limit(pageSize)
            .where({
                _openid: openId,
                state: 1,
                removed: 0
            })
            .orderBy('createdTime', 'desc')
            .get({
                success: (result) => {
                    console.log("分页获取待支付订单列表 结果", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  获取待支付订单列表总数
 * @param {*} openId 用户id
 */
export const getWaitPayOrderCount = (openId) => {
    console.log("获取待支付订单列表总数", openId)
    const orderList = db.collection('order');
    const _ = db.command

    return new Promise((resolve, reject) => {
        orderList
            .where({
                _openid: openId,
                state: 1,
                removed: 0
            })
            .count()
            .then(res => {
                console.log("获取待支付订单列表总数 结果", res);
                resolve(res.total)
            })
    })
}


/**
 *  分页获取待收货订单列表
 * @param {*} openId 用户id
 */
export const PageWaitReceiveOrder = (openId, skipNum, pageSize) => {
    console.log("根据数据用户id获取订单信息", openId, skipNum, pageSize)
    const goodsList = db.collection('order');
    const _ = db.command
    return new Promise((resolve, reject) => {
        goodsList.skip(skipNum).limit(pageSize)
            .where({
                _openid: openId,
                state: _.in([2, 3, 4, 5]),
                removed: 0
            })
            .orderBy('createdTime', 'desc')
            .get({
                success: (result) => {
                    console.log("分页获取待收货订单列表  结果", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  获取待收货订单总数
 * @param {*} openId 用户id
 */
export const getWaitReceiveOrderCount = (openId) => {
    console.log("获取待收货订单总数", openId)
    const orderList = db.collection('order');
    const _ = db.command

    return new Promise((resolve, reject) => {
        orderList
            .where({
                _openid: openId,
                state: _.in([2, 3, 4, 5]),
                removed: 0
            })
            .count()
            .then(res => {
                console.log("获取待收货订单总数 结果", res);
                resolve(res.total)
            })
    })
}


/**
 *  分页获取申请售后订单列表
 * @param {*} openId 用户id
 */
export const PageApplyServiceOrder = (openId, skipNum, pageSize) => {
    console.log("根据数据用户id分页获取申请售后订单列表", openId)
    const goodsList = db.collection('order');
    const _ = db.command
    return new Promise((resolve, reject) => {
        goodsList.skip(skipNum).limit(pageSize)
            .where({
                _openid: openId,
                state: _.gt(6),
                removed: 0
            })
            .orderBy('createdTime', 'desc')
            .get({
                success: (result) => {
                    console.log("分页获取申请售后订单列表  结果", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  获取售后订单总数
 * @param {*} openId 用户id
 */
export const getApplyServiceOrderCount = (openId) => {
    console.log("获取申请售后订单总数", openId)
    const orderList = db.collection('order');
    const _ = db.command

    return new Promise((resolve, reject) => {
        orderList
            .where({
                _openid: openId,
                state: _.gt(6),
                removed: 0
            })
            .count()
            .then(res => {
                console.log("获取售后订单总数 结果", res);
                resolve(res.total)
            })
    })
}


/**
 *  修改订单状态
 * @param id
 * @param state
 * @param stateName
 */
export const updateOrderState = (id, state, stateName) => {
    console.log(" 开始修改用户订单状态", id, state, stateName)
    const order = db.collection('order');
    return new Promise((resolve, reject) => {
        order.doc(id)
            .update({
                data: {
                    state: state,
                    stateName: stateName
                },
                success: (result) => {
                    console.log("修改订单响应：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  修改订单数据
 * @param order
 */
export const updateOrder = (order) => {
    console.log(" 开始修改用户订单数据", order)
    const orderCollection = db.collection('order');
    var params = {}
    const id = order._id
    // 订单状态
    if (order.state > -1) {
        params.state = order.state
    }
    // 订单状态名称
    if (order.stateName) {
        params.stateName = order.stateName
    }
    // 退单单号
    if (order.refundNo) {
        params.refundNo = order.refundNo
    }
    // 微信订单号
    if (order.transactionId) {
        params.transactionId = order.transactionId
    }
    // 退货或售后原因
    if (order.reason) {
        params.reason = order.reason
    }
    console.log(" 参数初始化完毕", params)
    return new Promise((resolve, reject) => {
        orderCollection.doc(id)
            .update({
                data: {
                    ...params
                },
                success: (result) => {
                    console.log("修改订单响应：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  取消或申请售后
 * @param id
 * @param state
 * @param stateName
 * @param reason
 */
export const cancelOrApplayOrder = (id, state, stateName, reason) => {
    console.log(" 开始修改用户订单状态", id, state, stateName, reason)
    const order = db.collection('order');
    return new Promise((resolve, reject) => {
        order.doc(id)
            .update({
                data: {
                    state: state,
                    stateName: stateName,
                    reason: reason
                },
                success: (result) => {
                    console.log("修改订单响应：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  根据id获取用户售后详情
 * @param {*}  id
 */
export const getApplyService = (id) => {
    console.log("开始根据id获取用户售后详情", id)

    const collection = db.collection('applyService');
    return new Promise((resolve, reject) => {
        collection
            .where({
                orderId: id
            })
            .get({
                success: (result) => {
                    console.log("成功获取用户id->{%s}售后详情->{%o}：", id, result);
                    resolve(result.data[0]);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  查询该用户的分享人openid
 * @param {*}  id
 */
export const getShareOpenId = (openId) => {
    console.log("开始查询该用户是否有分享人", openId)
    const collection = db.collection('shareRelation');
    return new Promise((resolve, reject) => {
        collection
            .where({
                invitee: openId
            })
            .field({
                share: true
            })
            .get({
                success: (result) => {
                    console.log("分享人查询成功", result);
                    const shareId = result.data.length > 0 ? result.data[0].share : ''
                    resolve(shareId);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}

/**
 *  创建收邀人和分享人的绑定关系
 * @param {受邀人}  openId
 * @param {分享人}  shareId
 */
export const createShareRelation = (openId, shareId) => {
    console.log("准备创建绑定关系 受邀人->{%s} 分享人->{%s}", openId, shareId)
    const collection = db.collection('shareRelation');
    return new Promise((resolve, reject) => {
        collection
            .add({
                data: {
                    share: shareId,
                    invitee: openId,
                    createTime: new Date()
                }
            })
            .then(res => {
                console.log("绑定关系创建完成", res)
                resolve(res)
            }).catch(console.err)
    })
}


/**
 *  添加分享人用户信息
 * @param {分享人}  shareId
 */
export const addShareUserInfo = (shareId) => {
    console.log("准备添加分享人用户信息  分享人->{%s}", shareId)
    const collection = db.collection('userInfo');
    return new Promise((resolve, reject) => {
        collection
            .add({
                data: {
                    openId: shareId,
                    shareNum: 1,
                    createTime: new Date(),
                    updateTime: new Date()
                }
            })
            .then(res => {
                console.log("添加分享人用户信息完成", res)
                resolve(res)
            }).catch(console.err)
    })
}


/**
 *  通过ID集合获取商品商品信息
 * @param {商品ID集合}  ids
 */
export const getGoodsByIds = (ids) => {
    console.log("通过ID集合获取商品商品信息  ids->", ids)
    const collection = db.collection('goodsList');
    const _ = db.command

    return new Promise((resolve, reject) => {
        collection
            .where({
                _id: _.in(ids)
            }).get({
            success: (result) => {
                console.log("通过ID集合获取商品商品信息 结果->：", result);
                resolve(result.data);
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

/**
 *  通过ID获取商品信息
 * @param {商品ID集合}  id
 */
export const getGoodsById = (id) => {
    console.log("通过ID集合获取商品信息 id->", id)
    const collection = db.collection('goodsList');
    const _ = db.command
    return new Promise((resolve, reject) => {
        collection
            .doc(id)
            .get({
                success: (result) => {
                    console.log("通过ID获取商品信息 结果->：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}


/**
 *  后台多条件查询商品列表
 *  @param param 查询条件
 */
export const getMgmtGoodsList = (param) => {
    console.log("后台多条件查询商品列表 param->", param)
    const _ = db.command
    var selectParam = {}
    if (param.categoryValue) {
        console.log("分类名")
        selectParam.categoryId = param.categoryValue
    }
    if (param.goodsName) {
        console.log("商品名")
        selectParam.goodsName = db.RegExp({
            regexp: param.goodsName,
            options: 'i',
        })
    }
    var collection = db.collection('goodsList')
    // 多条件
    if (selectParam !== {}) {
        console.log("构造查询参数")
        collection = collection.where({
            ...selectParam
        })
    }
    //排序
    if (param.orderBy && param.orderBy.value != '') {
        console.log("构造排序条件")
        collection = collection.orderBy('isSale','desc').orderBy(param.orderBy.key, param.orderBy.value)
    } else {
        collection = collection.orderBy('isSale','desc').orderBy('updateTime', 'desc')
    }
    console.log("查询对象", collection)
    return new Promise((resolve, reject) => {
        collection
            .skip(param.skipNum)
            .limit(param.pageSize)
            .get({
                success: (result) => {
                    console.log("多条件查询 结果->：", result);
                    resolve(result.data);
                },
                fail: (err) => {
                    reject(err)
                }
            })
    })
}

/**
 *  添加商品信息
 * @param {*} address 商品信息
 */
export const addGoodsInfo = (params) => {
    console.log("开始添加商品信息", params)
    params.createTime = new Date().getTime()
    params.updateTime = new Date().getTime()
    const addressCollection = db.collection('goodsList');
    return new Promise((resolve, reject) => {
        addressCollection.add({
            data: {
                ...params
            }
        }).then(res => {
            resolve(res)
        }).catch(console.err)
    })
}

/**
 *  获取用户订单数
 * @param {*} openId 用户ID
 */
export const getOrderCount = (openId) => {
    console.log("获取用户订单数", openId)
    const orderCollection = db.collection('order');
    return new Promise((resolve, reject) => {
        orderCollection.count()
    })
}

/**
 *  获取商品详情
 * @param {*} goodsId 商品ID
 */
export const getGoodsDetail = (goodsId) => {
    console.log("查询商品id->%s详情", goodsId)
    const orderCollection = db.collection('goodsList');
    return new Promise((resolve, reject) => {
        orderCollection
            .where({
                goodsId:goodsId
            }).get({
            success: (result) => {
                console.log("查询商品->%s 结果->：", goodsId,result);
                resolve(result.data[0]);
            },
            fail: (err) => {
                console.error("查询商品->%s 结果->失败：", goodsId,result);
                reject(err)
            }
        })
    })
}


