import {deleteById, getOrderById, getShareOpenId, updateOrderState} from "../../utils/dbUtil.js";
import {queryWxOrder, toPayPage} from "../../utils/commonUtil.js";
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: "",
        id: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("订单id", options)

        this.setData({
            id: options.id
        })
        if (options.pay && options.payPrice) {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            this.pay(options.orderNo, options.payPrice)
        }
    },

    buyGoodsList: [],

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getOrderDetail(this.data.id);
        // 初始化商品总金额
        this.getTotalPrice();
    },

    /**
     * 获取购物清单
     */
    async getOrderDetail(id) {
        const order = await getOrderById(id);
        console.log(" order->", order)
        this.setData({order})
    },
    /**
     * 初始化商品金额
     */
    getTotalPrice() {
        let sum = 0;
        this.buyGoodsList.map(g => {
            sum += g.buyNum * g.price;
        })
        sum = this.toDecimal(sum);
        this.setData({
            totalPrice: sum
        })
    },
    //1.功能：将浮点数四舍五入，取小数点后2位
    toDecimal(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    },

    /**
     * 重新刷新页面
     */
    async onFinish() {
        console.log(" orderDetail倒计时结束，开始刷新页面")
        var id = this.data.id;
        const result = await getOrderById(id);
        const wxResult = await queryWxOrder(this.data.order.orderNo)
        var order = this.data.order
        if (wxResult.result.tradeState === "SUCCESS") {
            order.state = 2
            order.stateName = "支付成功,商家待接单"
        } else {
            order.stateName = "订单逾期未支付已自动取消";
            order.state = 0;
        }
        this.setData({
            order: order
        })

    },

    /**
     * 取消订单修改状态和状态名
     * @param {*} e
     */
    cancelOrder(e) {
        console.log(" orderDetail cancelOrder ", e.detail)
        Dialog.alert({
            message: '确定取消订单吗？',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "确定"
        }).then(() => {
            console.log("取消订单", e.detail)
            this.confirmCancelOrder(e.detail)
        }).catch(() => {
            console.log("点击取消按钮")
        });
    },
    /**
     * 确认取消订单
     * @param {*} id
     */
    async confirmCancelOrder(id) {
        await updateOrderState(id, 0, "订单已手动取消")
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
        var order = this.data.order;
        order.state = 0;
        order.stateName = "订单已手动取消";
        this.setData({
            order: order
        })
    },
    /**
     * 删除订单
     * @param {订单id}} id
     */
    onDeleteOrder(e) {

        Dialog.alert({
            message: '确定删除该订单吗？',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "确定"
        }).then(() => {
            console.log("删除订单：", e.detail)
            deleteById({"id": e.detail, "collectionName": "order"});
            wx.navigateBack({
                delta: 1
            });
        }).catch(() => {
            console.log("点击取消按钮")
        });
    },
    /**
     * 修改订单数据
     * @param {订单数据} e
     */
    updateOrderData(e) {
        const order = e.detail
        console.log(" orderDetail 修改订单数据", order)
        this.setData({
            order
        })
    },

    /**
     * 支付
     * @param {订单号} orderNo
     */
    async pay(orderNo, payPrice) {
        // const shareOpenId = this.getShareUserOpenId()
        var shareId = wx.getStorageSync("shareOpenId");
        var token = wx.getStorageSync("token")
        if (!shareId) {
            shareId = await getShareOpenId(token.openId)
            wx.setStorageSync("shareOpenId", shareId)
        }
        console.log(" orderDetail 准备支付 id->%s,shareOpenId->%s,payPrice->%s", orderNo, shareId, payPrice)
        const res = await toPayPage(orderNo, {id: this.data.id, shareOpenId: shareId}, payPrice)
        console.log(" 订单详情页 支付结果", res)
        if (res) {
            this.closeTiming()
            var order = this.data.order;
            order.state = 2;
            order.stateName = "支付成功,商家待接单";
            this.setData({
                order
            })
            wx.requestSubscribeMessage({
                tmplIds: ['Rb6cyQ-NFD9iOvEzjXwaWGSb2nDoilkTOsVCICmQmQ8','jpzey63z50Q6vwVe2lrplqXUKferRKMzanmU74RbrqE'],
                success(res) {
                    console.log("订阅结果", res)
                }
            })
        }
    },

    /**
     * 关闭定时器
     */
    closeTiming() {
        const id = this.data.id
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
    },

});
