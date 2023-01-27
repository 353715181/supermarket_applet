import {checkToken, queryUserInfo} from "../../utils/commonUtil.js";
import {getWaitReceiveOrderCount, getWaitPayOrderCount} from "../../utils/dbUtil.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        waitPayNum: 0,
        waitReceive: 0,
        goldNum: 0,
        usedGold: 0,
        intransit: 0,
        shareNum: 0,
        userName: '',
        userPhone: ''
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
    onShow() {
        const token = wx.getStorageSync("token")
        console.log(" 用户页获取的token", token, token ? true : false)
        this.setData({isLogin: token ? true : false})
        this.initStateCount();
        this.initShareInfo();
        this.initUserInfo();
    },


    /**
     * 用户信息
     */
    initUserInfo() {
        const token = wx.getStorageSync("token");
        if (token) {
            const userName = token.phone.slice(-4)
            const userPhone = token.phone
            this.setData({
                userName: userName,
                userPhone: userPhone
            })
        }

    },

    /**
     * 初始化 代付款和待收货的数据
     */
    async initStateCount() {
        const token = wx.getStorageSync("token");
        console.log("token", token)
        if (token) {
            const openId = token.openId;
            console.log("当前openid", openId)
            const waitReceive = await getWaitReceiveOrderCount(openId);
            const waitPayNum = await getWaitPayOrderCount(openId);
            console.log(" 初始化 代付款和待收货的数据waitReceive,waitPayNum", waitReceive, waitPayNum)
            this.setData({
                waitReceive: waitReceive,
                waitPayNum: waitPayNum
            })
        }
    },
    /**
     * 初始化分享的数据
     */
    async initShareInfo() {
        const token = wx.getStorageSync("token");
        console.log("initShareInfo获取token", token)
        if (token) {
            const userInfo = await queryUserInfo()
            console.log(" 获取的用户信息", userInfo)
            if (userInfo && userInfo.length != 0) {
                this.setData({
                    shareNum: userInfo.shareNum || 0,
                    usedGold: userInfo.usedGold || 0,
                    goldNum: userInfo.goldNum || 0,
                    intransit: userInfo.intransit || 0
                })
            } else {
                this.setData({
                    shareNum: 0,
                    usedGold: 0,
                    goldNum: 0,
                    intransit: 0
                })
            }

        }
    },
    /**
     * 登陆
     */
    login(e) {
        console.log("登陆按钮")
        wx.navigateTo({
            url: '/pages/login/login'
        });
    },
    /**
     * 查询订单
     * @param {状态} e
     */
    queryOrder(e) {
        checkToken();
        console.log(" 查询订单状态:e", e)
        const {state} = e.currentTarget.dataset;
        wx.navigateTo({
            url: '../../pages/myOrder/myOrder?state=' + state

        })
    },
    /**
     * 加载地址页
     * @param {*} e
     */
    onAddress(e) {
        checkToken();
        wx.navigateTo({
            url: '../../pages/address/address?type=1'
        })
    },

    /**
     * 加载地址页
     * @param {*} e
     */
    onSetting(e) {
        checkToken();
        wx.navigateTo({
            url: '../../pages/seting/seting'
        })
    }
})
