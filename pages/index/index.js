/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * 开源协议：MIT
 * 
 *  *Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 */

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
			})
		}
		else {
			wx.showModal({
				title: '提示',
				content: '请输入要搜索的内容',
				showCancel: false,
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
