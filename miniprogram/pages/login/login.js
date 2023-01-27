// pages/login/login.js
import {updateUserInfo} from "../../utils/commonUtil";

Page({

    /**
     * 页面的初始数据
     */
    data: {},

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
     * 获取用户手机号
     * @param {*} e
     */
    getPhoneNumber(e) {
        console.log(" 获取用户手机号响应", e)
        wx.showLoading({mask: true})
        wx.cloud.callFunction({
            name: 'myFunction',
            data: {
                weRunData: wx.cloud.CloudID(e.detail.cloudID), // 这个 CloudID 值到云函数端会被替换
            }
        }).then(res => {

            console.log("明文res:", res);
            var openid = res.result.openid;
            var phone = res.result.event.weRunData.data.phoneNumber;
            wx.setStorageSync("token", {"openId": openid, "phone": phone});
            updateUserInfo({openId: openid, phone: phone});

            var pages = getCurrentPages(); //当前页面
            var beforePage = pages[pages.length - 2]; //前一页
            wx.navigateBack({
                success: function () {
                    beforePage.onLoad(); // 执行前一个页面的onLoad方法
                }
            });
        })
    }
})
