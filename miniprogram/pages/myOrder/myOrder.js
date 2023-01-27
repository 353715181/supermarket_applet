const app = getApp().globalData;
import {deleteById, pageMyOrder} from "../../utils/dbUtil.js";
import {checkToken} from "../../utils/commonUtil.js";
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';

const db = wx.cloud.database();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        active: "4",
        orderList: [],
        // 查询起始数
        skipNum: 0,
        // 每数据数量
        pageSize: 4,
        count: 0,
        openId: ""
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        console.log("开始加载页面")
        var active = options.state || "0";
        this.setData({
            active: active
        });
        const token = wx.getStorageSync('token');
        this.setData({
            orderList: [],
            skipNum: 0,
            openId: token.openId
        })
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
        this.setData({
            orderList: []
        })
        this.getMyOrder()

    },
    /**
     * 获取符合条件的订单列表
     */
    async getMyOrder() {
        const {skipNum, pageSize, active, openId} = this.data
        console.log("获取符合条件的订单列表 openId->%s, skipNum->%s, pageSize->%s,active->", openId, skipNum, pageSize, active)
        var orderList = await pageMyOrder(openId, skipNum, pageSize, active)

        if (orderList.length > 0) {
            this.setData({
                orderList: this.data.orderList.concat(orderList)
            })
        }
        wx.hideLoading()

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
        this.setData({
            active: event.detail.name,
            skipNum: 0,
            orderList: []
        })

        this.getMyOrder()
    },


    // 下拉刷新
    async onPullDownRefresh() {
        console.log("下拉刷新")

        this.setData({
            skipNum: 0,
            count: 0,
            active: this.data.active,
            orderList: []
        })

        this.getMyOrder()
        wx.stopPullDownRefresh();
        console.log("停止下拉刷新")
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
            var orderList = this.data.orderList.filter(function (x) {
                return x._id != e.detail;
            })
            console.log("过滤后的订单列表：", orderList)
            this.setData({
                orderList: orderList
            })
        }).catch(() => {
            console.log("点击取消按钮")
        });
    },

    // 上拉加载
    onReachBottom() {
        this.setData({
            skipNum: this.data.skipNum + this.data.pageSize
        })
        console.log("开始上拉加载 skipNum->%s,count->%s", this.data.skipNum, this.data.count);
        this.getMyOrder()

    },


})
