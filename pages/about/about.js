var Ui = require('../../utils/ui.js');
var app = getApp();

Page({
	data: {
		content: '',
		showerror: true
	},

	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '关于 ' + app.conf.websiteName + ' 官方小程序'
		});
		Ui.fetchPageData(this, app.conf.aboutId);
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
})
