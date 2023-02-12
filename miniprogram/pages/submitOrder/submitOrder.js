import {
    getDeliveryTimeList,
    submitOrder,
    updateOrderState,
    getShareOpenId,
    getCollectionSize
} from "../../utils/dbUtil.js";
import {queryUserInfo, updateUserInfo, renewGoodsStock, enableTimer} from "../../utils/commonUtil.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用户收货信息
        userInfo: '',
        // 选择配送时间弹窗
        showPopup: false,
        // 购买商品列表
        goodsList: [],
        // "9月10日(周三)  17：00", "9月11日(周四)  10：00", "9月11日(周四)  17：00"
        columns: [],
        sendTime: "",
        // 商品总金额
        totalPrice: 0,
        // 配送费
        deliverPrice: 0,
        // 减免金额（元）
        freePrice: 0.00,
        remarks: "",
        isDisabled: false,
        payPrice: 0,
        //缺货提示语
        outStock:'其他商品继续配送（缺货商品退款）',
        showOutStock:false,
        OutStockList:['缺货时电话与我沟通','其他商品继续配送（缺货商品退款）','有缺货直接取消订单']
    },

    //  数据库配送时间表
    timeList: [],


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initSentTimeList();

    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.showLoading({
            mask:true
        })
        const userInfo = wx.getStorageSync("checkedAddr");
        console.log("提交订单页面地址信息缓存", userInfo)
        this.getBuyGoodsList();

        this.setData({
            userInfo
        })

        // 初始化商品总金额
        this.getTotalPrice();
        this.checkParam();
        this.getUserInfo();
    },

    /**
     * 初始化配送时间集合
     */
    initSentTimeList() {
        // this.time();
        this.getSendTimeList();
    },
    /**
     * 获取配送时间列表
     */
    async getSendTimeList() {
        const timeList = await getDeliveryTimeList();
        var todayDate = new Date();
        console.log(" 当前时间 hours->%s ,minutes->%s", todayDate.getHours(), todayDate.getMinutes())
        let sub=0
        if (todayDate.getHours() > 21 ||(todayDate.getHours() === 21&& todayDate.getMinutes() >= 30)) {
            sub = 2
        } else {
            sub = 1
        }
        let columns = []
        var today= todayDate.getDate();
        for (let i = 0; i < 2; i++) {
            var sendTime = new Date(todayDate.setDate(today+sub+i))
            console.log(" 添加配送时间",sendTime)
            const index = timeList.findIndex(t => t.day === sendTime.getDay())
            let timeData = timeList[index]
            columns.push((sendTime.getMonth() + 1) + "月" + (sendTime.getDate()) + "日(周" + this.getDay(sendTime.getDay()) + ") " + timeData.hour + ":" + timeData.min);
        }
        this.setData({
            columns: columns
        })

    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
        const userInfo = await queryUserInfo() || {};
        console.log(" 获取该用户信息", userInfo);
        // 订单总价格 goldNum单位为分
        const totalPrice = this.data.totalPrice
        const deliverPrice=this.data.deliverPrice
        var goldNum = userInfo.goldNum || 0
        var maxFreePrice = ((totalPrice+deliverPrice) * 100 * 0.2).toFixed(0)
        console.log(" 获取用户信息 最大减免金额:->%s,可用果币->%s", maxFreePrice, goldNum)
        if (goldNum > 0) {
            const freePrice = maxFreePrice > goldNum ? goldNum : maxFreePrice
            console.log('最终的减免金额:->%s', freePrice/100)
            this.setData({
                freePrice: freePrice / 100
            })
        }
        var payPrice = this.toDecimal(this.data.totalPrice + this.data.deliverPrice - this.data.freePrice)
        console.log("获取到的payPrice", payPrice)
        this.setData({
            payPrice: payPrice,
        })
        wx.hideLoading();
    },

    async getTotalPrice() {
        let sum = 0;
        this.data.goodsList.map(g => {
            sum += g.buyNum * g.price;
        })
        sum = this.toDecimal(sum)
        //判断用户是否为首单
        const orderCount = await getCollectionSize('order')
        console.log("用户是否为首单", orderCount)
        this.setData({
            totalPrice: sum,
            deliverPrice: sum > 38 || orderCount.total === 0 ? 0 : 2.8
        })
    },

    //1.功能：将浮点数四舍五入，取小数点后2位
    toDecimal(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    },

    /**
     * 点击配送时间
     * @param {*} e
     */
    onSendTime(e) {
        console.log("配送时间", e)
        this.setData({
            showPopup: !this.data.showPopup
        })
        this.checkParam();
    },

    /**
     * 确认收货地址
     * @param {*} event
     */
    onConfirm(event) {
        const {value} = event.detail;
        this.setData({
            sendTime: value,
            showPopup: !this.data.showPopup
        })
        this.checkParam();
    },
    /**
     * 点击取消按钮
     */
    onCancel() {
        this.setData({
            showPopup: !this.data.showPopup
        })
    },
    /**
     * 点击如遇缺货
     * @param {*} e
     */
    handleOutStock(e) {
        console.log("点击如遇缺货", e)
        this.setData({
            showOutStock: !this.data.showOutStock
        })
    },

    /**
     * 确认缺货处理方式
     * @param {*} event
     */
    chooseOutStock(event) {
        const {value} = event.detail;
        this.setData({
            outStock: value,
            showOutStock: !this.data.showOutStock
        })
    },
    /**
     * 点击取消按钮
     */
    cancelOutStock() {
        this.setData({
            showOutStock: !this.data.showOutStock
        })
    },
    /**
     * 去支付
     * @param {*} e
     */
    onClickButton(e) {
        console.log(e);
    },


    /**
     * 获取购物清单
     */
    async getBuyGoodsList() {
        let cartList = wx.getStorageSync("cart");
        console.log("购物车列表", cartList)
        let goodsList = cartList.filter(v => v.isBuy);
        goodsList.map(g=>{
            g.total=(g.buyNum*g.price).toFixed(2)
        })
        this.setData({goodsList})
    },


    /**
     *  初始化配送时间列表
     */
    async time() {

        const timeList = await getDeliveryTimeList();

        var date = new Date();
        // 周几
        var d = date.getDay();
        // 小时
        var hour = date.getHours();
        // 分钟
        var min = date.getMinutes();
        // 月份
        var month = date.getMonth();
        console.log("月份", month)
        // 日期
        var today = date.getDate();
        let columns = [];
        // 当天所在数据库的索引(没记错的话这里周天是0)
        var index = timeList.findIndex(v => v.day === d);
        console.log("当天所在的索引", index, timeList[index].day, d)
        // 获取3个可选的配送时间
        var isTrue = true;
        while (isTrue) {
            console.log("当前校验的index", index)
            if (timeList[index].day == d && timeList[index].hour > hour) {
                isTrue = false;
            } else if (timeList[index].day == d && timeList[index].hour == hour && timeList[index].min > min) {
                isTrue = false;
            } else if (timeList[index].day != d) {
                isTrue = false;
            } else {
                index++;
                if (index == timeList.length) {
                    index = 0;
                }
            }
        }
        var num = index;
        while (columns.length < 3) {
            // 获取派送时间集合中的 派送时间信息
            var timeData = timeList[num % timeList.length];
            var day = this.getDay(timeData.day);
            // 距离今天相差的天数   num-index用来记录循环了多少次
            var i = timeData.day - d >= 0 ? timeData.day - d : timeData.day - d + 7;
            var sendTime = new Date();
            sendTime = sendTime.setDate(date.getDate() + i);
            var sendTime = new Date(sendTime);
            columns.push((sendTime.getMonth() + 1) + "月" + (sendTime.getDate()) + "日(周" + day + ") " + timeData.hour + ":" + timeData.min);
            // console.log("当前配送时间集合",columns)
            num++;
        }
        this.setData({columns})
    },


    /**
     * 获取今天礼拜几中文
     * @param {礼拜几} d
     */
    getDay(d) {
        var day = "";
        if (d == 0) {
            day = "日";
        } else if (d == 1) {
            day = "一";
        } else if (d == 2) {
            day = "二";
        } else if (d == 3) {
            day = "三";
        } else if (d == 4) {
            day = "四";
        } else if (d == 5) {
            day = "五";
        } else if (d == 6) {
            day = "六";
        }
        return day;
    },
    /**
     * 提交订单
     * @param {*} e
     */
    async submitOrder(e) {
        console.log("提交订单：", e);
        console.log(" 当前页面数据：", this.data)
        const userInfo = this.data.userInfo;
        var goodsCount = this.getGoodsCount();
        // 保存订单信息到数据库
        var orderNo = this.getOrderNo();
        var shareId = wx.getStorageSync("shareOpenId");
        var token = wx.getStorageSync("token")
        if (!shareId) {
            shareId = await getShareOpenId(token.openId)
            wx.setStorageSync("shareOpenId", shareId)
        }
        // 修改用户 已使用和 可使用果币数量
        const freePrice = this.data.freePrice * 100
        if (freePrice > 0) {
            updateUserInfo({goldNum: -1 * freePrice, usedGold: freePrice})
        }
        renewGoodsStock(-1, this.data.goodsList)
        const id = await submitOrder(
            {
                "orderNo": orderNo,
                "sendTime": this.data.sendTime,
                "receiveAddr": userInfo.address,
                "receiveRoomNum": userInfo.roomNum,
                "receiveName": userInfo.userName,
                "receivePhone": userInfo.userPhone,
                "goodsList": this.data.goodsList,
                "totalPrice": this.data.totalPrice,
                "deliverPrice": this.data.deliverPrice,
                "freePrice": this.data.freePrice,
                "state": 1,
                'stateName': "待支付",
                "remarks": this.data.remarks,
                "goodsCount": goodsCount,
                "payPrice": this.data.payPrice,
                "shareId": shareId,
                "isPrize": 0,
                "outStock":this.data.outStock
            }
        )
        // 更新购物车中的商品
        this.renewCart();
        //  支付失败----启动定时器
        wx.setStorageSync(id, {"time": 5 * 60});
        // 启动定时器
        enableTimer(id, orderNo, new Date().getTime(), this.data.freePrice);
        // 跳订单详情页
        wx.redirectTo({
            url: '/pages/orderDetail/orderDetail?id=' + id + "&orderNo=" + orderNo + "&pay=" + true + "&payPrice=" + this.data.payPrice
        });

    },


    /**
     * 过滤掉购物车中已购买的商品
     * @param {*} goodsList
     */
    renewCart() {
        var cart = wx.getStorageSync("cart");
        console.log(" 提交订单，购物车更新前", cart)
        var cartCount = 0;
        cart = cart.filter(g => {
            if (!g.isBuy) {
                cartCount += g.buyNum
            }
            return !g.isBuy
        })

        console.log(" 获取到的剩余的购物车中的商品数量", cartCount)
        if (cartCount > 0) {
            wx.setTabBarBadge({index: 2, text: cartCount.toString()})
        } else {
            console.log(" 删除 removeTabBarBadge")
            wx.hideTabBarRedDot({index: 2})
        }
        console.log(" 提交订单，购物车更新后", cart)
        wx.setStorageSync("cart", cart);
    },



    /**
     * 获取商品的购买数量
     */
    getGoodsCount() {
        const goodsList = this.data.goodsList;
        var count = 0;
        goodsList.map(g => {
            count += g.buyNum
        })
        return count;
    },

    /**
     * 校验参数是否合法
     * @param {*} param
     */
    checkParam() {
        var isDisabled = false;
        if (this.data.userInfo === "") {
            isDisabled = true;
        }
        if (this.data.sendTime === "") {
            isDisabled = true
        }
        if (this.data.totalPrice + this.data.deliverPrice - this.data.freePrice <= 0) {
            isDisabled = true;
        }
        if (this.data.goodsList.length <= 0) {
            isDisabled = true;
        }
        this.setData({
            isDisabled
        })
    },
    /**
     * 获取随机的订单号
     */
    getOrderNo() {
        var random_no = "";
        for (var i = 0; i < 8; i++) {
            random_no += Math.floor(Math.random() * 10);
        }
        random_no = new Date().getTime() + random_no;
        return random_no;
    }
})
