// miniprogram/pages/bundle_detail/bundle_detail.js
const app = getApp()
const api = app.globalData.api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pallet_id:"",
    current_bundle_id:"",
    bundle_detail:"",
    index:"",
    id:"",
    log:"",
    bundle:"",
    pcs:"",
    length:"",
    width:"",
    qty:""

  },
  onChange(e){
    let d = this.data
    let qty = Number(d.pcs * d.length * d.width /10000).toFixed(2)
    let flag = `${d.log}${d.bundle}${d.pcs}${d.length}${d.width}`
    let bundle_detail = {"id":flag,"log" : d.log , "bundle" : d.bundle,"pcs":d.pcs,"length":d.length,"width":d.width,"qty":qty}
    this.setData({
        qty,bundle_detail
    })
  },

  save: async function(){
    let d = this.data.bundle_detail
    let pallet_id = this.data.pallet_id
    let current_bundle_id = this.data.current_bundle_id
    let param = `?script.param=${pallet_id}|${d.id}|${d.log}|${d.bundle}|${d.pcs}|${d.length}|${d.width}|${d.qty}|${current_bundle_id}`
    let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/bundle/script/save_bundle/${param}`
    let res = await api.runscript(url)
    let result = JSON.parse(res.scriptResult)
    let total_count = result.count
    let total_qty = result.total
    if(result.code == "有重复捆"){     
      wx.showToast({
        title: '重复',
      })
    }
    else{
      var pages = getCurrentPages()
      var prePage = pages[pages.length - 2]
      let index = this.data.index
      let res = this.data.bundle_detail
      prePage.change_bundle_detail(index,res,total_count,total_qty)
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
      this.setData({
        bundle_detail:options,
        current_bundle_id:options.id,
        pallet_id: options.pallet_id,
        index:options.index,
        id:options.id,
        log:options.log,
        bundle:options.bundle,
        pcs:options.pcs,
        length:options.length,
        width:options.width,
        qty:options.qty
      })
  },
  onShow:function(){

  }

  
})