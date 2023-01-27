import {getMgmtGoodsList, getAllCategory} from "../../utils/dbUtil";
import {checkToken} from "../../utils/commonUtil";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        goodsList: [],
        itemTitle: '筛选',
        option1: [
            {text: '默认排序', value: 'updateTime-desc'},
            {text: '按售价大小升序', value: 'price-asc'},
            {text: '按售价大小降序', value: 'price-desc'},
            {text: '按库存大小升序', value: 'inventory-asc'},
        ],
        orderBy: 'updateTime-desc',
        categoryValue: '',
        categoryOption: [],
        goodsName: '',
        skipNum: 0,
        pageSize: 10
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        this.initGoodsCategory()
        this.setData({
            goodsList: [],
            skipNum: 0,
            pageSize: 10,
            isNext: true,
        })
        this.getGoodsList()
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
        checkToken()
    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            goodsList: [],
            skipNum: 0,
            pageSize: 10,
            isNext: true,
        })
        this.getGoodsList()
        wx.stopPullDownRefresh();

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.setData({
            skipNum: this.data.skipNum + this.data.pageSize
        })
        this.getGoodsList()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 初始化商品分类
     * @returns {Promise<void>}
     */
    async initGoodsCategory() {
        const result = await getAllCategory()
        var category = [{text: '全部', value: ''}]
        result.map(r => {
            category.push({text: r.categoryName, value: r.categoryId})
        })
        this.setData({
            categoryOption: category
        })
    },

    //  获取商品列表
    async getGoodsList() {
        console.log("mgmtGoods集合数据总数：", this.data.goodsCount)
        var order = this.data.orderBy.split('-')
        const goodsList = await getMgmtGoodsList({
            skipNum: this.data.skipNum,
            pageSize: this.data.pageSize,
            goodsName: this.data.goodsName,
            orderBy: {key: order[0], value: order[1]},
            categoryValue: this.data.categoryValue
        });
        if (this.data.skipNum !== 0 && goodsList.length === 0) {
            wx.showToast({
                icon: "none",
                mask: true,
                title: "已经到底了",
                duration: 2500
            })
        }
        console.log("mgmtGoods获取商品列表：%s", goodsList);
        const tempList = this.data.goodsList.concat(goodsList);
        console.log(tempList)
        this.setData({
            goodsList: this.data.goodsList.concat(goodsList)
        })
    },

    /**
     * 选择排序
     */
    clickOrderBy(e) {
        console.log("选择排序：", e)
        this.setData({
            skipNum: 0,
            pageSize: 10,
            goodsList: []
        })
        this.getGoodsList()
    },
    /**
     * 跳转到商品添加页面
     */
    toAddGoods() {
        wx.navigateTo({
            url: '/pages/mgmtGoodsInfo/mgmtGoodsInfo?add=true'
        })
    },
    /**
     * 开始搜索
     */
    onConfirm() {
        this.setData({
            skipNum: 0,
            pageSize: 10,
            goodsList: []
        })
        this.getGoodsList();
        this.selectComponent('#item').toggle();

    },
    /**
     * 选择商品分类
     */
    clickCategory() {
        this.setData({
            skipNum: 0,
            pageSize: 10,
            goodsList: []
        })
        this.getGoodsList();
    }

})
