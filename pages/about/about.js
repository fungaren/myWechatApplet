var Ui = require('../../utils/ui.js');
var app = getApp();

Page({
	data: {
		content: '',
		commentPage: 1,
		isLastPage: false,
		commentsList: [],
		userInfo: null,
		clear_field: '',
		showerror: true
	},

	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '关于 ' + app.conf.websiteName + ' 官方小程序'
		});
		this.setData({
			userInfo: app.globalData.userInfo
		});
		Ui.fetchPageData(this, app.conf.aboutId);
		Ui.fetchCommentsData(this, this.data);
	},

	onReady: function () {

	},

	onShow: function () {

	},

	onHide: function () {

	},

	onUnload: function () {

	},

	// 用户分享该页面
	onShareAppMessage: function (res) {
		return {
			title: '关于 ' + app.conf.websiteName + ' 官方小程序',
			path: 'pages/about/about',
			success: function (res) {
			},
			fail: function (res) {
			}
		}
	},

	// 给a标签添加跳转和复制链接事件
	wxParseTagATap: function (e) {
		Ui.onClickHyperLink(e.currentTarget.dataset.src);
	},

	// 用户点击赞赏
	onPraise: function () {
		wx.previewImage({
			urls: [app.conf.zanImageUrl],
		});
	},

	// 用户点击授权按钮的响应
	onGetUserInfo: function (e) {
		if (e.detail.errMsg != 'getUserInfo:ok')
			console.warn('用户拒绝授权');
		else {
			// 保存到全局
			console.log('用户同意授权', e.detail.userInfo);
			app.globalData.userInfo = e.detail.userInfo;
			// 更新界面
			this.setData({
				userInfo: e.detail.userInfo,
			});
		}
	},

	// 用户点击提交评论
	onAddComment: function (e) {
		if (e.detail.value.comment == '') {
			wx.showToast({
				icon: 'none',
				title: '请填写评论内容！',
				duration: 1200,
			});
			return;
		}
		Ui.addComment(this, e.detail.value.comment, this.data.id);
	},

	// 加载更多评论
	loadMore: function (e) {
		var self = this;
		if (!self.data.isLastPage) {
			self.setData({
				commentPage: self.data.commentPage + 1
			});
			Ui.fetchCommentsData(self, self.data);
		}
		else {
			wx.showToast({
				title: '没有更多评论',
				mask: false,
				duration: 1000
			});
		}
	},
})
