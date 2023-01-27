// components/login.js
import {updateUserInfo} from "../../utils/commonUtil";

const app = getApp();

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {},
    lifetimes: {
        attached() {
            // 在组件实例进入页面节点树时执行

        },
        ready() {

        }
    },
    pageLifetimes: {
        show: function () {
            // 页面被展示

        },
        hide: function () {
            // 页面被隐藏
        },
        resize: function (size) {
            // 页面尺寸变化
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 获取用户手机号
         * @param {*} e
         */
        getPhoneNumber(e) {
            console.log(" 获取用户手机号响应", e)

            wx.cloud.callFunction({
                name: 'myFunction',
                data: {
                    weRunData: wx.cloud.CloudID(e.detail.cloudID), // 这个 CloudID 值到云函数端会被替换
                }
            }).then(res => {
                console.log("明文res:", res);
                var openid = res.result.openid;
                var phone = res.result.event.weRunData.data.phoneNumber;
                wx.setStorageSync("token", {"openId": openid, "phone": phone});
                updateUserInfo({openId: openid, phone: phone});

            })
        }
    }
})
