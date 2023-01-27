import {getCodeImgUrl, checkToken, getHttpUrlList} from "../../utils/commonUtil"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        codeImg: "",
        imgLoading: true,
        operationType:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        this.getCode()
    },

    /**
     * 获取小程序二维码
     */
    async getCode() {

        var {codeImg,createTime} = wx.getStorageSync("codeImg");
        console.log(" 获取缓存中的小程序二维码", codeImg)
        if (!codeImg||!createTime||new Date().getTime()-createTime>24*60*60*1000) {
            console.log("小程序二维码为空或过期")
            const {openId} = wx.getStorageSync("token");
            codeImg = await getCodeImgUrl(openId);
            wx.setStorageSync({"codeImg": codeImg,"createTime":new Date().getTime()});
        }
        this.setData({
            codeImg: codeImg,
            imgLoading: false,

        })
    },
    /**
     * 预览小程序二维码
     */
    async getNewCode() {
        wx.previewImage({
            urls: [this.data.codeImg]
        });
    },

    /**
     * 分享
     * @param {*} res
     */
    async onShareAppMessage(res) {
        // 来自页面内转发按钮
        const {openId} = wx.getStorageSync("token");
        console.log(res.target)
        return {
            title: '商超（买菜购物用它更省钱）',
            path: '/pages/index/index?shareId=' + openId,
            imageUrl: 'cloud://prod-6gubau4n1abe1a7f.7072-prod-6gubau4n1abe1a7f-1304152447/swiper/image.png'
        }
    },
})
