// pages/fireworks/fireworks.js
Page({
  data: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    ctx: null,
    canvas: null,
    fireworks: [],
    particles: [],
    isPlaying: true,
    animationId: null
  },

  onLoad() {
    this.getScreenInfo()
  },

  onReady() {
    setTimeout(() => {
      this.initCanvas()
    }, 100)
  },

  onUnload() {
    this.stopFireworks()
  },

  onHide() {
    this.stopFireworks()
  },

  onShow() {
    if (!this.data.isPlaying) {
      this.startFireworks()
    }
  },

  // 获取屏幕信息
  getScreenInfo() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      statusBarHeight: systemInfo.statusBarHeight || 0
    })
  },

  // 初始化Canvas
  initCanvas() {
    const that = this
    const query = wx.createSelectorQuery()
    query.select('#fireworksCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = that.data.screenWidth * dpr
          canvas.height = that.data.screenHeight * dpr
          ctx.scale(dpr, dpr)
          
          that.setData({ 
            ctx: ctx,
            canvas: canvas
          })
          
          that.clearCanvas()
          that.startFireworks()
        } else {
          setTimeout(() => {
            that.initCanvas()
          }, 100)
        }
      })
  },

  // 清空画布
  clearCanvas() {
    const ctx = this.data.ctx
    if (!ctx) return
    
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, this.data.screenWidth, this.data.screenHeight)
  },

  // 开始烟花效果
  startFireworks() {
    this.setData({ isPlaying: true })
    this.fireworksLoop()
  },

  // 停止烟花效果
  stopFireworks() {
    this.setData({ isPlaying: false })
    if (this.data.animationId) {
      clearTimeout(this.data.animationId)
    }
  },

  // 烟花主循环
  fireworksLoop() {
    if (!this.data.isPlaying || !this.data.ctx) return
    
    this.updateFireworks()
    this.drawFireworks()
    
    const animationId = setTimeout(() => {
      this.fireworksLoop()
    }, 1000 / 60)
    
    this.setData({ animationId })
  },

  // 更新烟花状态
  updateFireworks() {
    const { screenWidth, screenHeight } = this.data
    
    // 随机生成新烟花
    if (Math.random() < 0.06) {
      this.createFirework()
    }
    
    // 更新现有烟花
    const remainingFireworks = []
    this.data.fireworks.forEach(firework => {
      firework.y += firework.speed
      firework.speed += firework.gravity
      
      // 检查是否爆炸
      if (firework.speed >= 0 || firework.y < screenHeight * 0.3) {
        this.explodeFirework(firework)
      } else {
        remainingFireworks.push(firework)
      }
    })
    this.data.fireworks = remainingFireworks
    
    // 更新粒子
    const remainingParticles = []
    this.data.particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += particle.gravity
      particle.life -= 0.01
      
      if (particle.life > 0) {
        remainingParticles.push(particle)
      }
    })
    this.data.particles = remainingParticles
  },

  // 创建新烟花 - 调整速度参数
  createFirework() {
    const { screenWidth, screenHeight } = this.data
    
    const firework = {
      x: 50 + Math.random() * (screenWidth - 100),
      y: screenHeight,
      speed: -6 - Math.random() * 4.5, // 大幅降低上升速度：从-12~-17改为-6~-10
      gravity: 0.08, // 降低重力加速度
      color: this.getRandomColor(),
      size: 2 + Math.random() * 3,
      targetHeight: screenHeight * (0.2 + Math.random() * 0.4) // 目标爆炸高度
    }
    
    this.data.fireworks.push(firework)
  },

  // 烟花爆炸 - 调整爆炸参数
  explodeFirework(firework) {
    const particleCount = 80 + Math.floor(Math.random() * 60)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.8 + Math.random() * 2.5 // 降低爆炸速度
      
      this.data.particles.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.02, // 降低粒子重力
        life: 1,
        color: firework.color,
        size: 1 + Math.random() * 2,
        decay: 0.008 + Math.random() * 0.004 // 粒子衰减速度
      })
    }
  },

  // 绘制烟花和粒子
  drawFireworks() {
    const ctx = this.data.ctx
    if (!ctx) return
    
    // 半透明黑色覆盖，制造拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)' // 降低透明度，延长拖尾
    ctx.fillRect(0, 0, this.data.screenWidth, this.data.screenHeight)
    
    // 绘制上升的烟花
    this.data.fireworks.forEach(firework => {
      // 绘制烟花主体
      ctx.fillStyle = firework.color
      ctx.beginPath()
      ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2)
      ctx.fill()
      
      // 绘制烟花尾迹 - 更长的尾迹
      const trailLength = 15 + (firework.speed * -2) // 根据速度调整尾迹长度
      ctx.strokeStyle = firework.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(firework.x, firework.y)
      ctx.lineTo(firework.x, firework.y + trailLength)
      ctx.stroke()
      
      // 绘制尾迹火花
      ctx.fillStyle = this.hexToRgba(firework.color, 0.7)
      for (let i = 1; i <= 3; i++) {
        const sparkY = firework.y + trailLength * (i / 3)
        const sparkSize = firework.size * 0.6 * (1 - i / 3)
        ctx.beginPath()
        ctx.arc(firework.x, sparkY, sparkSize, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
    // 绘制爆炸粒子
    this.data.particles.forEach(particle => {
      const alpha = particle.life
      const color = this.hexToRgba(particle.color, alpha)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
      
      // 为部分粒子添加光晕效果
      if (Math.random() > 0.7) {
        ctx.fillStyle = this.hexToRgba(particle.color, alpha * 0.3)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  },

  // 获取随机颜色
  getRandomColor() {
    const colors = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
      '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40',
      '#FF3D00', '#FF1744', '#F50057', '#D500F9'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  },

  // 十六进制颜色转RGBA
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  },

  // 切换播放状态
  togglePlay() {
    if (this.data.isPlaying) {
      this.stopFireworks()
    } else {
      this.startFireworks()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 返回上一页
  goBack() {
    this.stopFireworks()
    wx.navigateBack()
  },

  // 触摸事件 - 点击屏幕添加烟花
  onCanvasTap(e) {
    if (!this.data.isPlaying) {
      this.startFireworks()
      this.setData({ isPlaying: true })
    }
    
    const touch = e.touches[0]
    this.createTouchFirework(touch.x, touch.y)
  },

  // 创建触摸烟花 - 调整参数
  createTouchFirework(x, y) {
    const particleCount = 60 + Math.floor(Math.random() * 40)
    const color = this.getRandomColor()
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 2 // 降低触摸烟花速度
      
      this.data.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.015,
        life: 1,
        color: color,
        size: 1 + Math.random() * 1.5,
        decay: 0.01
      })
    }
    
    // 添加二次爆炸效果
    setTimeout(() => {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + Math.random() * 1
        
        this.data.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.01,
          life: 0.8,
          color: color,
          size: 0.5 + Math.random() * 1,
          decay: 0.015
        })
      }
    }, 200)
  }
})