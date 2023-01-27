import { getAddrById, getAllQuestionData } from "../../utils/dbUtil.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: [],
    questionList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initQuestionList();
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


  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  /**
   * 打电话
   * @param {} e
   */
  onCall(e) {
    wx.makePhoneCall({
      phoneNumber: '测试'
    })
  },

  /**
   * 初始化 问题列表
   * @param {} e
   */
  async initQuestionList(e){
    var questionList=  await getAllQuestionData("helpQuestion");
    console.log("获取所有问题",questionList)
    this.setData({questionList});
  }

})
