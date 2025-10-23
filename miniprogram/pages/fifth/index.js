// pages/image-cropper/image-cropper.js
require
Page({
  data: {
    selectedImage: '', // 选择的图片路径
    canvasWidth: 400,
    canvasHeight: 400,
    ctx: null,
    canvas: null,

    // 选择圆圈相关
    circleX: 200, // 圆圈中心X坐标
    circleY: 200, // 圆圈中心Y坐标
    circleRadius: 80, // 圆圈半径
    circleMinRadius: 20, // 最小半径
    circleMaxRadius: 150, // 最大半径

    // 拖动状态
    isDragging: false, // 是否在拖动位置
    isResizing: false, // 是否在调整大小
    dragStartX: 0,
    dragStartY: 0,
    startRadius: 0,

    // 图片信息
    imageInfo: null,
    originalImage: null
  },

  onLoad() {
    this.initCanvas()
  },

  // 初始化Canvas
  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#previewCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = this.data.canvasWidth * dpr
          canvas.height = this.data.canvasHeight * dpr
          ctx.scale(dpr, dpr)

          this.setData({
            ctx: ctx,
            canvas: canvas
          })

          // 绘制初始状态
          this.drawInitialState()
        }
      })
  },

  // 绘制初始状态（没有图片时的网格）
  drawInitialState() {
    const ctx = this.data.ctx
    ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)

    // 绘制网格背景
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    // 绘制网格线
    for (let i = 0; i <= this.data.canvasWidth; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, this.data.canvasHeight)
      ctx.stroke()
    }
    for (let i = 0; i <= this.data.canvasHeight; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(this.data.canvasWidth, i)
      ctx.stroke()
    }

    // 绘制提示文字
    ctx.fillStyle = '#999'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('请选择图片', this.data.canvasWidth / 2, this.data.canvasHeight / 2)
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          selectedImage: tempFilePath
        }, () => {
          this.loadAndDrawImage()
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  // 加载并绘制图片
  loadAndDrawImage() {
    const img = this.data.canvas.createImage()

    img.onload = () => {
      // 保存原始图片对象
      this.data.originalImage = img

      // 计算图片显示尺寸（保持原始比例，最大不超过400）
      let displayWidth = img.width
      let displayHeight = img.height

      if (img.width > this.data.canvasWidth || img.height > this.data.canvasHeight) {
        // 图片太大，需要缩放
        const scale = Math.min(
          this.data.canvasWidth / img.width,
          this.data.canvasHeight / img.height
        )
        displayWidth = img.width * scale
        displayHeight = img.height * scale
      }

      // 居中显示
      const x = (this.data.canvasWidth - displayWidth) / 2
      const y = (this.data.canvasHeight - displayHeight) / 2

      // 保存图片信息
      this.setData({
        imageInfo: {
          x, y,
          width: displayWidth,
          height: displayHeight,
          originalWidth: img.width,
          originalHeight: img.height,
          scale: displayWidth / img.width // 实际显示缩放比例
        }
      })

      // 重置圆圈位置到图片中心
      const centerX = x + displayWidth / 2
      const centerY = y + displayHeight / 2
      const maxRadius = Math.min(displayWidth, displayHeight) * 0.4 // 最大半径为图片尺寸的40%

      this.setData({
        circleX: centerX,
        circleY: centerY,
        circleMaxRadius: Math.min(this.data.circleMaxRadius, maxRadius),
        circleRadius: Math.min(80, maxRadius) // 初始半径为80或最大半径的较小值
      })

      // 绘制图片和选择圆圈
      this.redrawCanvas()
    }

    img.onerror = (err) => {
      console.error('图片加载失败:', err)
      wx.showToast({
        title: '图片加载失败',
        icon: 'none'
      })
    }

    img.src = this.data.selectedImage
  },

  // 重新绘制Canvas（图片 + 选择圆圈）
  redrawCanvas() {
    const ctx = this.data.ctx

    // 清空画布
    ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)

    if (this.data.originalImage && this.data.imageInfo) {
      const { x, y, width, height } = this.data.imageInfo

      // 绘制图片
      ctx.drawImage(this.data.originalImage, x, y, width, height)
    }

    // 绘制选择圆圈
    this.drawSelectionCircle()
  },

  // 绘制选择圆圈
  drawSelectionCircle() {
    const ctx = this.data.ctx
    const { circleX, circleY, circleRadius, imageInfo } = this.data

    if (!imageInfo) return

    // 绘制半透明蒙版（只在图片区域外）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)

    // 清除图片区域的蒙版
    ctx.save()
    ctx.beginPath()
    ctx.rect(imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height)
    ctx.clip()
    ctx.clearRect(imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height)
    ctx.restore()

    // 使用剪辑路径创建圆形透明区域
    ctx.save()
    ctx.beginPath()
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2)
    ctx.clip()

    // 在剪辑区域内绘制原始图片
    if (this.data.originalImage && this.data.imageInfo) {
      const { x, y, width, height } = this.data.imageInfo
      ctx.drawImage(this.data.originalImage, x, y, width, height)
    }

    ctx.restore()

    // 绘制圆圈边框
    ctx.beginPath()
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#007AFF'
    ctx.lineWidth = 3
    ctx.stroke()

    // 绘制十字准星
    ctx.strokeStyle = '#007AFF'
    ctx.lineWidth = 2

    // 水平线
    ctx.beginPath()
    ctx.moveTo(circleX - 15, circleY)
    ctx.lineTo(circleX + 15, circleY)
    ctx.stroke()

    // 垂直线
    ctx.beginPath()
    ctx.moveTo(circleX, circleY - 15)
    ctx.lineTo(circleX, circleY + 15)
    ctx.stroke()

    // 绘制中心拖动点
    ctx.fillStyle = '#007AFF'
    ctx.beginPath()
    ctx.arc(circleX, circleY, 8, 0, Math.PI * 2)
    ctx.fill()

    // 绘制大小调整点（圆圈边缘）
    ctx.fillStyle = '#FF3B30'
    ctx.beginPath()
    ctx.arc(circleX + circleRadius, circleY, 12, 0, Math.PI * 2)
    ctx.fill()

    // 绘制半径指示文字
    ctx.fillStyle = '#007AFF'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`半径: ${Math.round(circleRadius)}px`, circleX, circleY - circleRadius - 20)
  },

  // 触摸开始
  touchStart(e) {
    if (!this.data.selectedImage || !this.data.imageInfo) return

    const touch = e.touches[0]
    const x = touch.x
    const y = touch.y

    // 检查触摸位置
    const distanceToCenter = Math.sqrt(
      Math.pow(x - this.data.circleX, 2) +
      Math.pow(y - this.data.circleY, 2)
    )

    const distanceToResizeHandle = Math.sqrt(
      Math.pow(x - (this.data.circleX + this.data.circleRadius), 2) +
      Math.pow(y - this.data.circleY, 2)
    )

    if (distanceToResizeHandle <= 15) {
      // 点击在大小调整点上
      this.setData({
        isResizing: true,
        dragStartX: x,
        dragStartY: y,
        startRadius: this.data.circleRadius
      })
    } else if (distanceToCenter <= this.data.circleRadius + 20) {
      // 点击在圆圈内（拖动位置）
      this.setData({
        isDragging: true,
        dragStartX: x,
        dragStartY: y
      })
    }
  },

  // 触摸移动
  touchMove(e) {
    if (!this.data.selectedImage) return

    const touch = e.touches[0]
    const x = touch.x
    const y = touch.y

    if (this.data.isDragging) {
      // 拖动位置
      const deltaX = x - this.data.dragStartX
      const deltaY = y - this.data.dragStartY

      // 计算新的位置
      let newX = this.data.circleX + deltaX
      let newY = this.data.circleY + deltaY

      // 限制在图片范围内（考虑圆圈半径）
      const { imageInfo, circleRadius } = this.data
      const minX = imageInfo.x + circleRadius
      const maxX = imageInfo.x + imageInfo.width - circleRadius
      const minY = imageInfo.y + circleRadius
      const maxY = imageInfo.y + imageInfo.height - circleRadius

      newX = Math.max(minX, Math.min(maxX, newX))
      newY = Math.max(minY, Math.min(maxY, newY))

      this.setData({
        circleX: newX,
        circleY: newY,
        dragStartX: x,
        dragStartY: y
      })

    } else if (this.data.isResizing) {
      // 调整大小
      const deltaX = x - this.data.dragStartX
      let newRadius = this.data.startRadius + deltaX

      // 限制半径范围
      newRadius = Math.max(
        this.data.circleMinRadius,
        Math.min(this.data.circleMaxRadius, newRadius)
      )

      // 检查是否超出图片边界
      const { imageInfo, circleX, circleY } = this.data
      const maxRadiusX = Math.min(
        circleX - imageInfo.x,
        imageInfo.x + imageInfo.width - circleX
      )
      const maxRadiusY = Math.min(
        circleY - imageInfo.y,
        imageInfo.y + imageInfo.height - circleY
      )
      const maxRadiusInImage = Math.min(maxRadiusX, maxRadiusY)

      newRadius = Math.min(newRadius, maxRadiusInImage)

      this.setData({
        circleRadius: newRadius
      })
    }

    // 重绘画布
    this.redrawCanvas()
  },

  // 触摸结束
  touchEnd() {
    this.setData({
      isDragging: false,
      isResizing: false
    })
  },

  // 导出选中区域
  exportSelectedArea() {
    if (!this.data.selectedImage || !this.data.imageInfo) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '生成图片中...' })

    // 创建临时canvas用于导出
    const query = wx.createSelectorQuery()
    query.select('#exportCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const exportCanvas = res[0].node
          const exportCtx = exportCanvas.getContext('2d')

          // 设置导出canvas尺寸为圆圈直径（使用原始图片分辨率）
          const diameter = this.data.circleRadius * 2
          const dpr = wx.getSystemInfoSync().pixelRatio
          exportCanvas.width = diameter * dpr
          exportCanvas.height = diameter * dpr
          exportCtx.scale(dpr, dpr)

          // 计算在原始图片中的位置
          const { imageInfo, circleX, circleY, circleRadius } = this.data

          // 将画布坐标转换为图片原始坐标
          const imageRelativeX = (circleX - imageInfo.x) / imageInfo.scale
          const imageRelativeY = (circleY - imageInfo.y) / imageInfo.scale
          const imageRelativeRadius = circleRadius / imageInfo.scale

          // 在导出canvas上绘制圆形区域
          exportCtx.save()
          exportCtx.beginPath()
          exportCtx.arc(circleRadius, circleRadius, circleRadius, 0, Math.PI * 2)
          exportCtx.clip()

          exportCtx.drawImage(
            this.data.originalImage,
            imageRelativeX - imageRelativeRadius,
            imageRelativeY - imageRelativeRadius,
            imageRelativeRadius * 2,
            imageRelativeRadius * 2,
            0,
            0,
            diameter,
            diameter
          )

          exportCtx.restore()

          // 转换为临时文件
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvas: exportCanvas,
              success: (res) => {
                // 保存到相册
                wx.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: () => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '导出成功',
                      icon: 'success',
                      duration: 2000
                    })
                  },
                  fail: (err) => {
                    wx.hideLoading()
                    console.error('保存失败:', err)
                    wx.showToast({
                      title: '导出失败',
                      icon: 'none'
                    })
                  }
                })
              },
              fail: (err) => {
                wx.hideLoading()
                console.error('生成图片失败:', err)
                wx.showToast({
                  title: '生成图片失败',
                  icon: 'none'
                })
              }
            })
          }, 500)
        }
      })
  }
})