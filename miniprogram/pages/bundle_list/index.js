// miniprogram/pages/index/index.js
//引用外部函数（包含识别逻辑）
// var utils = require('../../utils/utils.js')
const app = getApp()
const api = app.globalData.api
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

const createRecycleContext = require('miniprogram-recycle-view');

function rpx2px(rpx) {
  return (rpx / 750) * wx.getSystemInfoSync().windowWidth
}



Page({
    data: {
    height:0,
    pallet_id:"",
    acs_show: false,
    acs_menu:"",
    menu_bundle: [
      { name: '编辑单捆',color:""},
      { name: '删除单捆',color:"red"}
    ],
    menu_tile:[
      { name: '新增单捆',color:""},
      { name: '导出码单',color:""}
    ],
    select_bundle_detail:"",
    select_bundle_index:"",
    total_count:0,
    total_qty:0,
  },

  //定义ctx函数
  ctx:function(){
    var ctx = createRecycleContext({
      id: 'recycleId',
      dataKey: 'recycleList',
      page: this,
      itemSize: {
        width: rpx2px(750),
        height: rpx2px(60)
      }
    })
    return ctx
  },

     //把数据保存到excel里，并把excel保存到云存储
     savaExcel(userdata) {
      let that = this
      wx.showLoading({
        title: '导出中',
      })
      wx.cloud.callFunction({
        name: "excel",
        data: {
          userdata: userdata
        },
        success:res => {
          wx.hideLoading()
          Dialog.confirm({
            title: '成功导出码单文件',
            message: '苹果手机端无法直接分享文件，请复制文件链接处理。安卓手机端可以直接预览分享文件',
            confirmButtonText:'预览文件',
            cancelButtonText : '复制链接'
          })
            .then(() => {
              that.openFileUrl(res.result.fileID) 
              // on confirm
            })
            .catch(() => {
              // on cancel
              that.copyFileUrl(res.result.fileID) 
            })
        },
        fail:res  => {}
      })
    },
  
     //获取云存储文件下载地址，这个地址有效期一天
     openFileUrl(fileID) {
      wx.cloud.downloadFile({
        fileID: fileID,
        success: res => {
          wx.openDocument({
            filePath: res.tempFilePath ,
            success:res => {}
          })
        },
        fail: err => {}
      })
    },
  
    //复制excel文件下载链接
    copyFileUrl(fileID) {
      wx.cloud.getTempFileURL({
        fileList: [fileID],
        success: res => {
          // console.log(res.fileList[0].tempFileURL);       
          wx.setClipboardData({
            data: res.fileList[0].tempFileURL
          })
        },
        fail: err => {
          console.log('下载链接失败')
        }
      })
    },

    //==bundle_detail页面修改完成的bundle,触发此函数
  change_bundle_detail(index,res,total_count,total_qty){
    if(index == undefined){
      let str = JSON.stringify(res)
      let str1 = `[${str}]`
      let list = JSON.parse(str1)
      this.ctx().append(list)
    }else{
      // let data = JSON.parse(res)
      this.ctx().splice(index,1,res)
    }
    this.setData({
      total_count,total_qty
    })
  },

    //===弹出操作菜单
    actionSheetTap_bundle(e){
      let acs_menu = this.data.menu_bundle
      let d = e.currentTarget.dataset
      this.setData({
        acs_menu,
        acs_show:!this.data.acs_show,
        select_bundle_detail:d.bundle,
        select_bundle_index:d.index
      })
    },
    actionSheetTap_title(e){
      let acs_menu = this.data.menu_tile
      this.setData({
        acs_menu,
        acs_show:!this.data.acs_show,
      })
    },
    acs_close(){
      this.setData({ acs_show: false });
    },

  //====选中的操作
  select_action: async function(e){
    let pallet_id = this.data.pallet_id
    // let pallet_id = "41497172-AF5B-462E-AAE4-F2285A1B1357"
    let d = this.data.select_bundle_detail
    let index = this.data.select_bundle_index
    if(e.detail.name == "删除单捆"){
      let index = this.data.select_bundle_index
      // let param = `?script.param=${d.id}|41497172-AF5B-462E-AAE4-F2285A1B1357`
      let param = `?script.param=${d.id}|${pallet_id}`
      let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/bundle/script/del_bundle/${param}`
      let res = await api.runscript(url)
      let result = JSON.parse(res.scriptResult)
      if(result.code == 0){
        this.ctx().splice(index,1)
        wx.showToast({
          title: '成功删除',
        })
        let total_count = result.count
        let total_qty = result.total
        this.setData({total_count,total_qty})
      }

    }else if(e.detail.name == "编辑单捆"){
      wx.navigateTo({
        url: `../bundle_detail/bundle_detail?index=${index}&id=${d.id}&log=${d.log}&bundle=${d.bundle}&pcs=${d.pcs}&length=${d.length}&width=${d.width}&qty=${d.qty}&pallet_id=${pallet_id}`
      })
    }else if(e.detail.name == "新增单捆"){
      wx.navigateTo({
        url: `../bundle_detail/bundle_detail?&pallet_id=${pallet_id}`,
      })
    }else if(e.detail.name == "清空码单"){
      this.ctx().destroy()
      console.log(this.ctx().getList());
      this.setData({
        total_count:0,
        total_qty:0
      })
    }else if(e.detail.name == '导出码单'){ 
      let data = this.ctx().getList()
      let count = this.data.total_count
      if(count > 0){ this.savaExcel(data)}
    }
  },

    //扫描新增bundle
    scan_add_bundle: async function(){
      let res1 = await wx.scanCode({
        onlyFromCamera: false,
        scanType:'barCode',   
      })      
      if(res1.scanType != "QR_CODE"){
        let barcode = res1.result
        let param = `?script.param=${this.data.pallet_id}|${barcode}`
        // let param = `?script.param=41497172-AF5B-462E-AAE4-F2285A1B1357|${barcode}`
        let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/bundle/script/scan_new_bundle/${param}`
        let res = await api.runscript(url)
        let result = JSON.parse(res.scriptResult)
        // console.log(result);
        if(result.code == "重复"){
          await wx.showToast({
            title: '有重复捆',
          })
        }
        if(result.code == "未知"){
          wx.showToast({
            title: '未知条码',
          })
        }
        if(result.code == 0){
          let newList = JSON.parse(result.list)
          let total_count = result.count
          let total_qty = result.total
          this.ctx().append(newList)
          this.setData({
            total_count,total_qty
          })
        }
      }else{
        wx.showToast({
          title: '请扫描一维码',
        })
      }
     
    },

      //扫描删除bundle
      scan_del_bundle: async function(){
        let res1 = await wx.scanCode({
          onlyFromCamera: false,
          scanType:'barCode',   
        })      
        // console.log(res1);
        if(res1.scanType != "QR_CODE"){
          let barcode = res1.result
          let param = `?script.param=${this.data.pallet_id}|${barcode}`
          // let param = `?script.param=41497172-AF5B-462E-AAE4-F2285A1B1357|${barcode}`
          let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/bundle/script/scan_del_bundle/${param}`
          let res = await api.runscript(url)
          let result = JSON.parse(res.scriptResult)
          let code = result.code
          // console.log(result);
          if(code == "无此捆"){
            await wx.showToast({
              title: '无此捆信息',
            })
          }
          if(code == "未知"){
            wx.showToast({
              title: '未知条码',
            })
          }
          if(code == 0){
            let bundle = JSON.parse(result.list)[0]
            this.ctx().getList().some((item,i)=>{
              if(item.id === bundle.id) {
                this.ctx().splice(i,1)
                return true
              }
            })
            let total_count = result.count
            let total_qty = result.total
            this.setData({
              total_count,total_qty
            })
          }
        }else{
          wx.showToast({
            title: '请扫描一维码',
          })
        }
       
      },
  
 onLoad: async function (options) {
    this.setData({
      height:rpx2px(1000),
      pallet_id:options.id
    })
    // console.log(this.data.pallet_id);
  },


  onReady: async function() {
    let param = `?script.param=${this.data.pallet_id}`
    // let param = `?script.param=41497172-AF5B-462E-AAE4-F2285A1B1357`
    let url = `https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/bundle/script/list_bundle/${param}`
    let res = await api.runscript(url)
    let result = JSON.parse(res.scriptResult)
    let list = result.list
    let total_count = result.count
    let total_qty = result.total
    let newList = JSON.parse(list)
    // console.log(list);
    // let ctx = this.ctx1()
    this.ctx().append(newList)
    // ctx.append(newList)
    this.setData({
      total_count,total_qty
    })
},


})
