import {addOpinion} from "../../utils/dbUtil.js";
import {upLoadImg} from "../../utils/commonUtil.js";


upLoadImg
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fileList: [],
        textLength: 0,
        value: "",
        isSubmit: false
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

    },
    /**
     * 上传图片
     * @param {*} e
     */
    afterRead(e) {
        console.log(e)
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
            fileList: this.data.fileList.concat(fileList)
        })

    },
    /**
     * 删除图片
     * @param {*} e
     */
    deleteImg(e) {
        console.log("删除图片", e)
        const index = e.detail.index;
        var fileList = this.data.fileList;
        fileList.splice(index, 1);
        this.setData({
            fileList: fileList
        })
    },
    /**
     * 用户输入时触发
     * @param {} e
     */
    input(e) {
        console.log("长度", e.detail.value.length);
        const length = e.detail.cursor;
        var isSubmit = false;
        if (length != 0) {
            isSubmit = true;
        } else {
            isSubmit = false;
        }
        this.setData({
            textLength: length,
            isSubmit: isSubmit,
        })
    },


    /**
     * 提交意见
     * @param {*} e
     */
    async onSubmit(e) {
        wx.showLoading({
            title: '提交中',
            mask: true
        })
        const file = this.data.fileList[0];
        // 上传图片
        try {
            var imgUrl = await upLoadImg("opinion", file);
            await addOpinion({imgUrl: imgUrl.tempFileURL, text: this.data.value});
            wx.hideLoading()
            // wx.showToast({
            //   title: '感谢您的提交',
            //   icon: 'none',
            //   duration: 1500
            // });
            this.setData({
                fileList: [],
                value: ""
            })
        } catch (e) {
            console.log("提交失败", e)
            wx.showToast({
                title: '提交失败请稍后再试',
                icon: 'none',
                duration: 1500
            });
        }


    },
    /**
     * 上传文件过大
     * @param {*} e
     */
    oversize(e) {
        wx.showToast({
            title: '图片大小不能超过1M',
            icon: 'none',
            duration: 1500
        });
    }


})
