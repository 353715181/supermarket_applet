const db = wx.cloud.database();
import { addAddressInfo } from "../../utils/dbUtil.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userName: "",
        showPopup: false,
        columns: ['地址一', '地址二', '地址三',
            '地址四', '地址五', '地址六','地址七','地址八'
        ],
        address: "",
        userPhone: "",
        // isMain: false,
        roomNum: "",
        isSubmit: true,
        phoneCheckMsg: "",
        type: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const type = options.type || '';
        this.setData({ type })
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
     * 提交并保存收货地址
     * @param {} e
     */
    async onSubmit(e) {
        // 校验用户手机号
        if (!(/(^\d{11}$)/.test(this.data.userPhone))) {
            wx.showToast({
                duration: 2000,
                title: '手机格式有误',
                icon: 'none',
                // true 防止用户 手抖 疯狂点击按钮
                mask: true
            });
            return;
        }
        // 保存用户地址
        await addAddressInfo({ userName: this.data.userName, userPhone: this.data.userPhone, address: this.data.address, roomNum: this.data.roomNum });
        if (this.data.type != 1) {
            wx.setStorageSync("checkedAddr", { userName: this.data.userName, userPhone: this.data.userPhone, address: this.data.address, roomNum: this.data.roomNum });
        }
        var pages = getCurrentPages(); //当前页面
        var backNum = this.data.type == 1 ? 1 : 2;
        console.log("backNum",backNum)
        // var beforePage = pages[pages.length - backNum]; //前一页
        wx.navigateBack({
            delta: backNum
        });
    },
    /**
     * 选择是否为默认地址
     * @param {*} detail
     */
    isMain({ detail }) {
        // 需要手动对 checked 状态进行更新
        console.log(detail)
        this.setData({ isMain: detail });
    },
    /**
     * 点击选择地址
     * @param {*} e
     */
    onClickAddress(e) {
        this.setData({
            showPopup: !this.data.showPopup
        })
    },

    /**
     * 确认收货地址
     * @param {*} event
     */
    onConfirmAddress(event) {
        const { value } = event.detail;
        this.setData({
            address: value,
            showPopup: !this.data.showPopup
        })
    },
    /**
     * 点击取消按钮
     */
    onCancelAddress() {
        this.setData({
            showPopup: !this.data.showPopup
        })
    },
    /**
     * 校验手机号
     * @param {输入框的值，输入内容的长度} e
     */
    onCheckSubmit(e) {
        let isSubmit = false;
        console.log(e)
        // 校验名称
        if (this.data.userName.length < 1) {
            isSubmit = true;
        }
        // 校验手机号
        if (this.data.userPhone.length < 1) {
            isSubmit = true
        }
        // 校验地址
        if (this.data.address.length < 1) {
            isSubmit = true;
        }
        // 校验门牌号
        if (this.data.roomNum.length < 1) {
            isSubmit = true;
        }
        this.setData({
            isSubmit
        })
    },


})
