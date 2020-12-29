// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'scancode-6gp1h01lfb133811'
})
//操作excel用的类库
const xlsx = require('node-xlsx')
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let {userdata} = event
    let { OPENID} =cloud.getWXContext()

    //1,定义excel表格名
    let dataCVS = `${OPENID}.xlsx`
    console.log(dataCVS)
    
    //2，定义存储数据的
    let alldata = [];
    let row = ['树号', '捆号', '张数', '长度', '宽度', '面积']; //表属性
    alldata.push(row);

    for (let key in userdata) {
      let arr = [];
      arr.push(userdata[key].log);
      arr.push(userdata[key].bundle);
      arr.push(userdata[key].pcs);
      arr.push(userdata[key].length);
      arr.push(userdata[key].width);
      arr.push(Number(userdata[key].qty));
      alldata.push(arr)
    }
    console.log(alldata)
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }

}