const app = getApp().globalData;

/**
 *  获取所有问题数据
 * @param {*} goods 商品信息
 */
export const addGoodsToCart = (goods) => {
    console.log(" addGoodsToCart 添加商品->%s到购物车中", goods)
    var cart = wx.getStorageSync('cart') || []
    return new Promise((resolve, reject) => {
        console.log("addGoodsToCart 当前购物车", cart)
        let index = cart.findIndex(v => v._id === goods._id);
        console.log("addGoodsToCart 当前商品所在缓存中的索引", index)
        if (index === -1) {
            goods.buyNum = 1;
            cart.push(goods)
        } else {
            cart[index].buyNum++;
            goods = cart[index]
        }
        wx.setStorageSync("cart", cart);
        resolve(cart)
    })
}
/**
 *  更新tabberBuyCount
 * @param {*} goods 商品信息
 */
export const renewTabbarBuyCount = () => {
    console.log(" renewTabbarBuyCount ")
    var cart = wx.getStorageSync('cart') || []
    return new Promise((resolve, reject) => {
        app.cartCount += 1;
        wx.setTabBarBadge({index: 2, text: app.cartCount.toString()})
        resolve(app.cartCount)
    })
}
/**
 *  校验添加是否合法，校验通过后添加到购物车选中列表
 * @param {*} goods 商品信息
 */
export const checkAndAddToCartResult = (goods) => {
    return new Promise((resolve, reject) => {
        if (!checkGoodsNum(goods)) {
            resolve(false)
        }
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
        resolve(true)
    })
}
/**
 * 校验 商品 库存 和最大购买数量是否合法
 * @param {临时数组} tempList
 */
export const checkGoodsNum = (goods) => {
    // 校验商品是否已售完
    if (goods.inventory === 0) {
        wx.showToast({
            title: '该商品已售完',
            icon: 'none',
            duration: 1500,
            mask: true
        });
        return false
    }
    console.log("此商品购买数", goods.buyNum, goods)
    if (goods.buyNum >= goods.inventory - 0) {
        wx.showToast({
            title: '抱歉,该商品只剩' + goods.inventory + '件',
            icon: 'none',
            duration: 1500,
            mask: true
        });
        return false
    }
    if (goods.maxBuy && goods.buyNum >= goods.maxBuy - 0) {
        wx.showToast({
            title: '抱歉,该商品每人限购' + goods.maxBuy + '件',
            icon: 'none',
            duration: 1500,
            mask: true
        });
        return false
    }
    return true;
}
