const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    id: app.conf.aboutId,
    title: '文章标题',
    date: '0000-00-00',
    content: '文章内容',
    commentOpen: true,
    commentPage: 1,
    isLastPage: false,
    comments: [],
    userInfo: {},
  },
  // 用户分享该页面
  onShareAppMessage(res) {
    return {
      title: '关于 ' + app.conf.websiteName + ' 官方小程序',
      path: 'pages/about/about',
      success(res) {
        // 分享成功
      },
      fail(res) {
        // 分享失败
      },
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
    wx.setNavigationBarTitle({
      title: '关于 ' + app.conf.websiteName + ' 官方小程序'
    })
    api.getPageData(app.conf.aboutPageId).then(e => {
      console.log(e)
      if (!e) return
      this.setData({
        id: app.conf.aboutPageId,
        title: e.title,
        date: e.date,
        content: e.content,
        commentOpen: e.commentOpen,
      })
    })
    api.getComments(1, app.conf.aboutPageId).then(e => {
      if (!e) return
      this.setData({
        isLastPage: e.isLastPage,
        commentPage: this.data.commentPage + (e.comments.length > 0 ? 1 : 0),
        comments: this.data.comments.concat(e.comments),
      })
    })
  },
  // 给a标签添加跳转和复制链接事件
  clickHref(e) {
    utils.openHyperLink(e.currentTarget.dataset.src)
  },
  // 用户点击捐赠
  onDonate() {
    wx.previewImage({
      urls: [app.conf.rewardImgUrl],
    })
  },
  // 用户点击授权按钮的响应
  onGetUserInfo(e) {
    if (e.detail.errMsg != 'getUserInfo:ok')
      console.warn('用户拒绝授权')
    else {
      console.log('用户同意授权', e.detail.userInfo)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo
      })
    }
  },
  // 用户点击提交评论
  onAddComment(e) {
    if (!this.data.commentOpen)
      return
    if (e.detail.value.comment == '') {
      wx.showToast({
        icon: 'error',
        title: '请填写评论内容',
        mask: false,
        duration: 2000,
      })
      return
    }
    api.addComment(this.data.id, e.detail.value.comment).then(e => {
      if (!e) return
      console.log(e)
      this.setData({
        comments: this.data.comments.concat([ e ])
      })
    })
  },
  // 加载更多评论
  loadMore(e) {
    if (this.data.isLastPage) {
      wx.showToast({
        icon: 'error',
        title: '没有更多评论',
        mask: false,
        duration: 2000
      })
    }
    api.getComments(this.data.commentPage, this.data.id).then(e => {
      if (!e) return
      this.setData({
        isLastPage: e.isLastPage,
        commentPage: this.data.commentPage + (e.comments.length > 0 ? 1 : 0),
        comments: this.data.comments.concat(e.comments)
      })
    })
  },
})
