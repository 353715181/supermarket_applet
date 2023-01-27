import {checkGoodsNum} from '../../utils/commonUtil'

Component({
    data: {},
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
    methods: {

        handleBuyNum(e) {
            console.log("handleBuyNum事件", e);
            // 获取商品信息
            const {goods} = e.currentTarget.dataset;
            console.log("获取商品信息", goods)
            // 2 触发 父组件中的事件 自定义
            // 校验购买量是否合法
            if (!checkGoodsNum(goods)) {
                return
            }
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
        // toPreview() {
        //     console.log("预览商品")
        //     wx.previewImage({
        //         urls: [this.data.goods.fileId]
        //     })
        // },
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
