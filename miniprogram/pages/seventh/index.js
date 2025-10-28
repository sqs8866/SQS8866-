// page.js
const { rgbToHsl, hslToRgb, getComplementaryColor } = require('./colorUtils')
Page({
  data: {
    r: 128,
    g: 128,
    b: 128,
    complementary: []
  },

  updateScheme() {
    const { r, g, b } = this.data;
    const [h, s, l] = rgbToHsl(r, g, b);

    // 生成互补色
    const comp = getComplementaryColor(h, s, l);
    const compRgb = hslToRgb(comp.h, comp.s, comp.l);

    this.setData({
      complementary: [[r, g, b], compRgb]
    });

  },

  onRedChange(e) { this.setData({ r: e.detail.value }); this.updateScheme(); },
  onGreenChange(e) { this.setData({ g: e.detail.value }); this.updateScheme(); },
  onBlueChange(e) { this.setData({ b: e.detail.value }); this.updateScheme(); },

  onLoad() {
    this.updateScheme();
  }
});