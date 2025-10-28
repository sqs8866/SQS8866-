// pages/text-editor/text-editor.js
Page({
  data: {
    r: 128,
    g: 128,
    b: 128,
    hex: '808080'
  },

  onShow() {
    console.log('++sixth++sixth++sixth++sixth')
  },
  //转换十进制为十六紧张
  toHex(num) {
    const hex = num.toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  },
  //更新HEX值
  updateHex() {
    const { r, g, b } = this.data
    const hex = this.toHex(r) + this.toHex(g) + this.toHex(b)
    this.setData({ hex })
  },
  onRedChange(e) {
    this.setData({ r: e.detail.value });
    this.updateHex();
  },
  onGreenChange(e) {
    this.setData({ g: e.detail.value });
    this.updateHex();
  },
  onBlueChange(e) {
    this.setData({ b: e.detail.value });
    this.updateHex();
  },
  // 复制颜色值
  copyColor() {
    wx.setClipboardData({
      data: '#' + this.data.hex,
      success: () => {
        wx.showToast({ title: '已复制' });
      }
    })
  },
  resetColor(){
    this.setData({
      r: 128,
      g: 128,
      b: 128,
      hex: '808080'
    })
  }
})