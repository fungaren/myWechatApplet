
var Ui = require('../../utils/ui.js');
import config from '../../utils/config.js'

Page({
	data: {
		postsList: [],
		isLastPage: false,
		page: 1,
		showerror: "none",
	},
	// 搜索文章
	searchSubmit: function (e) {
		if (e.detail.value.searchKey != '') {
			wx.navigateTo({
				url: '../list/list?searchKey=' + e.detail.value.searchKey
			});
		}
		else {
			wx.showToast({
				title: '请输入要搜索的内容',
				icon: 'none',
				duration: 2000
			});
		}
	},
	// 用户分享该页面
	onShareAppMessage: function () {
		return {
			title: config.getWebsiteName + ' 博客小程序',
			path: 'pages/index/index',
			success: function (res) {
				// 转发成功
			},
			fail: function (res) {
				// 转发失败
			}
		}
	},
	// 用户下拉刷新
	onPullDownRefresh: function () {
		var self = this;
		self.setData({
			showerror: "none",
			isLastPage: false,
			page: 0
		});
		Ui.fetchPostsData(self, self.data);
	},
	// 滚动到底部
	onReachBottom: function () {
		
	},
	onLoad: function (options) {
		Ui.fetchPostsData(this, this.data);
	},
	onShow: function (options) {
		
	},
	// 加载更多页面
	loadMore: function (e) {
		var self = this;
		if (!self.data.isLastPage) {
			self.setData({
				page: self.data.page + 1
			});
			Ui.fetchPostsData(self, self.data);
		}
		else {
			wx.showToast({
				title: '没有更多内容',
				mask: false,
				duration: 1000
			});
		}
	},
	// 跳转至查看文章详情
	redirectDetail: function (e) {
		wx.navigateTo({
			url: '../detail/detail?id=' + e.currentTarget.id
		})
	}
})
