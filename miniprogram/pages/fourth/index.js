Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0,
    brushSize: 10,
    brushColor: '#000000',
    isDrawing: false,
    ctx: null,
    canvas: null,
    history: [],
    maxHistory: 20,
    currentStep: -1
  },

  onReady() {
    this.getSystemInfo()
    this.initCanvas()
  },

  onShow() {
    const color = wx.getStorageSync('colorselect')
    if (color) {
      this.setData({ brushColor: color })
    }
  },

  getSystemInfo() {
    const sys = wx.getWindowInfo()
    this.setData({
      canvasWidth: sys.windowWidth,
      canvasHeight: sys.windowHeight - 70
    })
  },

  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas').boundingClientRect()
    query.select('#myCanvas').node()
    query.exec((res) => {
      if (!res || res.length < 2) return

      const rect = res[0]
      const canvasNode = res[1].node
      const dpr = wx.getSystemInfoSync().pixelRatio

      // ✅ 设置真实渲染尺寸
      canvasNode.width = this.data.canvasWidth * dpr
      canvasNode.height = this.data.canvasHeight * dpr

      const ctx = canvasNode.getContext('2d')
      ctx.scale(dpr, dpr)

      // 初始化背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)

      this.ctx = ctx // 直接挂载到实例，避免 setData
      this.canvas = canvasNode
      this.canvasLeft = rect.left
      this.canvasTop = rect.top

      // 保存初始状态
      this.saveToHistory()
    })
  },

  // 页面坐标转 Canvas 坐标
  getPageToCanvasPoint(pageX, pageY) {
    return {
      x: pageX - this.canvasLeft,
      y: pageY - this.canvasTop
    }
  },

  touchStart(e) {
    if (!this.ctx) return

    const touch = e.touches[0]
    const { x, y } = this.getPageToCanvasPoint(touch.pageX, touch.pageY)

    this.isDrawing = true
    this.lastX = x
    this.lastY = y

    // 开始路径
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  },

  touchMove(e) {
    if (!this.isDrawing || !this.ctx) return

    const touch = e.touches[0]
    const { x, y } = this.getPageToCanvasPoint(touch.pageX, touch.pageY)

    // ✅ 连续绘制，不频繁 beginPath
    this.ctx.lineTo(x, y)
    this.ctx.lineWidth = this.data.brushSize
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.strokeStyle = this.data.brushColor
    this.ctx.stroke()

    // ✅ 不用 setData，直接更新实例变量
    this.lastX = x
    this.lastY = y
  },

  touchEnd() {
    if (!this.isDrawing) return
    this.isDrawing = false

    // ✅ 路径结束
    this.ctx.closePath()

    // ✅ 只在抬起时保存一次，极大提升性能
    this.saveToHistory()
  },

  // ✅ 保存到历史记录
  saveToHistory() {
    if (!this.canvas || !this.ctx) return

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      canvas: this.canvas,
      success: (res) => {
        const newHistory = this.data.history.slice(0, this.data.currentStep + 1)
        newHistory.push(res.tempFilePath)

        if (newHistory.length > this.data.maxHistory) {
          newHistory.shift()
        }

        this.setData({
          history: newHistory,
          currentStep: newHistory.length - 1
        })
      },
      fail: (err) => {
        console.error('保存历史失败:', err)
      }
    })
  },

  // 恢复历史
  restoreFromHistory(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.data.history.length) return

    const imagePath = this.data.history[stepIndex]
    const image = this.canvas.createImage()
    image.onload = () => {
      this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
      this.ctx.drawImage(image, 0, 0, this.data.canvasWidth, this.data.canvasHeight)
    }
    image.src = imagePath
  },

  undo() {
    if (this.data.currentStep <= 0) {
      wx.showToast({ title: '没有可撤销的操作', icon: 'none' })
      return
    }

    const newStep = this.data.currentStep - 1
    this.setData({ currentStep: newStep })
    this.restoreFromHistory(newStep)
  },

  clearCanvas() {
    if (!this.ctx) return
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.saveToHistory()
  },

  saveImage() {
    if (!this.canvas) return

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      canvas: this.canvas,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存', icon: 'success' })
          },
          fail: () => {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        console.error('导出失败:', err)
        wx.showToast({ title: '导出失败', icon: 'none' })
      }
    })
  },

  sliderChange(e) {
    this.setData({ brushSize: e.detail.value })
  },

  onColorSelect() {
    wx.navigateTo({ url: '../color/index' })
  }
})