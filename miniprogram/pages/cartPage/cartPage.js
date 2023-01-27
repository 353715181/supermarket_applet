import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
import {getGoodsByIds, getPageData} from "../../utils/dbUtil.js";
import {checkGoodsNum,updateUserInfo} from "../../utils/commonUtil.js";

const watch = require("../../utils/dataUtil.js");
const db = wx.cloud.database();
const app = getApp().globalData;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cart: [],
        result: [],
        goodsList: [],
        // 查询起始索引
        skipNum: 0,
        // 每页大小
        pageSize: 4,
        // 是否还有内容
        isNext: true,
        // 商品列表中的总商品数
        goodsCount: 0,
        // 是否全选 0: 否 1: 是
        radio: '0',
        // 总费用 单位：分
        cost: 0,
        // 购买商品数总和
        buySum: 0,
        // 是否登陆
        isLogin: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        console.log("cart开始加载页面")
        this.onAllClick()
        watch.setWatcher(this);
        this.initGoodsList();

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: async function () {
        this.setData({
            goodsList: []
        });
        this.initGoodsList();
        wx.stopPullDownRefresh();
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
        this.checkLogin();
        const checkResult = wx.getStorageSync("checkResult");
        let cart = wx.getStorageSync("cart") || [];
        this.renewRadio(cart, checkResult);
        this.renewCartGoodsInfo(cart)
        this.setData({
            result: checkResult
        })
    },
    /**
     * 更新购物车中的商品信息
     * @param cart
     */
    async renewCartGoodsInfo(cart) {
        //    更新购物车中商品的数据
        if (!cart || cart.length === 0) {
            this.setData({
                cart: []
            })
            return
        }
        let ids = cart.map(c => {
            return c._id
        })
        console.log("购物中的商品id集合", ids)
        const goodsList = await getGoodsByIds(ids)
        console.log("购物中的商品", goodsList)
        let newCart = []
        goodsList.map(g => {
            //获取购物车中商品索引
            const index = cart.findIndex(c => c._id === g._id)
            if (g.isSale === '1' && index > -1 && g.inventory > 0) {
                g.buyNum = cart[index].buyNum
                g.isBuy = cart[index].isBuy
                g.price = Math.floor(g.price*g.discount * 100) / 100
                newCart.push(g)
            } else if (index > -1) {
                cart.splice(index, 1)
            }
        })
        wx.setStorageSync('cart', cart)
        this.setData({
            cart: newCart
        })
    },
    /**
     * 复选框
     */
    onCheckBok(e) {
        console.log("触发复选框", e)
        const result = e.detail;
        this.setData({
            result: result
        });
        const cart = wx.getStorageSync("cart");
        this.renewCost(cart, result)
        this.renewRadio(cart, result)
    },
    /**
     *  修改商品数量
     * @param {信息} e
     */
    onChange(e) {
        console.log("商品数量发生变化", e)
        // 修改后的数量
        const count = e.detail;
        let {index} = e.currentTarget.dataset;
        // 修改的商品索引
        this.editGoodsBuyNum(index, count);
        if (count < 1) {
            // 弹出 确认提示框。确认后删除
            this.showDeleteDialog(index, count);
        }
    },
    /**
     * 初始化商品列表
     */
    async initGoodsList() {
        this.setData({
            goodsList: [],
            skipNum: 0,
            pageSize: 4,
            isNext: true,
        })
        // 初始化 商品列表
        this.getGoodsList(this.data.skipNum);
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
    //  获取商品列表
    async getGoodsList(skipNum) {
        console.log("集合数据总数：", this.data.goodsCount)
        const goodsList = await getPageData({
            collectionName: "goodsList",
            skipNum: this.data.skipNum,
            pageSize: this.data.pageSize
        });
        if (this.data.skipNum > 0 && goodsList.length === 0) {
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
    /**
     * 获取点击数据
     * @param {} e
     */
    checkBox(e) {
        console.log("选择", e)
        let result = this.data.result;
        const {name} = e.currentTarget.dataset;
        console.log("获取到的id", name)
        const index = result.findIndex(r => r == name);
        if (index > -1) {
            result.splice(index, 1);
        } else {
            result.push(name);
        }
        this.setData({result})
        this.renewCost(this.data.cart, result)
    },
    /**
     * 更新商品列表的购买数
     */
    renewGoodsListBuyNum() {
        let cart = wx.getStorageSync("cart");
        console.log("开始更新商品列表的购买数", cart);
        let {goodsList} = this.data;
        goodsList.map(g => g.buyNum = 0);
        var buySum = 0;
        if (cart) {
            // 购物车中有数据
            cart.map(g => {
                const index = goodsList.findIndex(i => i._id === g._id);
                if (index != -1) {
                    goodsList[index].buyNum = g.buyNum;
                }
                buySum += g.buyNum;
            })
            this.setData({goodsList, buySum})
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
        this.renewGoodsListBuyNum(goodsList, index, buyNum);
        //  弹窗提示
        wx.showToast({
            duration: 500,
            title: '添加成功',
            icon: 'none',
            // true 防止用户 手抖 疯狂点击按钮
            mask: true
        });
        const checkResult = wx.getStorageSync("checkResult");
        let cart = wx.getStorageSync("cart");
        this.renewRadio(cart, checkResult);
        this.setData({
            cart: cart,
            result: checkResult
        })
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
     *  删除购物车中的某商品
     * @param {商品信息} e
     */
    onClose(e) {
        console.log("滑动", e);
        const {index} = e.target.dataset;
        const {position, instance} = e.detail;
        switch (position) {
            case 'right':
                this.deleteGoodsFromCart(index)
                break;
        }
    },
    /**
     * 显示删除确认框
     * @param {商品在购物车中的索引} index
     * @param {当前商品数量} currentNum
     */
    showDeleteDialog(index, currentNum) {
        console.log("想要删除的商品索引：%s,删除时的商品数量:%s", index, currentNum);
        Dialog.alert({
            message: '确定删除该商品吗？',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "确定"
        }).then(() => {
            console.log("点击确认按钮", index)
            this.deleteGoodsFromCart(index)
        }).catch(() => {
            console.log("点击取消按钮", index)
            if (currentNum < 1) {
                this.editGoodsBuyNum(index, 1)
            }

        });
    },

    /**
     * 点击步长器 加号 按钮触发
     * @param {*} e
     */
    plus(e) {
        console.log("通过点击步长器 加号 触发：", e)
        const {index} = e.target.dataset
        checkGoodsNum(this.data.cart[index])
    },

    /**
     * 点击步长器 减号 按钮触发
     * @param {包含索引和该商品数量信息} e
     */
    minus(e) {
        console.log("通过点击步长器 减号 触发：", e)
        const {index} = e.currentTarget.dataset;
        console.log("索引为%s的商品数量 - 1", index)
    },
    /**
     * 删除索引为index的商品
     * @param {列表中的索引} index
     */
    deleteGoodsFromCart(index) {
        let cart = wx.getStorageSync("cart");
        const goods = cart.splice(index, 1);
        console.log("已删除商品:%o,索引%d", goods, index);
        wx.setStorageSync("cart", cart);
        this.renewResult(goods[0]._id)
        this.setData({
            cart
        })
    },

    /**
     * 更新result的值
     * @param {*} value
     */
    renewResult(value) {
        console.log("删除已选中的商品id：%s", value);
        let {result} = this.data;
        console.log("result删除前", result)
        let resultIndex = result.findIndex(r =>
            r == value
        );
        console.log("获取到删除的以选中的商品的索引：", resultIndex)
        if (resultIndex > -1) {
            result.splice(resultIndex, 1);
            this.setData({
                result
            })
        }
    },

    /**
     * 修改商品购买数量
     * @param {目标索引} index
     * @param {当前值} currentNum
     */
    editGoodsBuyNum(index, currentNum) {
        console.log("修改索引为%s的商品的购买数量为%s", index, currentNum);
        let cart = wx.getStorageSync("cart");
        cart[index].buyNum = currentNum;
        wx.setStorageSync("cart", cart);
        this.setData({
            cart
        })
    },

    /**
     * 点击全选按钮
     * @param {参数} e
     */
    onAllClick(e) {
        console.log("点击全选按钮:", e)
        this.setData({
            radio: this.data.radio == '1' ? '0' : '1'
        })
        const {radio} = this.data;
        const {result} = this.data;
        result.splice(0, result.length);
        if (radio != '0' && this.data.cart.length > 0) {
            // 全不选
            this.data.cart.map(g => result.push(g._id))
        }
        this.setData({
            result
        })
        const cart = wx.getStorageSync("cart");
        this.renewCost(cart, result)
    },
    // 更新总费用
    renewCost(cart, newResult) {
        console.log("开始更新消费总费用", cart)
        let cost = 0;
        if (cart && cart.length > 0) {
            // 遍历购物车列表
            cart.map(g => {
                // 1 全部默认初始化为 未购买
                g.isBuy = false;
                // 2 查询result中是否存在当前商品
                const index = newResult.findIndex(r => r == g._id);
                if (index > -1) {
                    console.log("购买的商品:", g);
                    // 修改是否购买状态
                    g.isBuy = true;
                    cost += parseInt(g.buyNum) * parseFloat(g.price) * 100;
                }
            })
            wx.setStorageSync("cart", cart);
        }
        this.setData({cost})
    },
    /**
     * 监听数据变化
     */
    watch: {
        cart: function (newValue, oldValue) {
            console.log("触发监听器,开始更新购物车列表：修改前->%o,修改后->%o", oldValue, newValue);
            // 更新商品列表购买数
            this.renewGoodsListBuyNum();
            const checkResult = wx.getStorageSync("checkResult");
            this.renewCost(newValue, checkResult);
            app.cartCount = this.getCartCount(newValue);
            this.renewRadio(newValue, checkResult);
            if (app.cartCount > 0) {
                wx.setTabBarBadge({index: 2, text: app.cartCount.toString()})
            } else {
                wx.removeTabBarBadge({index: 2})
            }
        },
        result: function (newValue, oldValue) {
            console.log("触发监听器,开始更新选中商品信息：修改前->%o,修改后->%o", oldValue, newValue);
            wx.setStorageSync("checkResult", newValue);
        }
    },
    /**
     * 获取商品购买数
     */
    getCartCount(cart) {
        let cartCount = 0;
        if (cart.length > 0) {
            cart.map(g => {
                cartCount += g.buyNum;
            })
        }
        return cartCount;
    },
    /**
     * 去结算
     * @param {*} e
     */
    onClickButton(e) {
        //  跳转到 支付页面
        wx.navigateTo({
            url: "/pages/submitOrder/submitOrder"
        });
    },

    /**
     * 校验是否登陆
     */
    checkLogin() {
        const token = wx.getStorageSync("token");
        var isLogin = true;
        if (!token || !token.phone) {
            isLogin = false;
        }
        this.setData({
            isLogin: isLogin
        })
    },

    /**
     * 更新全选按钮
     */
    renewRadio(cart, result) {
        console.log("更新全选按钮:", cart.length, result.length);
        this.setData({
            radio: cart.length == result.length ? '1' : '0'
        })
    },
    /**
     * 获取用户手机号
     * @param {*} e
     */
    getPhoneNumber(e) {
        console.log(" 获取用户手机号响应", e)

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
            this.onShow();
        })
    },
    /**
     * 跳到商品详情页面
     */
    toGoodsDetail(e){
        console.log(" 跳到商品详情页面 e->",e.currentTarget.dataset)
        const {goodsid}=e.currentTarget.dataset
        wx.navigateTo({
            'url':'/pages/goodsDetail/goodsDetail?goodsId='+goodsid
        })
    }

})



