import {checkGoodsNum} from '../../utils/commonUtil'

Component({
    /**
     * 组件的初始数据
     */
    data: {
        buyNum: 0
    },
    /**
     * 组件的属性列表
     */
    properties: {
        goods: {
            type: Object,
            value: {}
        }
    },
    lifetimes: {
        attached() {

        },
        ready() {

        }
    },


    /**
     * 组件的方法列表
     */
    methods: {

        // 处理购买信息
        handleBuyNum(e) {
            console.log("handleBuyNum事件", e)
            // 获取商品信息
            const {goods} = e.currentTarget.dataset;
            console.log("获取商品信息", goods)
            // 校验购买量是否合法
            if (!checkGoodsNum(goods)) {
                return
            }
            console.log("查看是否同步")
            // 将购买的商品id添加到cart页面中的result的缓存，保证添加时默认已选择
            var checkResult = wx.getStorageSync("checkResult") || [];
            if (checkResult.length > 0) {
                var index = checkResult.findIndex(r => r === goods._id);
                if (index === -1) {
                    checkResult.push(goods._id)
                }
            } else {
                checkResult.push(goods._id)
            }
            wx.setStorageSync("checkResult", checkResult);
            this.triggerEvent("buyNumChange", goods, {});

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

    }

})
