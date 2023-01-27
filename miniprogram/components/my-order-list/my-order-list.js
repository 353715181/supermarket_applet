import {cancelOrApplayOrder, getOrderById} from "../../utils/dbUtil.js";
import {enableTimer, queryWxOrder} from "../../utils/commonUtil.js";

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
    /**
     * 组件的初始数据
     */
    lifetimes: {
        async ready() {
            console.log("order-button ready data :", this.data.order)
            // if (!this.data.order) {
            //     ready()
            // }
            // 该订单状态是否为 1
            if (this.data.order && this.data.order.state == 1) {
                // 若没有找到该订单的定时器缓存 先查下订单信息
                const result = await getOrderById(this.data.order._id)
                if (result.state === 1) {
                    // 如果没有缓存说明用户中途推出或清空过缓存需重新刷新页面
                    const timer = wx.getStorageSync(result._id);
                    enableTimer(result._id, result.orderNo, result.createTimes, result.freePrice-0)
                    if (new Date().getTime() - result.createTimes >= 5 * 60 * 1000) {
                        // 当前状态为代付款且已逾期需要更改订单状态
                        result.state = 0
                        result.stateName = '订单逾期未支付已自动取消'
                    } else if (new Date().getTime() - result.createTimes < 5 * 60 * 1000) {
                        // 当前订单状态为待支付需重启定时器
                        // console.log("准备启动定时器")
                        if (!timer) {
                            this.triggerEvent("onShow", '', {})
                        }
                    }
                }
                this.setData({ order: result })

            }
        }
    },
    data: {
        sumNum: 0,
        serviceRemark: '',
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
        radio: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 跳转到订单详情页
         */
        getDetail(e) {
            console.log(" 跳转到详情页：e", e);
            wx.navigateTo({
                url: '/pages/orderDetail/orderDetail?id=' + e.currentTarget.dataset.id
            });
        },

        /**
         * my-order-list倒计时结束 重新加载
         * @param {*} e
         */
        async onFinish(e) {
            console.log(" my-order-list:倒计时结束，开始刷新页面")
            var id = e.detail
            // const result = await getOrderById(id);
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
            // updateOrderState(id, order.state, order.stateName);
        },
        /**
         * 触发
         * @param {*} e
         */
        onDeleteOrder(e) {
            console.log(" my-order-list 自定义组件", e)
            this.triggerEvent("onDeleteOrder", e.detail, {})
        },
        /**
         * 添加订单到购物车
         */
        // addToCart() {
        //     var order = this.data.order;
        //     var cart = wx.getStorageSync("cart") || [];
        //     cart = cart.concat(order.goodsList);
        //     wx.setStorageSync("cart", cart);
        //     wx.switchTab({
        //         url: '/pages/cart/cart'
        //     });
        // },
        /**
         * 申请售后
         * @param {订单id} id
         */
        async cancelOrApplayOrder(id) {
            console.log("my-order-list applyService")
            const reason = actions.find(a => a.name === this.data.radio)
            await cancelOrApplayOrder(id, 7, "申请售后", reason)
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
        }
    }
})
