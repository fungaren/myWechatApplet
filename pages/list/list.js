const app = getApp()
const api = require('../../utils/api')

// 用于显示搜索结果、特定分类下的所有文章
Page({
  data: {
    isLastPage: false,
    posts: [],
    searchKey: "",
    page: 1,
    categoryId: 0,
    categoryName: "",
    categoryDescription: "",
  },
  // 用户分享该页面
  onShareAppMessage() {
    let title = app.conf.websiteName
    let path = "pages/list/list"
    if (this.data.searchKey && this.data.searchKey != "") {
      title += "中搜索：" + this.data.searchKey
      path += '?searchKey=' + encodeURIComponent(this.data.searchKey)
    } else if (this.data.categoryId && this.data.categoryId != 0) {
      title += "的专题：" + this.data.categoryName
      path += '?categoryId=' + this.data.categoryId
    }
    return {
      title: title,
      path: path,
      success (res) {
        // 转发成功
      },
      fail(res) {
        // 转发失败
      }
    }
  },
  // 用户下拉刷新
  onPullDownRefresh() {
    this.setData({
      isLastPage: false,
      posts: [],
      page: 1,
    })
    this.onLoad()
  },
  onLoad(options) {
    let posts = []
    if (options.categoryId && options.categoryId != 0) {
      category = app.globalData.categories[options.categoryId]
      this.setData({
        categoryId: options.categoryId,
        categoryName: category.name,
        categoryDescription: category.description,
      })
      wx.setNavigationBarTitle({
        title: this.data.categoryName
      })
      api.getPosts(this.data.page, this.data.categoryId).then(e => {
        this.combinePosts(e)
        wx.stopPullDownRefresh()
      })
    }
    if (options.searchKey && options.searchKey != '') {
      this.setData({
        searchKey: options.searchKey
      })
      wx.setNavigationBarTitle({
        title: options.searchKey + " 搜索结果"
      })
      api.getPosts(this.data.page, 0, this.data.searchKey).then(e => {
        this.combinePosts(e)
        wx.stopPullDownRefresh()
      })
    }
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
    if (this.data.searchKey && this.data.searchKey != '')
      api.getPosts(this.data.page, 0, this.data.searchKey).then(e => this.combinePosts(e))
    else if (options.categoryId && options.categoryId != 0)
      api.getPosts(this.data.page, this.data.categoryId).then(e => this.combinePosts(e))
  },
  // 跳转至查看文章详情
  redirectDetail(e) {
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.id
    })
  },
})
