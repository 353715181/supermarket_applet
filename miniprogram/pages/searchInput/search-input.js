const watch = require("../../utils/dataUtil.js");
import { searchDataByPage } from "../../utils/dbUtil.js";
const app = getApp().globalData;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsList: [],
        isShowCancel: false,
        tagList: [],
        keyWords: ""
    },

    skipNum: 0,
    pageSize: 6,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var tagList = wx.getStorageSync("tagList");
        this.setData({ tagList });
        watch.setWatcher(this);
        // if (this.data.goodsList.length > 0) {

        //     this.renewGoodsListBuyNum();
        // }

    },
    /**
     * 搜索
     * @param {} e
     */
    async onSearch(e) {
        console.log("开始搜索", e)
        const value = this.data.keyWords;
        var goodsList = await searchDataByPage({ collectionName: "goodsList", keyWords: value, skipNum: this.skipNum, pageSize: this.pageSize });
        console.log("搜索到的商品：", goodsList)
        this.addTag(value);
        if (goodsList.length > 0) {
            goodsList = this.renewGoodsBuyNum(goodsList);
        }
        this.setData({ goodsList })

    },

    // 上拉加载
    async onReachBottom() {
        console.log("开始上拉加载");
        this.skipNum = this.skipNum + this.pageSize;
        // TODO
        const value = this.data.keyWords;
        var goodsList = await searchDataByPage({ collectionName: "goodsList", keyWords: value, skipNum: this.skipNum, pageSize: this.pageSize });
        goodsList = this.renewGoodsBuyNum(goodsList);
        goodsList = this.data.goodsList.concat(goodsList);
        this.setData({
            goodsList
        })
    },

    /**
     * 点击取消按钮
     * @param {} e
     */
    onCancel(e) {

            var pages = getCurrentPages(); //当前页面
            var beforePage = pages[pages.length - 2]; //前一页
            wx.navigateBack({
                success: function() {
                    beforePage.onLoad(); // 执行前一个页面的onLoad方法
                }
            });


    },


    /**
     * 添加标签
     * @param {标签值} value
     */
    addTag(value) {
        console.log("添加标签", value)
        var tagList = this.data.tagList || [];
        console.log("tagList", tagList)
        tagList[tagList.length] = value;
        this.setData({ tagList: this.unique(tagList) });
        // wx.setStorageSync("tagList", tagList);
    },
    /**
     * 取消标签
     * @param {} e
     */
    onClose(e) {
        console.log("取消标签", e)
        var tagList = this.data.tagList;
        const { index } = e.currentTarget.dataset;
        tagList.splice(index, 1);
        console.log("删除后的标签集合", tagList);
        // wx.setStorageSync("tagList", tagList);
        this.setData({
            tagList
        })
    },
    /**
     * 监听数据变化
     */
    watch: {
        tagList: function(newValue, oldValue) {
            console.log("开始更新标签列表:newValue->%o,oldValue->%o", newValue, oldValue);
            wx.setStorageSync("tagList", newValue);
        },
        keyWords: function(newValue, oldValue) {
            console.log("搜索值变化:newValue=>%o,oldValue=>%o", newValue, oldValue)
            if (newValue.length == 0) {
                this.setData({ goodsList: [] })
                this.skipNum = 0;
            } else {
                this.skipNum = 0;
            }
        }
    },
    /**
     * 清空所有标签
     * @param {} e
     */
    clearAllTag(e) {
        this.setData({
            tagList: []
        })
    },
    /**
     * 选择标签
     * @param {*} e
     */
    chooseTag(e) {
        console.log("选择标签", e);
        const { value } = e.currentTarget.dataset;
        this.setData({
            keyWords: value
        })
        this.onSearch(value);
    },


    /**
     * 数组去重保证集合内数据的唯一性
     * @param {集合} list
     */
    unique(list) {
        return Array.from(new Set(list));
    },
    // 子传父组件数据
    handleBuyNum(e) {
        let goods = e.detail;
        console.log("子传父数据", goods)
        let buyNum = this.renewBuyNum(goods);
        console.log("更新缓存获取值", buyNum)
        let { goodsList } = this.data;
        console.log("本地商品列表：", goodsList)
        const index = goodsList.findIndex(v => v._id === goods._id);
        this.renewGoodsListBuyNum(index, buyNum, goodsList);
        //  弹窗提示
        wx.showToast({
            duration: 500,
            title: '添加成功',
            icon: 'none',
            // true 防止用户 手抖 疯狂点击按钮
            mask: true
        });
        // 商品购买数+1
        app.cartCount += 1;
        console.log("app.cartCount", app)

    },
    // 更新缓存中的购买数
    renewBuyNum(e) {
        let goods = e;
        let cart = wx.getStorageSync("cart") || [];
        console.log("获取当前缓存", cart)
        let index = cart.findIndex(v => v._id === goods._id);
        console.log("当前商品所在缓存中的索引", index)
        if (index == -1) {
            goods.buyNum = 1;
            cart.push(goods)
        } else {
            cart[index].buyNum++;
            goods = cart[index]
        }
        wx.setStorageSync("cart", cart);
        return goods.buyNum;
    },
    /**
     * 更新数据集合中的购买数
     * @param {*} goodsList 商品集合
     * @param {*} index 更新商品的索引
     * @param {*} buyNum 更新的购买数
     */
    renewGoodsListBuyNum(index, buyNum, goodsList) {
        console.log("开始更新集合->%o索引为->%s的购买数为->%s", goodsList, index, buyNum);
        goodsList[index].buyNum = buyNum;
        this.setData({ goodsList })
    },


    /**
     * 更新商品列表的购买数
     */
    // renewGoodsListBuyNum() {
    //     console.log("开始更新商品列表的购买数", goodsList);
    //     let cart = wx.getStorageSync("cart");
    //     console.log("本地数据:", this.data)
    //     var goodsList = this.data.goodsList;
    //     console.log("获取到页面数据:", goodsList)
    //     goodsList.map(g => g.buyNum = 0);
    //     if (cart) {
    //         // 购物车中有数据
    //         cart.map(g => {
    //             const index = goodsList.findIndex(i => i._id === g._id);
    //             if (index != -1) {
    //                 goodsList[index].buyNum = g.buyNum;
    //             }
    //         })
    //         this.setData({ goodsList })
    //     }
    // },
    /**
     * 更新传入商品集合中的商品购买数量
     */
    renewGoodsBuyNum(goodsList) {
        // console.log("开始更新商品列表的购买数",goodsList);
        let cart = wx.getStorageSync("cart");
        // console.log("本地数据:",this.data)
        // var goodsList = this.data.goodsList;
        console.log("获取到页面数据:", goodsList)
        goodsList.map(g => g.buyNum = 0);
        console.log(" 购物车购买数量遍历完毕",goodsList)
        if (cart) {
            // 购物车中有数据
            cart.map(g => {
                const index = goodsList.findIndex(i => i._id === g._id);
                if (index != -1) {
                    goodsList[index].buyNum = g.buyNum;
                }
            })
        }
        return goodsList;
    }


})
