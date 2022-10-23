const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    categoriesList: [],
  },
  // 用户下拉刷新
  onPullDownRefresh() {
    this.setData({
      categoriesList: [],
    })
    this.onLoad()
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '文章分类'
    })
    api.getCategories().then(() => {
      this.setData({
        categoriesList: app.globalData.categoriesList,
      })
      wx.stopPullDownRefresh()
    })
  },
  // 用户分享该页面
  onShareAppMessage() {
    return {
      title: app.conf.websiteName + '的文章分类',
      path: 'pages/topic/topic',
      success(res) {
        // 转发成功
      },
      fail(res) {
        // 转发失败
      },
    }
  },
  // 跳转至某分类下的文章列表
  listAll(e) {
    wx.navigateTo({
      url: '../list/list?categoryId=' + e.currentTarget.dataset.id
    })
  },
})
