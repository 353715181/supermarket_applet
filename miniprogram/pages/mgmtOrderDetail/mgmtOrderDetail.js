import {queryOrderDetail} from "../../utils/commonUtil.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // time: 0,
    order: "",
    id: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("订单id", options)

    this.setData({
      id: options.id
    })
  },

  buyGoodsList: [],

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderDetail(this.data.id);
    // 初始化商品总金额
    this.getTotalPrice();
  },

  /**
 * 获取购物清单
 */
  async getOrderDetail(id) {
    const order = await queryOrderDetail(id);
    console.log(" order->", order)
    this.setData({ order })
  },
  /**
   * 初始化商品金额
   */
  getTotalPrice() {
    let sum = 0;
    this.buyGoodsList.map(g => {
      sum += g.buyNum * g.price;
    })
    sum = this.toDecimal(sum);
    this.setData({
      totalPrice: sum
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
     * 接单
     */
    orderTaking(e){
        wx.navigateBack({
            delta:1
        })
    },
    /**
     * 打包完成
     */
    sorting(e){
        wx.navigateBack({
            delta:1
        })
    },
    /**
     * 开始配送
     */
    startDelivery(e){
        wx.navigateBack({
            delta:1
        })
    },
    /**
     * 开始配送
     */
    finishDelivery(e){
        wx.navigateBack({
            delta:1
        })
    },
    /**
     * 受理完成
     */
    confirmHandle(e){
        wx.navigateBack({
            delta:1
        })
    },
    /**
     * 受理完成
     */
    cancelMgmtOrder(e){
        wx.navigateBack({
            delta:1
        })
    }


});
