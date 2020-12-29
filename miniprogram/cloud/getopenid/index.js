// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main =  (event, context) => {
  return new Promise((resolve,reject)=>{
    let res = cloud.getWXContext()
    resolve(res.OPENID)
  })
}