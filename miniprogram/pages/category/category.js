import {getAllCategory, getGoodsListByCategory, getGoodsListSizeByCate} from "../../utils/dbUtil.js";

const db = wx.cloud.database();
const app = getApp().globalData;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 分类列表
        categoryList: [],
        // 商品列表
        goodsList: [],
        // 查询起始数
        skipNum: 0,
        // 每数据数量
        pageSize: 10,
        //分类id
        categoryId: "1",
        // 分类下的商品数量
        goodsSize: 0,
        // 是否还有商品
        isNext: true,
        activeKey: 1
    },
    // 全局变量
    pageData: getApp().data,
    // 分类缓存
    cateStorage: [],
    // 商品列表缓存
    goodsListStorage: [],
    // 分类缓存key
    CATEGORY_KEY: "cate",
    // 分类索引key
    CATEGORY_INDEX: "categoryId",
    // 是否下拉刷新
    isPullDown: false,
    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        // 获取分类总数
        // 获取缓存的 分类列表
        await this.getCategoryData();
        console.log("options", options)
        const categoryId = options.categoryId || '1';
        let goodsCount = await getGoodsListSizeByCate({
            collectionName: this.pageData.GOODS_LIST,
            categoryId: categoryId
        });
        // 获取分类下所有的商品列表
        const index = this.data.categoryList.findIndex(c => {
            console.log("c.categoryId->%s,categoryId->%s",c.categoryId,categoryId)
                return  c.categoryId === categoryId
            }
        )
        console.log("activeKey", index)
        this.setData({
            activeKey: index,
            categoryId: categoryId,
            goodsSize: goodsCount
        });
        this.getGoodsListByCategory(this.data.skipNum);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: async function () {
        this.getCategoryData();
        // const categoryId = this.data.categoryId;
        let goodsCount = await getGoodsListSizeByCate({
            collectionName: this.pageData.GOODS_LIST,
            categoryId: this.data.categoryId
        });
        // 获取分类下所有的商品列表
        this.setData({
            skipNum: 0,
            goodsSize: goodsCount,
            goodsList: []
        });
        this.getGoodsListByCategory(this.data.skipNum);
        wx.stopPullDownRefresh();
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            skipNum: 0
        })
        console.log("category监听页面显示");
        this.renewGoodsListBuyNum();
    },
    // 获取所有商品分类数据
    async getCategoryData() {
        console.log("全局变量", this.pageData)
        // 获取缓存的 分类列表
        const cateStorage = wx.getStorageSync(this.CATEGORY_KEY);
        if (!cateStorage || Date.now() - cateStorage.time > 1000 * 2) {
            console.log("分类缓存为空或者失效。获取新的数据")
            // 没有缓存
            const category = await getAllCategory(this.pageData.CATEGORY);
            console.log("获取商品分类：", category);
            wx.setStorageSync(this.CATEGORY_KEY, {time: Date.now(), data: category});
            this.setData({
                categoryList: category
            })
        } else {
            console.log("分类缓存有效。获取缓存中的数据")
            // 缓存有效
            this.setData({
                categoryList: cateStorage.data
            })
        }
    },

    // 获取某分类中的所有商品
    async getGoodsListByCategory(skipNum) {
        console.log("目标索引：%s,是否下拉：%s", skipNum, this.isPullDown)

        // 获取分类下所有的商品列表
        if (skipNum < this.data.goodsSize) {
            const goodsList = wx.getStorageSync(this.CATEGORY_INDEX.concat(this.data.categoryId));

            if (!goodsList || Date.now() - goodsList.time > 1000 * 2 || this.isPullDown) {
                console.log("商品列表缓存为空或失效，获取新的数据")
                // 商品列表
                const goodsList = await getGoodsListByCategory({
                    collectionName: this.pageData.GOODS_LIST,
                    skipNum: skipNum,
                    pageSize: this.data.pageSize,
                    categoryId: this.data.categoryId
                });
                console.log("成功从数据库中获取分类中的所有商品：", goodsList);
                wx.setStorageSync(this.CATEGORY_INDEX.concat(this.data.categoryId), {
                    time: Date.now(),
                    data: this.data.goodsList.concat(goodsList)
                })
                this.setData({
                    goodsList: this.data.goodsList.concat(goodsList),
                })
                this.isPullDown = false;
            } else {
                console.log("商品列表缓存有效，获取缓存中的数据")
                this.setData({
                    goodsList: goodsList.data
                })
            }
            // 更新商品购买数
            this.renewGoodsListBuyNum();

        } else {
            if (skipNum > this.data.pageSize) {
                this.setData({
                    isNext: false
                })
            }
        }
    },

    async onChange(e) {
        console.log(e)
        // 该分类下的商品数量
        const index = e.detail;
        const categoryId = this.data.categoryList[index].categoryId
        const goodsSize = await getGoodsListSizeByCate({
            collectionName: this.pageData.GOODS_LIST,
            categoryId: categoryId
        });
        this.isPullDown = false;
        this.setData({
            categoryId: categoryId,
            goodsSize: goodsSize,
            // 查询起始数
            skipNum: 0,
            // 每数据数量
            pageSize: 10,
            goodsList: [],
            isNext: true
        })
        this.getGoodsListByCategory(this.data.skipNum);
    },

    // 上拉加载
    async lower() {
        console.log("开始上拉加载");
        if (this.data.goodsList.length < this.data.goodsSize) {
            const skipNum = this.data.goodsList.length
            this.isPullDown = true;
            this.setData({
                skipNum: skipNum
            })
            this.getGoodsListByCategory(skipNum)
        } else {
            this.setData({
                isNext: false
            })
            console.log("目标索引大于商品列表数量")
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
        this.renewGoodsBuyNum(goodsList, index, buyNum);
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
        wx.setTabBarBadge({index: 2, text: app.cartCount.toString()})

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
    renewGoodsBuyNum(goodsList, index, buyNum) {
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
        if (cart) {
            // 购物车中有数据
            goodsList.map(g => g.buyNum = 0);
            cart.map(g => {
                const index = goodsList.findIndex(i => i._id === g._id);
                if (index != -1) {
                    goodsList[index].buyNum = g.buyNum;
                }
            })
            this.setData({goodsList})
        }
    }

})
