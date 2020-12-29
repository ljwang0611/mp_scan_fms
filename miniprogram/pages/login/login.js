// miniprogram/pages/login/login.js

const app = getApp()
const api = app.globalData.api

Page({

  /**
   * 页面的初始数据
   */
  data: {
      authcode:true,
      userInfo:""
  },



      //分享小程序
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {}
    return {
      title: '蜂巢数据条码采集',
      success: function(res) {
        wx.showToast({
          title: '感谢分享支持',
        })
      },
      fail: function(res) {}
    }
  },

  //进入扫码页面
  enter(){
     wx.redirectTo({
      url: '/pages/pallet_list/index',
    })
  },

  //微信登录
  onGotUserInfo(){
    let authcode = true
    this.setData({
      authcode
    })
    wx.getUserInfo({
      success:(res)=>{
        this.setData({
          userInfo:res.userInfo
        })
      }
    })
    
  },


  user_login: async function(){
    let res_openid = await wx.cloud.callFunction({name:'getopenid'})
    let openid = res_openid.result
    app.globalData.openid = openid
    let url = 'https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/user_log/records'
    let data = `{"fieldData": {"open_id": "${openid}","status":0}}`
    let res = await api.creatrecord(url,data)
    let code = res.data.messages[0].code
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //user_login
    this.user_login()
    wx.getSetting({
      success:(res) =>{
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success:(res)=>{
              this.setData({
                userInfo:res.userInfo
              })
            }
          })
        } else {
          console.log("未授权，跳转授权")
          let authcode = false
          this.setData({
            authcode
          })
        }
      }
    })
  },

})