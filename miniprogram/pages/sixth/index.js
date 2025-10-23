// pages/text-editor/text-editor.js
Page({
  data: {
    selectedImage: '',
    screenWidth: 0,
    screenHeight: 0,
    ctx: null,
    canvas: null,

    // 文字编辑相关
    textElements: [], // 所有添加的文字元素
    currentText: '', // 当前输入的文字
    textColor: '#000000',
    textSize: 24,
    isAddingText: false, // 是否正在添加文字
    currentPosition: { x: 0, y: 0 } // 当前点击位置
  },

  onLoad() {
  },

  onShow() {
    console.log('++sixth++sixth++sixth++sixth')
  },

})