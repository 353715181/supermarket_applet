import { getAddrById, updateAddrById, deleteById } from "../../utils/dbUtil.js";
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    userName: "",
    showPopup: false,
    columns: ['田陈生活区', '田陈步行街', '田陈铁运处小区',
      '滕南小区', '尹洼村', '蒋庄生活区'
    ],
    address: "",
    userPhone: "",
    // isMain: false,
    roomNum: "",
    isSubmit: true,
    phoneCheckMsg: "",
    type: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("修改地址:", options)
    this.initAddrInfo(options.id);
    this.setData({
      type: options.type
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
   * 初始化地址信息
   * @param {地址id} id 
   */
  async initAddrInfo(id) {

    console.log("地址id——>{%s}", id)
    const addr = await getAddrById(id);
    console.log("获取到地址信息", addr)
    this.setData({
      userName: addr.userName,
      userPhone: addr.userPhone,
      address: addr.address,
      roomNum: addr.roomNum,
      id: id
    })
    // 校验内容是否合法
    this.onCheckSubmit();
  },
  /**
   * 点击选择地址
   * @param {*} e 
   */
  onClickAddress(e) {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },
  /**
   * 确认收货地址
   * @param {*} event 
   */
  onConfirmAddress(event) {
    const { value } = event.detail;
    this.setData({
      address: value,
      showPopup: !this.data.showPopup
    })
  },
  /**
   * 点击取消按钮
   */
  onCancelAddress() {
    this.setData({
      showPopup: !this.data.showPopup
    })
  },


  /**
 * 校验手机号
 * @param {输入框的值，输入内容的长度} e 
 */
  onCheckSubmit(e) {
    let isSubmit = false;
    console.log(e)
    // 校验名称
    console.log("校验当前data是否合法", this.data)
    if (this.data.userName.length < 1) {
      isSubmit = true;
    }
    // 校验手机号
    if (this.data.userPhone.length < 1) {
      isSubmit = true
    }
    // 校验地址
    if (this.data.address.length < 1) {
      isSubmit = true;
    }
    // 校验门牌号
    if (this.data.roomNum.length < 1) {
      isSubmit = true;
    }
    this.setData({
      isSubmit
    })
  },

  /**
   * 提交并保存收货地址
   * @param {} e 
   */
  async onSubmit(e) {
    // 校验用户手机号
    if (!(/(^\d{11}$)/.test(this.data.userPhone))) {
      wx.showToast({
        duration: 2000,
        title: '手机格式有误',
        icon: 'none',
        // true 防止用户 手抖 疯狂点击按钮 
        mask: true
      });
      return;
    }
    // 保存用户地址
    await updateAddrById({ id: this.data.id, userName: this.data.userName, userPhone: this.data.userPhone, address: this.data.address, roomNum: this.data.roomNum });
    wx.setStorageSync("checkedAddr", { _id: this.data.id, userName: this.data.userName, userPhone: this.data.userPhone, address: this.data.address, roomNum: this.data.roomNum });
    if (this.data.type != 1) {
      wx.reLaunch({
        url: '/pages/submitOrder/submitOrder'

      })
    } else {
      // 返回上一页
      var pages = getCurrentPages(); //当前页面
      var beforePage = pages[pages.length - 2]; //前一页
      wx.navigateBack({
        success: function () {
          beforePage.onLoad(); // 执行前一个页面的onLoad方法
        }
      });
    }

  },

  /**
   * 删除收货地址
   * @param {} e 
   */
  deleteAddr(e) {
    this.showDeleteDialog(this.data.id)
  },


  /**
 * 显示删除确认框
 * @param {将要删除的地址的id} id 
 */
   showDeleteDialog(id) {
    Dialog.alert({
      message: '确定删除地址吗？',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "确定"
    }).then(() => {
      console.log("点击确认按钮", id)
       deleteById({ collectionName: "address", id: id });
       this.deleteCheckedAddr(id);
        this.back();
    }).catch(() => {
      console.log("点击取消按钮", id)
    });
  },

/**
 * 返回上一页
 */
  back(){
    var pages = getCurrentPages(); //当前页面
    var beforePage = pages[pages.length - 2]; //前一页
    wx.navigateBack({
      success: function () {
        beforePage.onLoad(); // 执行前一个页面的onLoad方法
      }
    });
  },
  /**
   * 通过id删除选中的地址
   * @param {将要删除的地址id} id 
   */
  deleteCheckedAddr(id){
    console.log("通过id删除选中的地址：",id)
    const addr= wx.getStorageSync("checkedAddr");
    if(addr._id==id){
      wx.setStorageSync("checkedAddr","");
    }
  }
})