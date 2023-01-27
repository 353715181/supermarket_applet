import {updateGoodsInfo} from "../../utils/commonUtil";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        goods: {
            type: Object,
            value: {}
        }
    },
    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 跳转到修改商品页面
         */
        toUpdatePage(e) {
            console.log("跳转到修改商品页面", e)
            wx.navigateTo({
                url: '/pages/mgmtGoodsInfo/mgmtGoodsInfo?id=' + this.data.goods._id
            })
        },
        /**
         * 修改商品上下架状态
         */
        async updateGoodsSale(e) {
            wx.showLoading(
                {mask: true}
            )
            const {issale} = e.target.dataset
            var goods = this.data.goods
            console.log("修改商品上下架状态", e, issale, goods)
            goods.isSale = issale
            const result = await updateGoodsInfo(goods)
            console.log("修改商品上下架状态:", result)
            this.setData({
                goods: goods
            })
            wx.hideLoading()
        },
        toPreview() {
            console.log("预览商品")
            wx.previewImage({
                urls: [this.data.goods.fileId]
            })
        }
    }
})
