import {updateMgmtOrder, queryApplyInfo, updateApplyInfo, refundOrder, getOrderNo} from "../../utils/commonUtil.js";
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
    lifetimes: {
        ready() {
            console.log("order-button ready data :", this.data.order)
            if (!this.data.order) {
                this.ready()
            }
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        time: 0,
        timerName: '',
        showActionSheet: false,
        pay: false,
        showServiceInfo: false,
        apply: {},
        showHandle: false,
        operateType: 'allRefund',
        //    部分退款金额
        partPrice: '',
        remarks: '',
        showConfirmButton: false
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 拨打电话
         */
        onCall() {
            wx.makePhoneCall({
                phoneNumber: this.data.order.receivePhone
            })
        },
        /**
         * 接单按钮
         */
        async orderTaking() {
            wx.showLoading({mask: true})
            var order = {}
            const token = wx.getStorageSync("token")
            const id = this.data.order._id
            order.takingPhone = token.phone
            order.takingTime = new Date().getTime()
            order.state = 3
            order.stateName = "商家已接单,订单打包中"
            await updateMgmtOrder(id, order)
            this.triggerEvent("orderTaking", this.data.order, {})
        },
        /**
         * 打包完成
         */
        async sorting() {
            wx.showLoading({mask: true})
            var order = {}
            const token = wx.getStorageSync("token")
            const id = this.data.order._id
            order.sortingPhone = token.phone
            order.sortingTime = new Date().getTime()
            order.state = 4
            order.stateName = "订单打包完成,待配送"
            await updateMgmtOrder(id, order)
            this.triggerEvent("sorting", this.data.order, {})
        },
        /**
         * 开始配送
         */
        async startDelivery() {
            wx.showLoading({mask: true})
            var order = {}
            const token = wx.getStorageSync("token")
            const id = this.data.order._id
            order.orderNo = this.data.order.orderNo
            order.startDeliveryPhone = token.phone
            order.startDeliveryTime = new Date().getTime()
            order.state = 5
            order.stateName = "订单开始配送,请耐心等待"
            await updateMgmtOrder(id, order)
            this.triggerEvent("startDelivery", this.data.order, {})
        },
        /**
         * 配送完成
         */
        async finishDelivery() {
            wx.showLoading({mask: true})
            var order = {}
            const token = wx.getStorageSync("token")
            const id = this.data.order._id
            order.finishDeliveryPhone = token.phone
            order.finishDeliveryTime = new Date().getTime()
            order.state = 6
            order.stateName = "订单已送达,谢谢惠顾"
            await updateMgmtOrder(id, order)
            this.triggerEvent("finishDelivery", this.data.order, {})
        },
        /**
         * 查看售后信息
         * @returns {Promise<void>}
         */
        async queryApplyServiceInfo() {
            wx.showLoading({mask: true})
            const result = await queryApplyInfo(this.data.order._id)
            this.setData({
                showServiceInfo: true,
                apply: result[0]
            })
            wx.hideLoading()
        },
        /**
         * 关闭弹窗
         */
        onCloseServiceInfo(event) {

            this.setData({showServiceInfo: false});

        },
        /**
         * 点击图片
         */
        clickImg(e) {
            console.log("点击图片", e)
            const imgUrl = this.data.apply.imgList.map(img => {
                return img.url
            })
            const current = e.currentTarget.dataset.url
            console.log(" 点击图片", imgUrl, current)
            if (current && imgUrl.length > 0) {
                wx.previewImage({
                    current: current,
                    urls: imgUrl
                });
            }

        },
        /**
         * 切换操作类型
         * @param event
         */
        onChange(event) {
            console.log("切换操作类型", event.detail)
            this.setData({
                operateType: event.detail,
            });
        },
        /**
         * 打开受理窗口
         */
        showHandle() {
            this.setData({
                showHandle: true,
                partPrice: this.data.order.payPrice
            })

        },

        /**
         * 改变触发
         */
        onChangeParam() {
            this.setData({
                showConfirmButton: this.checkParam()
            })
        },

        /**
         * 校验提交参数
         */
        checkParam() {
            console.log("提交处理结果")
            const {operateType, partPrice, remarks} = this.data
            if (operateType === "partRefund" && (partPrice - 0 <= 0 || partPrice - 0 > this.data.order.payPrice)) {
                wx.showToast({
                    title: "退款金额不能为空且不能大于订单实付金额",
                    mask: true,
                    duration: 2500,
                    icon: "none"
                })
                return false
            }
            if (!remarks) {
                wx.showToast({
                    title: "请填写受理结果",
                    mask: true,
                    duration: 2500,
                    icon: "none"
                })
                return false
            }
            return true
        },

        /**
         * 关闭受理页面
         */
        onCloseDialog(event) {
            // 异步关闭弹窗
            this.setData({
                showHandle: false
            })

        },
        /**
         * 确认处理
         */
        async confirmHandle() {
            wx.showLoading({mask: true})
            const {operateType, remarks, partPrice, order} = this.data
            const id = order._id
            //如果是退款先申请退款
            const paramData = {}
            const refundNo = getOrderNo()
            if (operateType === 'allRefund' || operateType === 'partRefund') {
                //退款
                const refundResult = await refundOrder({
                    orderNo: order.orderNo,
                    payPrice: order.payPrice * 100,
                    refundPrice: partPrice * 100,
                    refundNo: refundNo
                })
                console.log("退款结果:", refundResult)
                paramData.partPrice = partPrice
            }
            //更新用户售后申请数据
            paramData.operateType = this.data.operateType
            paramData.remarks = remarks
            const updateApplyResult = await updateApplyInfo(id, paramData)
            console.log("售后申请结果:", updateApplyResult)
            //更新用户订单状态
            const orderParam = {}
            if (operateType === 'allRefund' || operateType === 'partRefund') {
                orderParam.state = 8
                orderParam.stateName = '商家已受理:' + remarks
                orderParam.refundNo = refundNo
                orderParam.refundPrice = partPrice
            }
            const token = wx.getStorageSync("token")
            orderParam.handlePhone = token.phone
            orderParam.handleTime = new Date().getTime()
            const updateOrderResult = await updateMgmtOrder(id, orderParam)
            console.log("修改订单状态结果", updateOrderResult)
            this.triggerEvent("confirmHandle", order, {})
            wx.hideLoading()
        },
        /**
         * 取消订单
         */
        async cancelMgmtOrder() {
            Dialog.alert({
                message: '确定取消订单吗？',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "确定"
            }).then(async () => {
                wx.showLoading({mask: true})
                const {partPrice, order} = this.data
                const id = order._id
                //如果是退款先申请退款
                const paramData = {}
                const refundNo = getOrderNo()
                //退款
                const refundResult = await refundOrder({
                    orderNo: order.orderNo,
                    payPrice: order.payPrice * 100,
                    refundPrice: order.payPrice * 100,
                    refundNo: refundNo
                })
                console.log("退款结果:", refundResult)
                paramData.partPrice = partPrice
                //更新用户订单状态
                const orderParam = {}
                orderParam.state = 0
                orderParam.stateName = '订单已被商家取消(退款预计1-5个工作日内退回)'
                orderParam.refundNo = refundNo
                orderParam.refundPrice = order.payPrice
                const token = wx.getStorageSync("token")
                orderParam.cancelPhone = token.phone
                orderParam.cancelTime = new Date().getTime()
                const updateOrderResult = await updateMgmtOrder(id, orderParam)
                console.log("取消订单状态结果", updateOrderResult)
                this.triggerEvent("cancelMgmtOrder", order, {})
                wx.hideLoading()
            }).catch(() => {
                console.log("点击取消按钮")
            });
        }


    }
})
