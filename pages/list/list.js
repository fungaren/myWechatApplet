
var Ui = require('../../utils/ui.js');
import config from '../../utils/config.js'

// 用于显示搜索结果、特定分类下的所有文章
Page({
	data: {
		title: '文章列表',
		postsList: {},
		category: {}, // dict of name & id
		isCategoryPage: "none",
		isLastPage: false,
		page: 1,
		showerror: "none",
		isSearchPage: "none",
		searchKey: "",
	},
	// 用户分享该页面
	onShareAppMessage: function () {
		var title = config.getWebsiteName;
		var path = "pages/list/list"
		if (this.data.category && this.data.category.id != 0) {
			title += "的专题：" + this.data.category.name;
			path += '?categoryId=' + this.data.category.id;
		} else {
			title += "的搜索内容：" + this.data.searchKey;
			path += '?search=' + this.data.searchKey;
		}
		return {
			title: title,
			path: path,
			success: function (res) {
				// 转发成功
			},
			fail: function (res) {
				// 转发失败
			}
		}
	},
	onReachBottom: function () {
	},
	// 用户下拉刷新
	onPullDownRefresh: function () {
		var self = this;
		if (this.data.category && this.data.category.id != 0) {
			self.setData({
				isCategoryPage: "block",
				showerror: "none",
			});
			Ui.fetchCategoryPosts(self, self.data.category.id);
		}
		if (self.data.searchKey && self.data.searchKey != '') {
			self.setData({
				isSearchPage: "block",
				showerror: "none",
			})
			Ui.fetchPostsData(self, self.data);
		}
	},
	// 加载分页
	loadMore: function (e) {
		var self = this;
		if (!self.data.isLastPage) {
			self.setData({
				page: self.data.page + 1
			});
			console.log('当前页' + self.data.page);
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
	onLoad: function (options) {
		// options 是 GET 方法的参数
		var self = this;
		if (options.categoryId && options.categoryId != 0) {
			self.setData({
				category: {
					id: options.categoryId,
					name: ''
				},
				isCategoryPage: "block"
			});
			Ui.fetchCategoryPosts(self, options.categoryId);
		}
		if (options.searchKey && options.searchKey != '') {
			wx.setNavigationBarTitle({
				title: options.searchKey + "搜索结果",
				success: function (res) {
					// success
				}
			});
			self.setData({
				isSearchPage: "block",
				searchKey: options.searchKey
			})
			Ui.fetchPostsData(self, self.data);
		}
	},
	// 跳转至查看文章详情
	redirectDetail: function (e) {
		wx.navigateTo({
			url: '../detail/detail?id=' + e.currentTarget.id
		})
	}
})
