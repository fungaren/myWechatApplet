/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * 开源协议：MIT
 * Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 * 
 */

var Api = require('../../utils/api.js');
var WxParse = require('../../wxParse/wxParse.js');
var auth = require('../../utils/auth.js');
import config from '../../utils/config.js'
var app = getApp();

Page({
	data: {
		title: '页面内容',
		pageData: {},
		pagesList: {},
		display: 'none',
		wxParseData: [],
		dialog: {
			title: '',
			content: '',
			hidden: true
		},
		userInfo: app.globalData.userInfo,
	},
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '关于 ' + config.getWebsiteName + ' 官方小程序',
			success: function (res) {
				// success
			}
		});

		this.fetchData(config.getAboutId);
	},
	praise: function () {
		var self = this;
		var src = config.getZanImageUrl;
		wx.previewImage({
			urls: [src],
		});
	},
	onPullDownRefresh: function () {
		var self = this;
		self.setData({
			display: 'none',
			pageData: {},
			wxParseData: {},

		});

		this.fetchData(config.getAboutId);
		//消除下刷新出现空白矩形的问题。
		wx.stopPullDownRefresh()

	},
	onShareAppMessage: function () {
		return {
			title: '关于 ' + config.getWebsiteName + ' 官方小程序',
			path: 'pages/about/about',
			success: function (res) {
				// 转发成功
			},
			fail: function (res) {
				// 转发失败
			}
		}
	},
	//给a标签添加跳转和复制链接事件
	wxParseTagATap: function (e) {
		var self = this;
		var href = e.currentTarget.dataset.src;
		console.log(href);
		// 站外链接
		if (href.indexOf(config.getDomain) == -1) {
			wx.setClipboardData({
				data: href,
				success: function (res) {
					wx.getClipboardData({
						success: function (res) {
							wx.showToast({
								title: '链接已复制',
								//icon: 'success',
								image: '../../images/link.png',
								duration: 2000
							})
						}
					})
				}
			})
		}
		else {
			// 站内链接进行跳转
			var postId = href.substring(href.lastIndexOf("/") + 1);
			if (postId == config.getDomain || postId == '') {
				wx.switchTab({
					url: '../index/index'
				})
			}
			else {
				wx.redirectTo({
					url: '../detail/detail?id=' + postId
				})
			}
		}
	},
	userAuthorization: function () {
		var self = this;
		// 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
		wx.getSetting({
			success: function success(res) {
				console.log(res.authSetting);
				var authSetting = res.authSetting;
				if (!('scope.userInfo' in authSetting)) {
					console.log('第一次授权');
				} else {
					console.log('不是第一次授权', authSetting);
					// 没有授权的提醒
					if (authSetting['scope.userInfo'] === false) {
						wx.showModal({
							title: '用户未授权',
							content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
							showCancel: true,
							cancelColor: '#296fd0',
							confirmColor: '#296fd0',
							confirmText: '设置权限',
							success: function (res) {
								if (res.confirm) {
									console.log('用户点击确定')
									wx.openSetting({
										success: function success(res) {
											console.log('打开设置', res.authSetting);
											var scopeUserInfo = res.authSetting["scope.userInfo"];
											if (scopeUserInfo) {
												auth.getUserInfo(null);
											}
										}
									});
								}
							}
						})
					}
					else {
						auth.getUserInfo(null);
					}
				}
			}
		});
	},
	// 用户点击登陆
	agreeGetUser: function (e) {
		var userInfo = e.detail.userInfo;
		var self = this;
		if (userInfo) {
			auth.getUserInfo(e.detail);
			self.setData({ userInfo: userInfo });
		}
	},
	fetchData: function (id) {
		var self = this;
		var getPageRequest = Api.getRequest(Api.getPageByID(id));
		getPageRequest.then(response => {
			console.log(response);
			WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);

			self.setData({
				pageData: response.data,
				//wxParseData: WxParse('md',response.data.content.rendered)
				//wxParseData: WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5)
			});
			self.setData({
				display: 'block'
			});
		})
			.then(res => {
				if (!app.globalData.isGetOpenid) {
					// auth.getUserInfo();
				}
			})
	}
})