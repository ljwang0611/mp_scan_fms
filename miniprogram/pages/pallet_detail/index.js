// pages/pallet_detail/index.js
const app = getApp()
const api = app.globalData.api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    nr:"",
    name:""
  },

  save: async function(){
    let id = this.data.id
    let nr = this.data.nr
    let name = this.data.name
    let openid = app.globalData.openid
    let param = `?script.param=${id}|${nr}|${name}|${openid}`
    let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/pallet/script/save_pallet/${param}`
    let res = await api.runscript(url)
    if(res.scriptError == 0){     
      wx.showToast({
        title: '成功保存',
      })
       setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000)
    }

 
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    let nr = options.nr
    let name = options.name
    this.setData({
      nr,name,id
    })
  },


})