import {updateOrderState} from './dbUtil'

var appInst = getApp();

export const checkToken = (params) => {
    var token = wx.getStorageSync("token");
    return new Promise((resolve, reject) => {
        if (!token || !token.phone || !token.openId) {
            wx.navigateTo({
                url: '/pages/login/login'
            })
        } else {
            wx.checkSession({
                fail() {
                    const code = wx.login();
                    console.log("重新获取用户登陆code")
                }
            })
        }
    })
}

/**
 * 上传图片
 * @param {} file
 * @param {} filename
 */
export const upLoadImg = (fileName, file) => {
    console.log("上传的文件信息：", fileName, file)
    return new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
            cloudPath: fileName + "/" + new Date().getTime() + file.name,
            filePath: file.url
        }).then(res => {
            // 获取响应结果
            console.log("图片上传成功", res)
            wx.cloud.getTempFileURL({
                fileList: [{
                    fileID: res.fileID
                }]
            }).then(res => {
                console.log(" 获取真实路径结果", res)
                resolve(res.fileList[0])
            }).catch(err => {
                console.log("获取真实路径异常", err)
            })
        }).catch(err => {
            reject(err)
        })
    })
}


/**
 * 批量上传 图片
 * @param {} file
 * @param {} filename
 */
export const batchUploadImg = (fileName, fileList) => {
    // const start = url.lastIndexOf('.');
    // const suffix = url.substring(start, url.length);
    const uploadTasks = fileList.map(file => {
        return wx.cloud.uploadFile({
            cloudPath: fileName + "/" + new Date().getTime() + file.name,
            filePath: file.url
        })
    });
    return new Promise((resolve, reject) => {
        Promise.all(uploadTasks)
            .then(data => {
                console.log(" 上传完毕", data)
                let newFileList = data.map(item => {
                    return item.fileID
                });
                resolve(newFileList)
            })
            .catch(e => {
                reject(e)
            });
    })

}

/**
 * 获取用户id
 */
export const getOpenId = () => {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'getOpenid'
        })
            .then(res => {
                resolve(res.result.openid)
            })
            .catch(error => {
                reject(error)
            })
    })

}


/**
 * 更新分享人用户信息
 */
export const updateUserInfo = (param) => {
    console.log("准备更新分享人用户信息", param)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'updateUserInfo',
            data: {
                ...param
            }
        })
            .then(res => {
                resolve(res)
            })
            .catch(error => {
                reject(error)
            })
    })

}

/**
 * 查询微信订单支付状态
 */
export const queryWxOrder = (orderNo) => {
    console.log("准备 查询微信订单支付状态", orderNo)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'queryWxOrder',
            data: {
                orderNo: orderNo
            }
        })
            .then(res => {
                console.log(" 查询微信订单支付状态 结果", res)
                resolve(res)
            })
            .catch(error => {
                reject(error)
            })
    })

}

/**
 * 查询用户信息
 */
export const queryUserInfo = () => {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'queryUserInfo'
        })
            .then(res => {
                console.log(" 云函数返回的响应", res)
                resolve(res.result[0])
            })
            .catch(error => {
                reject(error)
            })
    })

}

/**
 * 支付
 */
export const payOrder = (orderNo, attach, payPrice) => {
    console.log("payOrder", orderNo, attach, payPrice)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            // 云函数名称
            name: 'payOrder',
            data: {
                orderNo: orderNo,
                attach: attach,
                payPrice: payPrice
            }
        })
            .then(res => {
                console.log(" 云函数返回的响应", res)
                resolve(res)
            })
            .catch(error => {
                reject(error)
            })
    })

}
/**
 * 支付
 */
export const toPayPage = async (orderNo, attach, payPrice) => {
    const payResult = await payOrder(orderNo, attach, payPrice)
    wx.hideLoading();
    console.log("toPayPage payResult", payResult)
    return new Promise((resolve, reject) => {
      resolve(true)
      // TODO 方便演示 以下支付代码注解需要的可以打开
        // const payment = payResult.result.payment
        // wx.requestPayment({
        //     ...payment,
        //     async success(res) {
        //         console.log('pay success', res)
        //         resolve(true)
        //     },
        //     fail(res) {
        //         console.error('pay fail', res)
        //         reject(false)
        //     }
        // })
    })

}

/**
 * 申请退款
 * @param {参数} param
 */
export const refundOrder = (param) => {
    console.log(" 准备申请退款", param)
    return new Promise((resolve, reject) => {
        // 获取响应结果
        wx.cloud.callFunction({
            // 云函数名称
            name: 'refundOrder',
            data: {
                ...param
            }
        })
            .then(res => {
                console.log(" 申请退款云函数返回的响应", res)
                resolve(true)
            })
            .catch(error => {
                console.err(" 申请退款云函数返回的响应", error)
                reject(false)
            })
    })
}


/**
 * 批量获取http图片链接
 * @param {临时数组} tempList
 */
export const getHttpUrlList = (tempList) => {
    console.log(" 准备批量获取http图片链接", tempList)
    return new Promise((resolve, reject) => {
        // 获取响应结果
        wx.cloud.getTempFileURL({
            fileList: tempList
        }).then(res => {
            console.log(" 获取真实路径结果", res)
            resolve(res.fileList)
        }).catch(err => {
            console.log("获取真实路径异常", err)
        })
    })
}


/**
 * 获取小程序码
 * @param {临时数组} tempList
 */
export const getCodeImgUrl = (openId) => {
    console.log(" 获取小程序码", openId)
    return new Promise((resolve, reject) => {
        // 获取响应结果
        wx.cloud.callFunction({
            name: 'getCode',
            data: {
                openId: openId
            }
        }).then(res => {
            console.log(" 获取小程序码结果", res)
            resolve(res.result.fileID)
        }).catch(err => {
            console.log("获取小程序码结果异常", err)
        })
    })
}


Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}



/**
 * 获取随机订单号
 */
export const getOrderNo = () => {
    var random_no = "";
    for (var i = 0; i < 8; i++) {
        random_no += Math.floor(Math.random() * 10);
    }
    random_no = new Date().getTime() + random_no;
    return random_no;
}


/**
 * 校验 商品 库存 和最大购买数量是否合法
 * @param {临时数组} tempList
 */
export const checkGoodsNum = (goods) => {
    // 校验商品是否已售完
    if (goods.inventory === 0) {
        wx.showToast({
            title: '该商品已售完',
            icon: 'none',
            duration: 1500,
            mask: true
        });
        return false
    }
    console.log("此商品购买数", goods.buyNum, goods)
    if (goods.buyNum >= goods.inventory - 0) {
        wx.showToast({
            title: '抱歉,该商品只剩' + goods.inventory + '件',
            icon: 'none',
            duration: 1500,
            mask: true
        });
        return false
    }
    if (goods.maxBuy && goods.buyNum >= goods.maxBuy - 0) {
        wx.showToast({
            title: '抱歉,该商品每人限购' + goods.maxBuy + '件',
            icon: 'none',
            duration: 1500,
            mask: true
        });
        return false
    }
    return true;
}

/**
 * 定时器
 */
export const enableTimer = async (id, orderNo, createtime, cancelGoldNum) => {
    // var that = this;
    var data = wx.getStorageSync(id) || {};
    console.log(" 定时器启动获取缓存->{%s}中的数据：%o", id, data)
    // 开启定时器
    var timerName = setTimeout(function () {
        enableTimer(id, orderNo, createtime, cancelGoldNum);
    }, 1000);
    console.log("创建定时器名", timerName)
    data.timerName = timerName;
    if (!createtime) {
        createtime = data.createtime
    }
    data.orderNo = orderNo
    data.time = 5 * 60 - (new Date().getTime() - createtime) / 1000;
    data.createtime = createtime
    data.cancelGoldNum = cancelGoldNum
    console.log(" 定时器数据 time->%s,now->%s,createTime->%s", data.time, new Date().getTime(), createtime)
    if (data.time <= 0) {
        clearTimeout(timerName);
        console.log("准备删除缓存id->", id)
        wx.removeStorage({
            key: id,
            success: (result) => {
                console.log("删除成功", id, result)
            },
            fail: () => {
                console.log("删除失败", id)
            },
            complete: () => {
                console.log("执行成功", id)
            }
        });
        console.log("已删除缓存id->", id)
        // 发起修改订单状态请求
        // 撤销已使用的果币
        // const cancelGoldNum = that.data.freePrice

        // 更新订单状态
        const wxResult = await queryWxOrder(orderNo)
        var order = {}
        if (wxResult.result.tradeState === "SUCCESS") {
            order.state = 2
            order.stateName = "支付成功,商家待接单"
        } else {
            order.stateName = "订单逾期未支付已自动取消";
            order.state = 0;
            console.log("准备更新用户果币数量", cancelGoldNum)
            if (cancelGoldNum > 0) {
                updateUserInfo({goldNum: cancelGoldNum*100, usedGold: cancelGoldNum*100 * -1})
            }
        }
        updateOrderState(id, order.state, order.stateName);
    }
    // 定时器执行结束
    console.log(" 定时器执行结束：", data)
    wx.setStorageSync(id, data);

}


/**
 * 查询是否为管理员
 * @param {临时数组} tempList
 */
export const queryMgmt = (phone) => {
    // 校验商品是否已售完
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "queryMgmt",
            data: {
                phone
            }
        }).then(res => {
            console.log("查询结果", res)
            resolve(res.result.data)
        }).catch(err => {
            console.log(" 查询失败", err)
            reject(res)
        })

    })
}


/**
 * 后台管理查询相应状态订单
 * @param {临时数组} tempList
 */
export const queryMgmtOrder = (orderState, index, pageSize) => {
    // 校验商品是否已售完
    console.log("后台管理查询相应状态订单 orderState->%s,index->%s,pageSize->%s", orderState, index, pageSize)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "queryOrder",
            data: {
                orderState: orderState - 0,
                index: index,
                pageSize: pageSize
            }
        }).then(res => {
            console.log("查询结果", res)
            resolve(res.result)
        }).catch(err => {
            console.log(" 查询失败", err)
            reject(err)
        })

    })
}

/**
 * 管理后台修改订单数据
 * @param {订单数据} order
 * @param {订单ID} id
 */
export const updateMgmtOrder = (id, order) => {
    // 校验商品是否已售完
    console.log("开始通过后台修改订单数据 orderId->%s,state->%s,stateName->%s", id, order.state, order.stateName)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "updateMgmtOrder",
            data: {
                id: id,
                order: order
            }
        }).then(res => {
            console.log("通过后台修改订单结果", res)
            resolve(res.result)
        }).catch(err => {
            console.log("通过后台修改订单失败", err)
            reject(err)
        })

    })
}
/**
 * 查询售后申请详情
 * @param {订单ID} orderId
 */
export const queryApplyInfo = (orderId) => {
    // 校验商品是否已售完
    console.log("查询售后申请详情 orderId->%s", orderId)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "queryApplyInfo",
            data: {
                orderId: orderId
            }
        }).then(res => {
            console.log("查询售后申请详情", res)
            resolve(res.result.data)
        }).catch(err => {
            console.log("查询售后申请详情失败", err)
            reject(err)
        })

    })
}

/**
 * 修改售后订单详情
 * @param {订单ID} orderId
 * @param {订单数据} handleData
 */
export const updateApplyInfo = (orderId, handleData) => {
    // 校验商品是否已售完
    console.log("修改售后订单详情 orderId->%s", orderId, handleData)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "updateApplyInfo",
            data: {
                orderId: orderId,
                handleData: handleData
            }
        }).then(res => {
            console.log("修改售后申请详情结果", res)
            resolve(res.result)
        }).catch(err => {
            console.log("修改售后申请详情失败", err)
            reject(err)
        })
    })
}

/**
 * 修改商品信息
 * @param {参数} param
 */
export const updateGoodsInfo = (param) => {
    // 校验商品是否已售完
    console.log("修改商品信息 param->", param)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "updateGoods",
            data: {
                param: param
            }
        }).then(res => {
            console.log("修改商品信息结果", res)
            resolve(res.result)
        }).catch(err => {
            console.log("修改商品信息失败", err)
            reject(err)
        })

    })
}

/**
 * 更新商品库存
 * @param {参数} param
 */
export const renewGoodsStock = (operationType, goodsList) => {
    // 校验商品是否已售完
    console.log("更新商品库存 operationType->%s,goodsList->", operationType,goodsList)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "renewGoodsStock",
            data: {
                operationType: operationType,
                goodsList: goodsList
            }
        }).then(res => {
            console.log("更新商品库存", res)
            resolve(res.result)
        }).catch(err => {
            console.error("更新商品库存", err)
            reject(err)
        })

    })
}
/**
 * 查询订单详情
 * @param {参数} param
 */
export const queryOrderDetail = (_id) => {
    // 校验商品是否已售完
    console.log("查询商品 id->%s", _id)
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "queryOrderDetail",
            data: {
                _id: _id
            }
        }).then(res => {
            console.log("查询商品信息", res)
            resolve(res.result.data)
        }).catch(err => {
            console.error("查询商品信息失败", err)
            reject(err)
        })

    })
}
