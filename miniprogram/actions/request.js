wx.request({
  url: 'https://text-storage-api.onrender.com/api/save',
  method:'POST',
  data: {
    'text':'在线db存储||网站卡点了后等10秒||https://cloud.mongodb.com/v2/68f748ca136c7104efacad96#/metrics/replicaSet/68f74935d45997593a57ca4e/explorer/textdb/texts/find'
  },
  success (res) {
    console.log(res.data)
  }
})