import {
    getAllData,
    getPageData,
    getShareOpenId,
    createShareRelation,
    getAllCategory
} from "../../utils/dbUtil.js";
import {getOpenId, updateUserInfo} from "../../utils/commonUtil.js";
import regeneratorRuntime, {async} from '../../utils/runtime.js';

const db = wx.cloud.database();
const app = getApp().globalData;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        active: 0,
        swiper: [],
        category: [],
        goodsList: [],
        skipNum: 0,
        pageSize: 4,
        isNext: true,
        goodsCount: 0,
        // 距离
        scrollTop: 0,
        scrollleft: 0, // 滚动条百分比距离
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {

        this.setData({
            goodsList: [],
            skipNum: 0,
            pageSize: 4,
            isNext: true
        })
        // 初始化 商品列表
        await this.getGoodsList(this.data.skipNum);
        console.log(options);
        // 初始化 轮播图
        await this.getSwiperData();
        // 初始化 分类信息
        await this.getCategoryData();

        console.log("options", options)
        if (options && options.shareId) {
            //弥补小程序码信息带错
            options.shareId = options.shareId === '17854900000' ? 'ohfwb4-41Xo_JOwOfsmF0VNHWgec' : options.shareId
            this.handleShare(options.shareId);
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },


    /**
     * 分享
     * @param {*} res
     */
    async onShareAppMessage(res) {
        // 来自页面内转发按钮
        const openId = await getOpenId()
        console.log(res.target)
        return {
            title: '商超（买菜购物用它更省钱）',
            path: '/pages/index/index?shareId=' + openId
        }
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function () {
        // const size = await getCollectionSize("goodsList");
        console.log("index监听页面显示")
        this.renewGoodsListBuyNum();
        if (app.cartCount > 0) {
            wx.setTabBarBadge({index: 2, text: app.cartCount.toString()})
        } else {
            wx.removeTabBarBadge({index: 2})
        }
    },

    onChange(event) {
        this.setData({active: event.detail});
    },
    // 搜索
    onSearch() {
        Toast('搜索' + this.data.value);
        console.log("搜索")
    },

    // 下拉刷新
    async onPullDownRefresh() {
        console.log("下拉刷新")
        this.setData({
            goodsList: [],
            skipNum: 0,
            pageSize: 4,
            isNext: true
        })
        // 初始化 轮播图
        await this.getSwiperData();
        // 初始化 分类信息
        await this.getCategoryData();
        this.getGoodsList(this.data.skipNum);
        wx.stopPullDownRefresh();
        console.log("停止下拉刷新")
    },

    // 上拉加载
    onReachBottom() {
        console.log("开始上拉加载");
        const skipNum = this.data.skipNum + this.data.pageSize;
        this.setData({
            skipNum: skipNum
        })
        this.getGoodsList(skipNum)
    },
    // 获取轮播图数据
    async getSwiperData() {
        const swipers = await getAllData("swiper");
        console.log("获取轮播图数据：", swipers);
        this.setData({
            swiper: swipers
        })

    },

    // 判断滚动距离
    onPageScroll: function (ev) {
        this.setData({
            scrollTop: ev.scrollTop
        })
    },

    // 获取商品分类数据
    async getCategoryData() {
        const category = await getAllCategory("category");
        console.log("获取商品分类：", category);
        this.setData({
            category: category
        })
    },

    //  获取商品列表
    async getGoodsList(skipNum) {
        console.log("集合数据总数：", this.data.goodsCount, skipNum)
        const goodsList = await getPageData({
            collectionName: "goodsList",
            skipNum: this.data.skipNum,
            pageSize: this.data.pageSize
        });
        if (this.data.skipNum !== 0 && goodsList.length === 0) {
            this.setData({
                isNext: false
            })
        } else {
            console.log("获取商品列表：%s", goodsList);
            const tempList = this.data.goodsList.concat(goodsList);
            console.log(tempList)
            this.setData({
                goodsList: this.data.goodsList.concat(goodsList)
            })
            this.renewGoodsListBuyNum();
        }
    },


    // 子传父组件数据
    handleBuyNum(e) {
        let goods = e.detail;
        console.log("子传父数据", goods)
        let buyNum = this.renewBuyNum(goods);
        console.log("更新缓存获取值", buyNum)
        let {goodsList} = this.data;
        const index = goodsList.findIndex(v => v._id === goods._id);
        this.renewGoodsListBuyCount(goodsList, index, buyNum);
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
        wx.setTabBarBadge({index: 2, text: app.cartCount.toString()})

    },
    // 更新缓存中的购买数
    renewBuyNum(e) {
        let goods = e;
        let cart = wx.getStorageSync("cart") || [];
        console.log("获取当前缓存", cart)
        let index = cart.findIndex(v => v._id === goods._id);
        console.log("当前商品所在缓存中的索引", index)
        if (index === -1) {
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
    renewGoodsListBuyCount(goodsList, index, buyNum) {
        console.log("开始更新集合->%o索引为->%s的购买数为->%s", goodsList, index, buyNum);
        goodsList[index].buyNum = buyNum;
        this.setData({goodsList})
    },

    /**
     * 更新商品列表的购买数
     */
    renewGoodsListBuyNum() {
        console.log("开始更新商品列表的购买数");
        let cart = wx.getStorageSync("cart");
        let {goodsList} = this.data;
        goodsList.map(g => g.buyNum = 0);
        if (cart) {
            // 购物车中有数据
            cart.map(g => {
                const index = goodsList.findIndex(i => i._id === g._id);
                if (index != -1) {
                    goodsList[index].buyNum = g.buyNum;
                }
            })
            this.setData({goodsList})
        }
    },


    /**
     * 获取用户信息
     * @param {string} shareOpenId
     */
    async handleShare(shareOpenId) {
        console.log("获取分享人的openId", shareOpenId)
        const openId = await getOpenId()
        console.log("获取用户的openId", openId)
        if (!openId || !shareOpenId) {
            return
        }
        //      1.根据用户openid判断该用户是否有分享人
        var shareId;
        shareId = wx.getStorageSync("shareOpenId");
        if (!shareId) {
            shareId = await getShareOpenId(openId)
            wx.setStorageSync("shareOpenId", shareOpenId);
        }
        console.log(" 准备绑定关联关系 shareId->{%s} shareOpenId->{%s} shareId->{%b}", shareId, shareOpenId, !shareId && shareOpenId !== openId)
        if (!shareId && shareOpenId && shareOpenId !== openId) {
            // 为空则说明该用户没有分享人，则可以与该分享人绑定关系
            await createShareRelation(openId, shareOpenId)
            // 分享人 受邀人数+1
            const resp = await updateUserInfo({openId: shareOpenId, shareNum: 1});
            console.log(" 分享人分享数量更新结果：", resp)
            // 分享人id存入缓存
            wx.setStorageSync("shareOpenId", shareOpenId);
        }
    },

    /**
     * 点击banner图
     * @param event
     */
    clickBanner(event) {
        console.log(" 点击banner图", event)
        const {url} = event.target.dataset
        if (url) {
            wx.navigateTo({
                url: url
            })
        }


    },

    /**
     * 获取对应的滚动值
     */
    getScrollData(e) {
        var query = wx.createSelectorQuery();
        var that = this; // 获取this
        let width = 0;
        let scrollLeft = 0;
        let scrollWidth = 0;
        let left = 0;
        query.select('.scroll-view').boundingClientRect(function (rect) {
            width = rect.width
            left = Math.ceil(e.detail.scrollLeft / (e.detail.scrollWidth - width) * 50) + '%'
            that.setData({
                scrollleft: left
            })
        }).exec()

    }
})
