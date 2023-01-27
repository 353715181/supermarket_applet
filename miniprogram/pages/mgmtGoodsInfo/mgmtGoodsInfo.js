// pages/mgmtGoodsInfo/mgmtGoodsInfo.js
import {upLoadImg, updateGoodsInfo} from "../../utils/commonUtil";
import {getGoodsById, addGoodsInfo, getAllCategory} from "../../utils/dbUtil";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        //本地图片集合
        imgList: [],
        //商品名称
        goodsName: "",
        //标签名称
        tagName: "全场8折 限量特价",
        //原价
        originPrice: "",
        //售价
        price: "",
        //库存
        inventory: "",
        //最大购买量
        maxBuy: 999,
        //成本价
        costPrice: "",
        //分类名称
        categoryName: "请选择商品分类",
        //分类ID
        categoryId: '',
        //上架状态
        isSale: "0",
        fileId: "",
        //折扣
        discount: 1,
        showCategory: false,
        categoryOption: [],
        //是否有选商品分类标记
        haveCategory: false,
        //是否是添加商品操作
        add: false,
        //修改商品信息时是否换了商品图片(需与add字段联合使用）
        isChangeImg: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("商品管理信息页面", options)
        this.initGoodsCategory()

        const {id} = options
        if (id) {
            this.initGoodsInfo(id);
        }
        this.setData({
            add: options.add
        })
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
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 初始化商品信息
     * @param id
     */
    async initGoodsInfo(id) {
        const goodsInfo = await getGoodsById(id);
        console.log("获取的商品信息", goodsInfo)
        const obj = {}
        obj.url = goodsInfo.imgUrl
        obj.fileId = goodsInfo.fileId
        this.setData({
            imgList: [obj],
            haveCategory: true
        })
        this.setData({
            ...goodsInfo
        })
    },
    /**
     * 初始化商品分类
     * @returns {Promise<void>}
     */
    async initGoodsCategory() {
        const result = await getAllCategory()
        var category = []
        result.map(r => {
            category.push({name: r.categoryName, value: r.categoryId})
        })
        this.setData({
            categoryOption: category
        })
    },
    /**
     * 改变商品上下架状态
     * @param event
     */
    changeSale(event) {
        console.log("改变商品上下架状态", event)
        this.setData({
            isSale: event.currentTarget.dataset.name,
        });
    },

    /**
     * 关闭分类选项
     */
    onClose() {
        this.setData({showCategory: false});
    },

    /**
     * 选择商品分类
     * @param event
     */
    onSelect(event) {
        console.log(event.detail);
        this.setData({
            showCategory: false,
            categoryName: event.detail.name,
            categoryId: event.detail.value,
            haveCategory: true
        })
    },

    /**
     * 展示分类选择框
     */
    showCategory() {
        this.setData({
            showCategory: true
        })
    },

    /**
     * 上传图片
     * @param {图片数据} e
     */
    afterRead(e) {
        console.log(" 上传图片", e)
        var {file} = e.detail;
        var url = file.path;
        const start = url.lastIndexOf('.');
        const suffix = url.substring(start, url.length);
        var fileList = [];
        fileList.push({
            url: url,
            name: `${Math.floor(Math.random() * 100000000)}` + suffix
        });
        this.setData({
            imgList: fileList
        })
    },
    /**
     * 图片大小提醒
     */
    oversize() {
        wx.showToast({
            duration: 1500,
            title: '图片大小不能超过2M',
            icon: 'none',
            // true 防止用户 手抖 疯狂点击按钮
            mask: true
        });
    },

    /**
     * 删除图片
     */
    deleteImg(e) {
        console.log("删除图片", e)
        if (!this.data.add) {
            this.setData({
                isChangeImg: true
            })
        }
        this.setData({
            imgList: []
        })
    },
    /**
     * 添加商品信息
     */
    addGoods: async function () {
        wx.showLoading({
            title: "添加中",
            mask: true
        });
        var param = this.data
        console.log("添加商品", this.data)
        //校验商品名称
        if (!param.goodsName) {
            wx.showToast({
                title: "商品名称不能为空",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品分类
        if (!param.categoryId || !param.categoryName) {
            wx.showToast({
                title: "商品分类不能为空",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品售价不能为空
        if (!(param.price && param.price - 0 > 0)) {
            wx.showToast({
                title: "商品售价不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品库存
        if (!(param.inventory && param.inventory - 0 >= 0)) {
            wx.showToast({
                title: "商品库存不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //每单最大购买量
        if (!(param.inventory && param.inventory - 0 > 0)) {
            wx.showToast({
                title: "每单最大购买量不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //成本价
        if (!(param.costPrice && param.costPrice - 0 > 0)) {
            wx.showToast({
                title: "成本价不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品图片
        if (!param.imgList.length > 0) {
            wx.showToast({
                title: "商品图片不能为空",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        const resultList = await upLoadImg("goodsList", param.imgList[0]);
        console.log("批量获取文件下载链接", resultList)
        param.imgUrl = resultList.tempFileURL
        param.fileId = resultList.fileID
        const addResult = await addGoodsInfo({
            goodsName: param.goodsName,
            tagName: param.tagName,
            originPrice: parseFloat(param.originPrice),
            price: parseFloat(param.price),
            inventory: parseInt(param.inventory),
            maxBuy: parseInt(param.maxBuy),
            costPrice: parseFloat(param.costPrice),
            categoryName: param.categoryName,
            categoryId: param.categoryId,
            fileId: param.fileId,
            imgUrl: param.imgUrl,
            discount: param.discount,
            isSale: param.isSale
        })
        console.log("商品添加结果", addResult)
        var pages = getCurrentPages(); //当前页面
        var beforePage = pages[pages.length - 2]; //前一页
        wx.navigateBack({
            success: function () {
                beforePage.onLoad(); // 执行前一个页面的onLoad方法
            }
        });
    },
    /**
     * 修改商品信息
     */
    updateGoods: async function () {
        wx.showLoading({
            title: "修改中",
            mask: true
        });
        var param = this.data
        console.log("添加商品", this.data)
        //校验商品名称
        if (!param.goodsName) {
            wx.showToast({
                title: "商品名称不能为空",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品分类
        if (!param.categoryId || !param.categoryName) {
            wx.showToast({
                title: "商品分类不能为空",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品售价不能为空
        if (!(param.price && param.price - 0 > 0)) {
            wx.showToast({
                title: "商品售价不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品库存
        if (!(param.inventory && param.inventory - 0 >= 0)) {
            wx.showToast({
                title: "商品库存不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //每单最大购买量
        if (!(param.maxBuy && param.maxBuy > 0)) {
            wx.showToast({
                title: "每单最大购买量不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //成本价
        if (!(param.costPrice && param.costPrice - 0 > 0)) {
            wx.showToast({
                title: "成本价不能为空且不能小于0",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //商品图片
        if (!param.imgList.length > 0) {
            wx.showToast({
                title: "商品图片不能为空",
                duration: 1500,
                mask: true,
                icon: "none"
            })
            return
        }
        //如果有更换过商品图片先删除商品图后上传新的图片
        if (this.data.isChangeImg) {
            //删除原来的图片
            wx.cloud.deleteFile({
                fileList: [param.fileId],
                success: res => {
                    console.log('删除原来的图片结果:', res.fileList)
                },
                fail: console.error
            })
            //上传新的图片
            const resultList = await upLoadImg("goodsList", param.imgList[0]);
            console.log("获取文件下载链接", resultList)
            param.imgUrl = resultList.tempFileURL
            param.fileId = resultList.fileID
        }
        const addResult = await updateGoodsInfo({
            goodsName: param.goodsName,
            tagName: param.tagName,
            originPrice: param.discount === 1 ? '' : (parseFloat(param.price)*param.discount/0.8).toFixed(2),
            price: parseFloat(param.price),
            inventory: parseInt(param.inventory),
            maxBuy: parseInt(param.maxBuy),
            costPrice: parseFloat(param.costPrice),
            categoryName: param.categoryName,
            categoryId: param.categoryId,
            fileId: param.fileId,
            imgUrl: param.imgUrl,
            discount: param.discount,
            isSale: param.isSale,
            _id: param._id
        })
        console.log("商品修改结果", addResult)
        var pages = getCurrentPages(); //当前页面
        var beforePage = pages[pages.length - 2]; //前一页
        wx.navigateBack({
            success: function () {
                beforePage.onLoad(); // 执行前一个页面的onLoad方法
            }
        });
    }
})
