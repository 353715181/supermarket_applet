import { getAddressList,deleteById } from "../../utils/dbUtil.js";
import { checkToken } from "../../utils/commonUtil.js";
var util = require('../../utils/commonUtil.js');

const app = getApp().globalData;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressList: [],
        // 用来判断从哪里进来方便展示不同的样式
        type: '',
        radio: -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {

        const type = options.type || '';
        this.setData({ type })
        console.log(options)
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
        this.initAddressList();
    },

    onAdd(e) {
        wx.navigateTo({
            url: '/pages/addAddress/addAddress?type='+this.data.type
        });
    },
    /**
     * 初始化地址列表
     * @param {*} e 
     */
    async initAddressList() {
        const token= wx.getStorageSync("token");
        const openId = token.openId;
        console.log("当前用户的openid为", openId)
        if (!openId) {
            app.isLogin = false;
        } else {
            let addressList = await getAddressList(openId);
            console.log("用户地址列表:", addressList)
            const addr = wx.getStorageSync("checkedAddr");
            const radio = addr ? addressList.findIndex(v => v._id == addr._id) : "";
            this.setData({
                radio: radio,
                addressList: addressList
            })
        }
    },


    /**
     * 点击cell框
     * @param {*} e 
     */
    onClick(e) {
        console.log(e)
        if (this.data.type == 1) {
            return;
        }
        const { name } = e.currentTarget.dataset;
        this.setData({
            radio: name,
        });
        // 返回上一页
        var pages = getCurrentPages(); //当前页面
        var beforePage = pages[pages.length - 2]; //前一页
        var userInfo = this.data.addressList[name];
        wx.setStorageSync("checkedAddr", userInfo);

        wx.navigateBack({
            success: function () {
                beforePage.onLoad(); // 执行前一个页面的onLoad方法
            }
        });
    },


    /**
     * 修改收货地址
     * @param {*} id 
     */
    onEditAddr(e) {
        console.log("修改收货地址", e);
        var { id } = e.currentTarget.dataset;

    },
    /**
     *  删除购物车中的某商品
     * @param {商品信息} e 
     */
    onClose(e) {
        console.log("滑动", e);
        const { index } = e.target.dataset;
        const { position, instance } = e.detail;
        switch (position) {
            case 'right':
                this.deleteAddr(index)
                break;
        }
    },

    /**
     * 删除索引为index的商品
     * @param {列表中的索引} index 
     */
    async deleteAddr(index) {
        var addressList= this.data.addressList;
        const addr= addressList.splice(index,1);
        console.log("已删除商品:%o,索引%d,id->{%s}", addr, index,addr[0]._id);
        await deleteById({collectionName:"address",id:addr[0]._id});
        if(index==this.data.radio){
            this.setData({
                radio:-1
            })
            wx.setStorageSync("checkedAddr","");
        }
        this.setData({
            addressList:addressList
        })
    },
})