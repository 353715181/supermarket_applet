const app = getApp().globalData;
// import { PageAllOrder, PageWaitPayOrder, PageWaitReceiveOrder, getAllOrderCount, getWaitPayOrderCount, getWaitReceiveOrderCount, deleteById, PageApplyServiceOrder, getApplyServiceOrderCount } from "../../utils/dbUtil.js";
const db = wx.cloud.database();
import {checkToken, queryMgmtOrder} from "../../utils/commonUtil.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        active: "2",
        orderList: [],
        // 查询起始数
        skipNum: 0,
        // 每数据数量
        count: 0,
        // 管理员等级
        level: 0,
        //状态数据统计
        stateCount: '',
        //待接单数量
        waitTakingCount: 0,
        //待打包数量
        waitSortingCount: 0,
        //待配送
        waitDeliveryCount: 0,
        //配送中
        deliveryingCount: 0,
        //待售后
        applyServiceCount: 0,
        //配送完成
        deliveryCount: 0,
        stateMap: []

    },
    pageSize: 3,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("开始加载页面", options)
        const {level} = options
        this.setData({
            level: level
        });

    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    async onShow() {
        console.log(" 开始执行 onShow")
        checkToken();
        const mgmt = wx.getStorageSync('mgmt');
        // 初始化管理订单
        this.getInitMgmtOrder(this.data.active)
    },


    /**
     * 切换tab
     * @param {*} event
     */
    onChange(event) {
        wx.showLoading({
            mask: true
        })
        console.log("切换tab", event)
        const {name} = event.detail
        this.setData({
            active: name,
            skipNum: 0,
            orderList: []
        })
        this.getInitMgmtOrder(name)
    },
    /**
     * 初始化订单列表
     * @param {订单状态} state
     */
    async getInitMgmtOrder(state) {
        const result = await queryMgmtOrder(state, 0, this.pageSize) || []
        console.log("管理订单页面查询的结果", result)
        const {countMap, data} = result
        const index = countMap.findIndex(c => c._id === this.data.active - 0)
        let count = 0
        if (index > -1) {
            count = countMap[index].count
        }
        console.log("命中后返回的", count)
        let stateMap = new Map()
        for (var i = 2; i < 9; i++) {
            const index = countMap.findIndex(c => c._id === i)
            if (index < 0) {
                stateMap.set(i, 0)
            } else {
                stateMap.set(i, countMap[index].count)
            }
        }
        console.log("获取到的stateMap", stateMap, stateMap.get(2))
        this.setData({
            orderList: data,
            count: count,
            waitTakingCount: stateMap.get(2),
            waitSortingCount: stateMap.get(3),
            waitDeliveryCount: stateMap.get(4),
            deliveryingCount: stateMap.get(5),
            applyServiceCount: stateMap.get(7),
            deliveryCount: stateMap.get(6),
            stateMap: stateMap

        })
        wx.hideLoading()
    },


    /**
     * 下拉刷新
     * @returns {Promise<void>}
     */
    onPullDownRefresh() {
        this.getInitMgmtOrder(this.data.active)
        wx.stopPullDownRefresh()
    },


    /**
     * 上划加载订单列表
     */
    async onReachBottom() {
        var {skipNum, count} = this.data;
        console.log("开始上拉加载 skipNum->%s,count->%s", skipNum, count);
        if (this.data.orderList.length < count) {
            skipNum = this.data.orderList.length - 1
            const result = await queryMgmtOrder(this.data.active, skipNum, this.pageSize)
            const countMap = result.countMap
            const index = countMap.findIndex(c => c._id === this.data.active - 0)

            console.log(" 数量map", countMap, index)
            this.setData({
                orderList: this.data.orderList.concat(result.data),
                count: index > 0 ? countMap[index].count : 0
            })
        } else {
            console.log(" 数据已全部加载完成")
            wx.showToast(
                {
                    title: "已经到底了",
                    duration: 1500,
                    icon: "none"
                }
            )
        }
    },

    /**
     * 接单
     */
    orderTaking(e) {
        wx.showLoading({mask: true})
        console.log("mgmtOrder 接单", e)
        const orderList = this.data.orderList.filter(o => o._id !== e.detail)
        this.setData({
            orderList
        })
        wx.hideLoading()
    },

    /**
     * 打包完成
     */
    sorting(e) {
        wx.showLoading({mask: true})
        console.log("mgmtOrder 打包完成", e)
        const orderList = this.data.orderList.filter(o => o._id !== e.detail)
        this.setData({
            orderList
        })
        wx.hideLoading()
    },

    /**
     * 开始配送
     */
    startDelivery(e) {
        wx.showLoading({mask: true})
        console.log("mgmtOrder 开始配送", e)
        const orderList = this.data.orderList.filter(o => o._id !== e.detail)
        this.setData({
            orderList
        })
        wx.hideLoading()
    },

    /**
     * 配送完成
     */
    finishDelivery(e) {
        wx.showLoading({mask: true})
        console.log("mgmtOrder 配送完成", e)
        const orderList = this.data.orderList.filter(o => o._id !== e.detail)
        this.setData({
            orderList
        })
        wx.hideLoading()
    },

    /**
     * 售后已受理
     */
    confirmHandle(e) {
        wx.showLoading({mask: true})
        console.log("mgmtOrder 售后已受理", e)
        const orderList = this.data.orderList.filter(o => o._id !== e.detail)
        this.setData({
            orderList
        })
        wx.hideLoading()
    },
    /**
     * 商家取消订单
     */
    cancelMgmtOrder(e) {
        wx.showLoading({mask: true})
        console.log("mgmtOrder 商家取消订单->%o", e)
        const orderList = this.data.orderList.filter(o => {
            console.log("o.id->", o._id)
            return o._id !== e.detail
        })
        console.log("商家取消订单 后订单集合", orderList)
        this.setData({
            orderList
        })
        wx.hideLoading()
    }

})
