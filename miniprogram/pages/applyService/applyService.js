import {addApplyService, updateOrderState, getApplyService} from "../../utils/dbUtil.js";
import {getHttpUrlList, batchUploadImg} from "../../utils/commonUtil.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showActionSheet: false,
        applyType: "",
        applyRemarks: "",
        /**
         * 临时文件数组
         */
        tempList: [],
        /**
         * 图片链接数组
         */
        imgList: [],
        isSubmit: false,
        createdTime: "",
        query: false,
        /**
         * 订单id
         */
        orderId: "",
        actions: [{
            name: '1',
            value: '商品质量有问题'
        },
            {
                value: '没有收到此商品',
                name: '2'
            },
            {
                value: '包装问题',
                name: '3'
            },
            {
                value: '配送问题',
                name: '4'
            },
            {
                value: '不想要了',
                name: '5'
            },
            {
                value: '保质期问题',
                name: '6'
            }
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.query) {
            this.setData({
                query: options.query
            })
            this.initApplyService(options.orderId)
        }
        this.setData({
            orderId: options.orderId
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

    onClose() {
        this.setData({
            showActionSheet: false
        })
    },
    /**
     * 选择取消订单理由
     * @param {*} event
     */
    onClick(event) {
        console.log(" order-button 选择取消订单理由", event)
        const {name} = event.currentTarget.dataset;
        const applyType = this.data.actions.find(a => a.name === name)
        this.setData({
            radio: name,
            applyType: applyType.value,
            showActionSheet: false
        });
        this.checkSubmit();
    },

    /**
     * 选择申请原因
     */
    chooseApplyReason() {
        this.setData({
            showActionSheet: true
        })
        this.checkSubmit();
    },
    /**
     * 校验输入框
     */
    input() {
        this.checkSubmit()
    },
    /**
     * 校验是否可以提交
     */
    checkSubmit() {
        this.setData({
            isSubmit: this.data.applyRemarks && this.data.applyType
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
            tempList: this.data.tempList.concat(fileList)
        })
    },
    /**
     * 提交售后申请
     */
    async onSubmit() {
        const {applyType, applyRemarks, orderId} = this.data;
        wx.showLoading({
            title: "提交中",
            mask: true
        });
        const fileIdList = await batchUploadImg("applyService", this.data.tempList);
        console.log(" 批量上传结果：", fileIdList)
        const resultList = await getHttpUrlList(fileIdList);
        console.log("批量获取文件下载链接", resultList)
        const imgList = resultList.map(r => {
            return {fileId: r.fileID, url: r.tempFileURL}
        })
        await addApplyService({
            applyType, applyRemarks, orderId, imgList
        })
        updateOrderState(orderId, 7, "已申请售后,待商家处理")
        wx.navigateBack({
            delta: 1
        })
    },
    /**
     * 获取订单详情
     * @param {订单id} orderId
     */
    async initApplyService(orderId) {
        const data = await getApplyService(orderId)
        this.setData({
            imgList: data.imgList,
            applyType: data.applyType,
            applyRemarks: data.applyRemarks,
            createdTime: data.createdTime
        })

    },
    /**
     * 图片大小超过限制
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
     * 点击图片
     */
    clickImg(e) {
        console.log("点击图片", e)
        const imgUrl = this.data.imgList.map(img => {
            return img.url
        })
        const current = e.currentTarget.dataset.url
        console.log(" 点击图片", imgUrl, current)
        if (current && imgUrl.length > 0) {
            wx.previewImage({
                current: current,
                urls: imgUrl
            });
        }

    },




})
