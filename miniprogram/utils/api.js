
const getnewtoken = () => {
  return new Promise((resolve, reject)=>{
    let userpsw = 'Ym9zczoxcTJ3M2U0cg=='
    wx.request({
    url: 'https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/sessions',
    method:'POST',
    header:{
     'Authorization': `Basic ${userpsw}`
    },
    success:function(res){
      console.log('getnewtoken=====',res.data.response.token);
      wx.setStorageSync('token', res.data.response.token);
      resolve(res.data)
    }
   })
  })
 }
 
 const getrecord = (url) => {
   return new Promise((resolve, reject)=>{
    let token = wx.getStorageSync('token')
     wx.request({
      //  url: 'https://fengchaotech.cn:8443/fmi/data/v1/databases/mp_scan/layouts/user/records?_limit=20000',
      url:url,
       method:'GET',
       header:{
         'Authorization': `Bearer ${token}`
       },
       complete:(res)=>{
         let code = res.data.messages[0].code
         if(code == 952 || code == 10){ 
             getnewtoken().then(()=>{
             getrecord(url).then((res)=> resolve(res))
           })}else{
             resolve(res.data.response)
         }
       }
     })
   })
 }

 const findrecord = (url,data) => {
  return new Promise((resolve, reject)=>{
    let token = wx.getStorageSync('token')
    wx.request({
     url:url,
      method:'POST',
      data:data,
      header:{
        'Authorization': `Bearer ${token}`
      },
      complete:function(res){
        let code = res.data.messages[0].code
        if(code == 952 || code == 10){ 
            getnewtoken().then(()=>{
              findrecord(url,data).then((res)=> resolve(res))
          })}else{
            // resolve(res.data.response)
            resolve(res) 
        }
      }
    })
  })
}

const creatrecord = (url,data) => {
  return new Promise((resolve, reject)=>{
    let token = wx.getStorageSync('token')
    wx.request({
      url:url,
      method:'POST',
      data:data,
      header:{
        'Authorization': `Bearer ${token}`
      },
      complete:function(res){
        let code = res.data.messages[0].code
        if(code == 952 || code == 10){ 
            getnewtoken().then(()=>{
              creatrecord(url,data).then((res)=> resolve(res))
          })}else{
            // resolve(res.data.response)
            resolve(res) 
        }
      }
    })
  })
}

const  runscript = (url) => {
  return new Promise((resolve, reject)=>{
   let token = wx.getStorageSync('token')
    wx.request({
      url:url,
      method:'GET',
      header:{
        'Authorization': `Bearer ${token}`
      },
      complete:(res)=>{
        // console.log(res);
        let code = res.data.messages[0].code
        if(code == 952 || code == 10){ 
            getnewtoken().then(()=>{
              runscript(url).then((res)=> resolve(res))
          })
        }else{
            resolve(res.data.response)
        }
      }
    })
  })
}



 module.exports = {
   getrecord: getrecord,
   getnewtoken: getnewtoken,
   findrecord: findrecord,
   creatrecord : creatrecord,
   runscript : runscript
 }

 //it is very important333
