Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentImg:'../../assets/car.png',
    animationData: {},             // 存储动画
    animation: null,
  },
  
  onReady() {
    this.animation = wx.createAnimation({
      duration: 0, // 动画时长由具体动作决定
      timingFunction: 'ease'
    });

    // 预加载音效
    this.punchSound = wx.createInnerAudioContext();
    this.punchSound.src = '../../assets/bullet.mp3';

    this.oopsSound = wx.createInnerAudioContext();
    this.oopsSound.src = '../../assets/boom.mp3';
  },
  onHit() {
    // 随机选择一种被打反应
    const reactions = ['shake', 'fall', 'wobble', 'explode'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    this[randomReaction]();
    
    // 播放音效
    this.punchSound.play();
    if (Math.random() > 0.7) {
      this.oopsSound.play();
    }
  },
  shake() {
    this.animation
      .rotate(15).step({ duration: 50 })
      .rotate(-15).step({ duration: 50 })
      .rotate(10).step({ duration: 40 })
      .rotate(-10).step({ duration: 40 })
      .rotate(0).step({ duration: 30 });
    
    this.setData({
      animationData: this.animation.export()
    });
  },

  // 后仰跌倒
  fall() {
    this.animation
      .translateY(-10).rotate(-10).step({ duration: 100 })
      .translateY(30).rotate(-30).step({ duration: 200 })
      .step({ duration: 500 }); // 停留一下
    
    this.setData({
      animationData: this.animation.export()
    });

    // 1秒后恢复站立
    setTimeout(() => {
      this.reset();
    }, 800);
  },

  // 抖动（像果冻）
  wobble() {
    this.animation
      .scale(1.1, 0.9).step({ duration: 80 })
      .scale(0.9, 1.1).step({ duration: 80 })
      .scale(1.05, 0.95).step({ duration: 80 })
      .scale(1, 1).step({ duration: 80 });
    
    this.setData({
      animationData: this.animation.export()
    });
  },

  // 爆炸头（可用 CSS 配合）
  explode() {
    this.setData({
      currentImg: '../../assets/explosion.png' // 提前准备一张“爆炸头”图
    });

    setTimeout(() => {
      this.reset();
    }, 600);
  },

  // 恢复站立状态
  reset() {
    this.animation.rotate(0).translateY(0).scale(1,1).step({ duration: 1 });
    this.setData({
      animationData: this.animation.export(),
      currentImg: '../../assets/explosion.png'
    });
  }

})