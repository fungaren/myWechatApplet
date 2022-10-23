const app = getApp()
const api = require("../../utils/api")
const utils = require('../../utils/utils')

Page({
  data: {
    isLastPage: false,
    posts: [],
    searchKey: "",
    page: 1,
  },
  // 用户分享该页面
  onShareAppMessage() {
    return {
      title: app.conf.websiteName + ' 博客小程序',
      path: 'pages/index/index',
      success(res) {
        // 转发成功
      },
      fail(res) {
        // 转发失败
      },
    }
  },
  // 用户下拉刷新
  onPullDownRefresh() {
    // 直接修改 this.data 而不调用 this.setData 是无法改变页面的状态的
    this.setData({
      isLastPage: false,
      posts: [],
      page: 1,
    })
    this.onLoad()
  },
  onLoad(options) {
    api.getCategories()
    api.getPosts(this.data.page).then(e => {
      this.combinePosts(e)
      wx.stopPullDownRefresh()
    })
  },
  // 合并新拉取的文章列表
  combinePosts(e) {
    if (!e) return
    this.setData({
      isLastPage: e.isLastPage,
      page: this.data.page + (e.posts.length > 0 ? 1 : 0),
      posts: this.data.posts.concat(e.posts)
    })
  },
  // 搜索文章
  onSearch(e) {
    if (this.data.searchKey != "") {
      wx.navigateTo({
        url: '../list/list?searchKey=' + encodeURIComponent(this.data.searchKey)
      })
    } else {
      wx.showToast({
        title: '搜索关键字为空',
        icon: 'error',
        mask: false,
        duration: 2000
      })
    }
  },
  // 加载更多内容
  loadMore(e) {
    if (this.data.isLastPage) {
      wx.showToast({
        icon: 'error',
        title: '没有更多内容',
        mask: false,
        duration: 2000
      })
      return
    }
    api.getPosts(this.data.page).then(e => this.combinePosts(e))
  },
  // 跳转至查看文章详情
  redirectDetail(e) {
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.id
    })
  },
  // 跳转至主题列表
  redirectTopic(e) {
    wx.navigateTo({
      url: '../topic/topic'
    })
  },
  // 跳转至关于页面
  redirectAbout(e) {
    wx.navigateTo({
      url: '../about/about'
    })
  },
  nop(e) {},
})
