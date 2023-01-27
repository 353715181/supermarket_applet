import {getShareOpenId, updateOrder} from "../../utils/dbUtil.js";
import {getOrderNo, refundOrder, toPayPage} from "../../utils/commonUtil.js";
import {updateUserInfo} from "../../utils/commonUtil";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        order: {
            type: Object,
            value: {}
        }
    },
    options: {
        styleIsolation: 'shared',
    },
    lifetimes: {

        ready() {
            console.log("order-button ready data :", this.data.order)
            if (!this.data.order) {
                this.ready()
            }
            if (this.data.order && this.data.order.state == 1) {
                var timer = wx.getStorageSync(this.data.order._id);
                if (timer) {
                    // enableTimer(this.data.order._id, timer.orderNo, timer.createtime, timer.cancelGoldNum)
                    timer = wx.getStorageSync(this.data.order._id);
                    console.log(" timer", timer)
                    if (timer && timer.time) {
                        this.setData({
                            time: timer.time * 1000,
                            id: this.data.order._id
                        })

                    }
                }
            } else {
                console.log("定时器初始化失败")
            }
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        time: 0,
        timerName: '',
        id: "",
        showActionSheet: false,
        actions: [{
            name: '1',
            value: '操作有误（商品/地址/送达时间选错了）'
        },
            {
                value: '重复下单',
                name: '2'
            },
            {
                value: '不想买了',
                name: '3'
            },
            {
                value: '其他原因',
                name: '4'
            },
        ],
        pay: false,
        radio: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {

        /**
         * 倒计时
         */
        onCountDown(e) {
            this.setData({
                timeData: e.detail,
            })
        },
        /**
         * 倒计时完成
         */
        onFinish() {
            this.setData({
                pay: true
            })
            console.log(" order-button 完成倒计时", this.data)
            this.triggerEvent("onFinish", this.data.order._id, {})
        },

        /**
         * 去支付
         */
        async onToPay() {
            wx.showLoading({
                mask:true
            })
            const id = this.data.order._id;
            var shareOpenId = wx.getStorageSync("shareOpenId");
            var token = wx.getStorageSync("token")
            if (!shareOpenId) {
                shareOpenId = await getShareOpenId(token.openId)
                wx.setStorageSync("shareOpenId", shareOpenId)
            }
            console.log(" 去支付", this.data)
            console.log(" order-button 准备支付 id->%s,shareOpenId->%s,payPrice->%s", id, shareOpenId, this.data.order.payPrice)
            const result = await toPayPage(this.data.order.orderNo, {
                id: id,
                shareOpenId: shareOpenId
            }, this.data.order.payPrice)
            if (result) {
                // 支付成功
                // 更新本地订单状态
                const order = this.data.order
                order.state = 2
                order.stateName = "支付成功,商家待接单"
                this.triggerEvent('updateOrderData', order, {})
            }
        },

        /**
         * 删除订单
         */
        deleteOrder() {
            console.log(" 自定义组件删除订单：", this.data.order._id)
            this.triggerEvent("onDeleteOrder", this.data.order._id, {})
        },
        /**
         * 添加商品列表到购物车中
         */
        addToCart() {
            var order = this.data.order;
            console.log(" 添加商品列表到购物车中", order.goodsList)
            var cart = wx.getStorageSync("cart") || [];
            if (cart.length > 0) {
                order.goodsList.map(g => {
                    const index = cart.findIndex(c => c._id === g._id)
                    if (index < 0) {
                        const checkResult = wx.getStorageSync("checkResult")||[];
                        wx.setStorageSync('checkResult',checkResult.concat(g._id))
                        cart.push(g)
                    } else {
                        cart[index].buyNum += g.buyNum
                    }
                })
            } else {
                cart = cart.concat(order.goodsList);
            }
            console.log(" 再次购买后 购物车列表", cart)
            wx.setStorageSync("cart", cart);
            wx.switchTab({
                url: '/pages/cart/cart'
            });
        },
        /**
         * 手动取消订单
         */
        cancelOrder() {
            console.log("order-button cancelOrder ")
            // this.triggerEvent("cancelOrder",  this.data.order._id, {})
            this.setData({
                showActionSheet: true
            })

        },
        /**
         * 申请售后
         */
        applyService() {
            console.log(" order-button applyService ")
            //  跳转到 申请售后页面
            wx.navigateTo({
                url: '/pages/applyService/applyService?orderId=' + this.data.order._id
            });
        },
        /**
         * 查看售后
         */
        queryApplyService() {
            console.log(" order-button applyService ")
            //  跳转到 申请售后页面
            wx.navigateTo({
                url: '/pages/applyService/applyService?orderId=' + this.data.order._id + "&query=true"
            });
        },

        /**
         * 取消
         */
        cancelOrApplayOrder() {

        },

        onClose() {
            this.setData({
                showActionSheet: false
            })
        },
        /**
         * 选择取消订单理由
         * @param {*} event
         */
        onClick(event) {
            console.log(" order-button 选择取消订单理由", event)
            const {name} = event.currentTarget.dataset;
            this.setData({
                radio: name,
            });
        },
        /**
         * 确认取消订单
         */
        async confirmCancelOrder() {
            console.log(" order-button confirmCancelOrder", this.data.order)
            wx.showLoading({
                title: '取消中',
                mask: true
            })
            // 订单状态
            var isClose = false
            var order = this.data.order;
            // 订单主键
            const id = this.data.id
            const state = this.data.order.state
            const refundNo = getOrderNo()
            // 根据订单状态不同 处理步骤不同
            if (state < 2) {
                // 关闭定时器
                const timer = wx.getStorageSync(id);
                if (timer) {
                    clearTimeout(timer.timerName);
                    wx.removeStorage({
                        key: id,
                        success: (result) => {
                            console.log(" 手动取消订单后，定时器缓存删除成功", result)
                        }
                    });
                }
                order.state = 0
                order.stateName = "订单已手动取消"

                isClose = true
            } else if (state < 5) {
                // 申请退款
                var {orderNo, payPrice} = this.data.order
                payPrice = payPrice * 100
                payPrice = parseFloat(payPrice.toFixed(1))
                console.log(" 准备申请退款", orderNo, payPrice,)
                const refundNo = getOrderNo();
                const result = await refundOrder({
                    refundNo: refundNo,
                    orderNo: orderNo,
                    payPrice: payPrice,
                    refundPrice: payPrice
                })
                if (!result) {
                    wx.showToast({
                        title: '订单取消失败,请稍后再试',
                        duration: 1500,
                        mask: true
                    });
                    return
                }
                order.state = 0
                order.stateName = "订单已取消,退款预计1-5个工作日内退回"
                order.refundNo = refundNo
                isClose = true
                // updateOrder({id:id,state:0,stateName:"订单已取消,退款预计1-5个工作日内退回"})
            }
            if (isClose) {
                // 查找关闭订单原因并修改数据库订单状态
                const actions = this.data.actions
                // const id = this.data.order._id
                const reason = actions.find(a => a.name === this.data.radio)
                order.reason = reason
                // await cancelOrApplayOrder(id, 0, "订单已手动取消", reason.value)
                await updateOrder(order)
                this.triggerEvent('updateOrderData', order, {})
                this.setData({
                    showActionSheet: false
                })
                // 撤销果币
                const cancelGoldNum = this.data.order.freePrice * 100
                if (cancelGoldNum > 0&&state<2) {
                    const token= wx.getStorageSync('token')
                  updateUserInfo({ openId:token.openId, goldNum: cancelGoldNum, usedGold: cancelGoldNum * -1 })
                }
            }
            wx.hideLoading();
        },
        /**
         *
         */
        onCall() {
            wx.makePhoneCall({
                phoneNumber: this.data.order.startDeliveryPhone
            })
        }
    }
})
