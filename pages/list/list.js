var Ui = require('../../utils/ui.js');
var app = getApp();

// 用于显示搜索结果、特定分类下的所有文章
Page({
	data: {
		title: '文章列表',
		postsList: {},
		category: {}, // dict of name & id
		isCategoryPage: false,
		isLastPage: false,
		page: 1,
		showerror: false,
		isSearchPage: false,
		searchKey: "",
	},
	// 用户分享该页面
	onShareAppMessage: function () {
		var title = app.conf.websiteName;
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
	// 用户下拉刷新
	onPullDownRefresh: function () {
		if (this.data.category && this.data.category.id != 0) {
			this.data.isCategoryPage = true;
			wx.setNavigationBarTitle({
				title: category.name
			});
			Ui.fetchPostsData(this, this.data);
		}
		if (this.data.searchKey && this.data.searchKey != '') {
			this.data.isSearchPage = true;
			Ui.fetchPostsData(this, this.data);
		}
	},
	// 加载分页
	loadMore: function (e) {
		if (!this.data.isLastPage) {
			this.data.page = this.data.page + 1;
			Ui.fetchPostsData(this, this.data);
		} else {
			wx.showToast({
				title: '没有更多内容',
				mask: false,
				duration: 1000
			});
		}
	},
	onLoad: function (options) {
		// options 是 GET 方法的参数
		if (options.categoryId && options.categoryId != 0) {
			var c = app.globalData.categoriesList[options.categoryId];
			this.setData({
				category: {
					id: options.categoryId,
					name: c.name,
					description: c.description
				},
				isCategoryPage: true
			});
			wx.setNavigationBarTitle({
				title: this.data.category.name
			});
			Ui.fetchPostsData(this, this.data);
		}
		if (options.searchKey && options.searchKey != '') {
			wx.setNavigationBarTitle({
				title: options.searchKey + "搜索结果",
				success: function (res) {
					// success
				}
			});
			this.setData({
				isSearchPage: true,
				searchKey: options.searchKey
			});
			Ui.fetchPostsData(this, this.data);
		}
	},
	// 跳转至查看文章详情
	redirectDetail: function (e) {
		wx.navigateTo({
			url: '../detail/detail?id=' + e.currentTarget.id
		});
	}
})
