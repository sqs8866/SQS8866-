Page({
  data: {},
  onLoad() {
    console.log('这是小程序首页')
  },
  gotoLog(){
    wx.navigateTo({
      url: '../index/index',
      success: (result)=>{
      },
      fail: ()=>{},
      complete: (result)=>{
        console.log(result)
      }
    });
  },
  gotoSecond(){
    wx.navigateTo({
      url: '../second/index',
    })
  },
  gotoThird(){
    wx.navigateTo({
      url: '../third/index',
    })
  },
  gotoFourth(){
    wx.navigateTo({
      url: '../fourth/index',
    })
  },
  gotoFifth(){
    wx.navigateTo({
      url: '../fifth/index',
    })
  },
  gotoSixth(){
    wx.navigateTo({
      url: '../sixth/index',
    })
  },
  gotoSeventh(){
    wx.navigateTo({
      url: '../seventh/index',
    })
  },
});
