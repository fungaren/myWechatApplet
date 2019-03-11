var Ui = require('../../utils/ui.js');
var app = getApp();

Page({
	data: {
		title: '文章内容',
		id: 0,
		categoryName: '',
		views: '',
		commentCount: '',
		date: '',
		content: '',
		showerror: true
	},

	onLoad: function (options) {
		this.data.id = options.id;
		Ui.fetchPostData(this, options.id);
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
			title: '分享 ' + app.conf.websiteName + ' 的文章：' + this.data.title,
			path: 'pages/detail/detail?id=' + this.data.id,
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
