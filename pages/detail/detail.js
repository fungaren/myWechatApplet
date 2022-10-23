const app = getApp()
const api = require('../../utils/api')
const utils = require('../../utils/utils')

Page({
  data: {
    id: 0,
    title: '文章标题',
    categoryId: 0,
    categoryName: '文章分类',
    date: '0000-00-00',
    content: {},
    commentOpen: true,
    commentPage: 1,
    isLastPage: false,
    comments: [],
    userInfo: null,
  },
  // 用户分享该页面
  onShareAppMessage(res) {
    return {
      title: this.data.title,
      path: 'pages/detail/detail?id=' + this.data.id,
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
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    }
    if (!options.id || options.id == 0)
      return
    wx.getSystemInfo().then(e => {
      this.setData({
        systemInfo: e
      })
    })
    api.getPostData(options.id).then(e => {
      if (!e) return
      const result = app.towxml(e.content, 'html',{
        base: app.conf.domain,
        theme: this.data.systemInfo.theme,
        events: {
          tap: this.onClickContent,
        },
      })
      this.setData({
        id: options.id,
        title: e.title,
        date: e.date,
        content: result,
        categoryId: e.categoryId,
        categoryName: e.categoryName,
        commentOpen: e.commentOpen,
      })
    })
    api.getComments(1, options.id).then(e => {
      if (!e) return
      this.setData({
        isLastPage: e.isLastPage,
        commentPage: this.data.commentPage + (e.comments.length > 0 ? 1 : 0),
        comments: this.data.comments.concat(e.comments),
      })
    })
  },
  // 点击正文时触发
  onClickContent(e) {
    const data = e.currentTarget.dataset.data
    console.log(data)
    if (data.tag == "navigator") {
      // 点击超链接时复制 URL
      utils.openHyperLink(data.attrs.href)
    }
  },
  // 用户点击捐赠
  onDonate() {
    wx.previewImage({
      urls: [app.conf.rewardImgUrl],
    })
  },
  // 用户点击授权按钮的响应
  getUserInfo(e) {
    wx.getUserProfile({
      desc: '登录',
      success: res => {
        console.log('用户同意授权', res.userInfo)
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo
        })
      },
    })
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
      e.content.rendered = utils.decodeHtmlEntities(e.content.rendered)
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
