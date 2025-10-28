const hslToRgb = function(h, s, l){
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const getAnalogousColors = function(h, s, l){
  return [
    { h: (h + 30) % 360, s, l },
    { h: (h - 30 + 360) % 360, s, l }
  ];
}

const getComplementaryColor = function(h, s, l){
  return { h: (h + 180) % 360, s, l };
}

 const getTriadicColors = function(h, s, l){
  return [
    { h: (h + 120) % 360, s, l },
    { h: (h + 240) % 360, s, l }
  ];
}

// utils/colorUtils.js
const rgbToHsl = function(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 灰色
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l]; // 返回 [H, S, L]
}


module.exports = {
  rgbToHsl,
  hslToRgb,
  getAnalogousColors,
  getComplementaryColor,
}