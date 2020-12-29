// miniprogram/pages/index/index.js
//引用外部函数（包含识别逻辑）

import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp()
const api = app.globalData.api


Page({
  data: {
    acs_show: false,
    acs_menu:"",
    menu_pallet: [
      { name: '编辑包装',color:""},
      { name: '包装码单',color:""},   
      { name: '删除包装',color:"red"}
    ],
    menu_tile:[
      { name: '新增包装',color:""}
    ],
    select_pallet_detail:"",
    select_pallet_index:"",
    pallet_list:""
  },

  //分享小程序
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {}
    return {
      title: '蜂巢数据条码采集',
      success: function(res) {},
      fail: function(res) {}
    }
  },

 
  //包装弹出操作菜单
  actionSheetTap_pallet(e){
    let acs_menu = this.data.menu_pallet
    this.setData({
      acs_menu,
      acs_show:!this.data.acs_show,
      select_pallet_detail: e.currentTarget.dataset.pallet,
      select_pallet_index : e.currentTarget.dataset.index
    })
  },

  acs_close(){
    this.setData({ acs_show: false });
  },

  //选中的操作
   select_action: async function (e){
    let d = this.data.select_pallet_detail

    if(e.detail.name == "删除包装"){
      let list = this.data.pallet_list
      let index = this.data.select_pallet_index
      let param = `?script.param=${d.id}`
      let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/pallet/script/del_pallet/${param}`
      let res = await api.runscript(url)
      if(res.scriptError == 0){
        list.splice(index,1)
        this.setData({
          pallet_list:list
        })
        wx.showToast({
          title: '成功删除',
        })
      }
    }else if(e.detail.name == "编辑包装"){
      wx.navigateTo({
        url: `../pallet_detail/index?id=${d.id}&nr=${d.nr}&name=${d.name}`
      })
    }else if(e.detail.name == "包装码单"){
      wx.navigateTo({
        url: `../bundle_list/index?id=${d.id}`
      })
    }
  },

  //新增包装
  add_new_pallet:function(){
    wx.navigateTo({
      url: `../pallet_detail/index`
    })
  },

  //获取包装列表
  getlist: async function(){
    wx.showLoading({
      title: '加载中',
    })
    let openid = app.globalData.openid
    let param = `?script.param=${openid}`
    let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/pallet/script/list_pallet/${param}`
    let res = await api.runscript(url)
    let result = JSON.parse(res.scriptResult)
    let pallet_list = JSON.parse(result.list)
    this.setData({
      pallet_list
    }) 
    wx.hideLoading()
    },


  onLoad: function () {
 
  },
  onShow:function(){
    this.getlist()
  }

})

