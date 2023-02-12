import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
import {queryMgmt} from '../../utils/commonUtil'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isMgmt: false,
        level: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.checkMgmt()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    /**
     * 退出登陆
     */
    exit() {
        console.log(" 退出登陆")
        Dialog.alert({
            message: '确认退出登陆',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "确定"
        }).then(() => {
            console.log("点击确认按钮")
            wx.clearStorage();
            wx.navigateBack({
                delta: 1
            });
        }).catch(() => {
            console.log("点击取消按钮")
        });
    },

    /**
     * 校验是否为管理员
     */
    async checkMgmt() {
        const token = wx.getStorageSync("token");
        if (token && token.phone) {
            const result = await queryMgmt(token.phone)
            console.log("查询管理员信息结果->", result)
            // 方便演示 放开后门

            wx.setStorageSync("mgmt", result[0]);
            this.setData({
              isMgmt: true,
              level: 7
          })
            // 需要校验可以把 100-104 行代码删除 打开下面代码的注解
            // this.setData({
            //   isMgmt: true,
            //   level: result[0].level
            // })
            // if (result.length > 0) {
            //     wx.setStorageSync("mgmt", result[0]);
            //     this.setData({
            //         isMgmt: true,
            //         level: result[0].level
            //     })
            // }
        }
    },

    /**
     * 跳转到订单管理页面
     */
    toMgmtPage() {
        wx.redirectTo({
            url: '/pages/mgmtOrder/mgmtOrder?level=' + this.data.level
        });
    },
    /**
     * 跳转到商品管理页面
     */
    toMgmtGoods() {
        wx.redirectTo({
            url: '/pages/mgmtGoods/mgmtGoods'
        });
    }

})
