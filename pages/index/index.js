var Ui = require('../../utils/ui.js');
var app = getApp();

Page({
	data: {
		postsList: [],
		isLastPage: false,
		page: 1,
		showerror: false,
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
			title: app.conf.websiteName + ' 博客小程序',
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
		this.data.showerror = false;
		this.data.isLastPage = false;
		this.data.page = 0;
		Ui.getCategories(this);
		Ui.fetchPostsData(this, this.data);
	},
	onLoad: function (options) {
		Ui.getCategories(this);
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
		});
	}
})
