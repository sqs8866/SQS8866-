// JS - 增强版调色板
Page({
  data: {
    brushColor: '#000000',
    colorPalette: ''
  },

  onLoad(){
    const colorPalette = this.generateEnhancedColorPalette()
    this.setData({colorPalette})
  },
  // 生成增强版调色板
  generateEnhancedColorPalette() {
    const palette = []
    
    // 1. 基础颜色
    const baseColors = [
      '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
      '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
    ]
    palette.push(...baseColors)
    
    // 2. 完整的色相环（24色）
    for (let i = 0; i < 24; i++) {
      const hue = (i * 360) / 24
      const color = this.hslToHex(hue, 100, 50)
      palette.push(color)
    }
    
    // 3. 完整的灰度（16级）
    for (let i = 0; i <= 15; i++) {
      const grayValue = Math.round(i * 17)
      const grayHex = grayValue.toString(16).padStart(2, '0')
      palette.push(`#${grayHex}${grayHex}${grayHex}`)
    }
    
    // 4. 常用网页安全色
    const webSafeColors = [
      '#990000', '#cc0000', '#ff3333', '#ff6666', '#ff9999',
      '#006600', '#009900', '#00cc00', '#33ff33', '#66ff66',
      '#000066', '#000099', '#0000cc', '#3333ff', '#6666ff',
      '#663300', '#996600', '#cc9900', '#ffcc00', '#ffff33'
    ]
    palette.push(...webSafeColors)
    
    // 5. 柔和的 pastel 颜色
    const pastelColors = [
      '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff',
      '#e0bbe4', '#fadadd', '#d6eaff', '#d4edda', '#fff3cd'
    ]
    palette.push(...pastelColors)
    
    return palette
  },

  // HSL转Hex颜色（同上）
  hslToHex(h, s, l) {
    h = h / 360
    s = s / 100
    l = l / 100
    
    let r, g, b
    
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  },

  // 选择颜色
  onPaletteSelect(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ brushColor: color })
    wx.setStorage({
      key: 'colorselect',
      data: color
    })
  }
})