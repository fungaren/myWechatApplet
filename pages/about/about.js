
var Ui = require('../../utils/ui.js');
import config from '../../utils/config.js'
var app = getApp();

Page({
	data: {
		title: '页面内容',
		displayContent: 'none'
	},
	onLoad: function (options) {
		// 读取存储的用户信息
		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo
			})
		}
		wx.setNavigationBarTitle({
			title: '关于 ' + config.getWebsiteName + ' 官方小程序',
			success: function (res) {
				// success
			}
		});
		Ui.fetchPageData(this, config.getAboutId);
	},
	// 用户点击赞赏
	praise: function () {
		wx.previewImage({
			urls: [config.getZanImageUrl],
		});
	},
	// 下拉刷新
	onPullDownRefresh: function () {
		this.setData({
			displayContent: 'none'
		});
		Ui.fetchPageData(this, config.getAboutId);
		//消除下刷新出现空白矩形的问题。
		wx.stopPullDownRefresh()
	},
	// 用户分享当前页面
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
		Ui.onClickHyperLink(e.currentTarget.dataset.src);
	},
	// 用户点击登陆
	agreeGetUser: function (e) {
		console.log('用户点击登陆按钮', e.detail.userInfo);
		// 把数据保存到全局区域以便下次读取
		app.globalData.userInfo = e.detail.userInfo;
		this.setData({
			userInfo: app.globalData.userInfo
		})
	}
})
