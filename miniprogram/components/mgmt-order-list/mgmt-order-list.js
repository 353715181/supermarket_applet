import {getOrderById, updateOrderState, cancelOrApplayOrder} from "../../utils/dbUtil.js";
import {queryWxOrder, tsFormatTime, enableTimer} from "../../utils/commonUtil.js";
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';

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
                    enableTimer(result._id, result.orderNo, result.createTimes, result.freePrice - 0)
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
                this.setData({order: result})

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
                url: '/pages/mgmtOrderDetail/mgmtOrderDetail?id=' + e.currentTarget.dataset.id
            });
        },


        /**
         * 接单
         * @param {订单数据} e
         */
        orderTaking(e) {
            console.log("mgmt-order 接单", e)
            const order = e.detail
            this.triggerEvent("orderTaking", order._id, {})
        },
        /**
         * 分拣完成
         * @param {订单数据} e
         */
        sorting(e) {
            console.log("mgmt-order 分拣完成", e)
            const order = e.detail
            this.triggerEvent("sorting", order._id, {})
        },
        /**
         * 开始配送
         * @param {订单数据} e
         */
        startDelivery(e) {
            console.log("mgmt-order 开始配送", e)
            const order = e.detail
            this.triggerEvent("startDelivery", order._id, {})
        },
        /**
         * 配送完成
         * @param {订单数据} e
         */
        finishDelivery(e) {
            console.log("mgmt-order 配送完成", e)
            const order = e.detail
            this.triggerEvent("finishDelivery", order._id, {})
        },
        /**
         * 受理完成
         * @param {订单数据} e
         */
        confirmHandle(e) {
            console.log("mgmt-order 受理完成", e)

            const order = e.detail
            this.triggerEvent("confirmHandle", order._id, {})
        },
        /**
         * 取消订单
         * @param {订单数据} e
         */
        cancelMgmtOrder(e) {
            console.log("mgmt-order 取消订单", e)
            const order = e.detail
            this.triggerEvent("cancelMgmtOrder", order._id, {})
        }
    }
})
