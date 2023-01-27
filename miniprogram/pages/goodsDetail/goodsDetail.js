// pages/goodsDetail/goodsDetail.js
import {getGoodsDetail} from "../../utils/dbUtil.js";
import {addGoodsToCart, checkAndAddToCartResult, renewTabbarBuyCount} from "../../utils/sysUtil";

const app = getApp().globalData;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoSrc: '',
        videoImg: '',                                     //视频封面，缓冲时会出现黑屏，加视频封面会提升用户体验，但是ios手机封面图会闪现，不知道怎么解决
        autoplay: true,
        touchX: 0,                                        //手指按下时x的坐标
        touchY: 0,                                        //手指按下时y的坐标
        interval: null,                                   //计时器
        time: 0,                                          //按下到松开的时间
        current: 0,                                        //swiper的当前轮播图下标
        id: "",
        goodsDetail: {},
        picUrls: [],
        buyCount: 0,
        price:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        const goodsId = options.goodsId
        console.log(" 商品详情页 goodsId->%s", goodsId)
        this.initGoodsDetail(goodsId)
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
     * 初始化商品详情数据
     * @param goodsId
     * @returns {Promise<void>}
     */
    async initGoodsDetail(goodsId) {
        wx.showLoading({
            mask:true
        })
        const goodsDetail = await getGoodsDetail(goodsId)
        console.log(" goodsDetailPage initGoodsDetail goodsId->%s查询结果", goodsId, goodsDetail)
        const picUrls = goodsDetail.picUrls.split(',')
        console.log(" 获取的商品轮播图集合", picUrls)
        // const price=(goodsDetail.price*goodsDetail.discount*100).toFixed(0)/100
        const price=Math.floor(goodsDetail.price*goodsDetail.discount * 100) / 100
        this.setData({
            goodsDetail: goodsDetail,
            picUrls: picUrls,
            buyCount: app.cartCount,
            price:price
        })
        wx.hideLoading()
    },

    /**
     * 轮播图切换
     * @param e
     */
    swiperChange(e) {
        console.log(" swiperChange 轮播图切换", e.detail.current)
        this.setData({
            current: e.detail.current
        })
    },

    /**
     * 跳转到购物车页面
     */
    toCartPage(e) {
        console.log("跳转到购物车页面")
        wx.navigateTo({
            url: '/pages/cartPage/cartPage'
        })
    },

    /**
     * 点击加入购物车按钮
     */
    async onClickButton() {
        console.log("加入购物车")
        wx.showToast({
            mask:true,
            title:"添加成功",
            icon:"none",
            duration:500
        })
        const  result= await checkAndAddToCartResult(this.data.goodsDetail)
        if (!result){
            console.log(" 购物车加入失败，校验不通过",result)
            return
        }
        // 添加到购物车
        addGoodsToCart(this.data.goodsDetail)
        //更新tabbar购买数
        const count = await renewTabbarBuyCount();
        this.setData({
            buyCount: count
        });
    },


})
