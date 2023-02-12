//app.js
App({


    data: {
        GOODS_LIST: "goodsList",
        CATEGORY: "category",
        SWIPER: "swiper",
        // TODO 配置
        APP_ID: ".......",
        APP_SECRET: ".......",
        GRANT_TYPE: "authorization_code"
    },

    onLaunch: function () {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: '.......',// 测试
                // TODO 配置
                env: '.......',// 生产
                traceUser: true,
            })
        }

        this.globalData = {
            cartCount: this.initCartCount()
        }
        console.log(" 更新版本")
        /* 版本自动更新代码 */
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            console.log("版本更新", res.hasUpdate)
        })
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新检测', // 此处可自定义提示标题
                content: '检测到新版本，是否重启小程序？', // 此处可自定义提示消息内容
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: '更新提示',
                content: '新版本下载失败',
                showCancel: false
            })
        })
    },

    initCartCount() {
        let cart = wx.getStorageSync("cart");
        let cartCount = 0;
        if (cart.length > 0) {
            cart.map(g => {
                cartCount += g.buyNum;
            })
        }
        console.log("初始化购物车数量：", cartCount)
        if (cartCount > 0) {
            wx.setTabBarBadge({ index: 2, text: cartCount.toString() })
        } else {
            wx.removeTabBarBadge({ index: 2 })
        }
        return cartCount;
    }


})
