/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * 开源协议：MIT
 *  *Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 * 
 */
import config from '../../utils/config.js'
var Ui = require('../../utils/ui.js');
var app = getApp();

Page({
    data: {
        title: '文章内容',
        detail: {},
		commentCount: '',
        date: '',
		displayContent: 'none'
    },
	onLoad: function (options) {
		// 读取存储的用户信息
		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo
			})
		}
        Ui.fetchPostData(this, options.id);
    },
    onReachBottom: function () {
		
    },
	// 用户分享该页面
    onShareAppMessage: function (res) {
        return {
            title: '分享 ' + config.getWebsiteName + ' 的文章：' + this.data.detail.title.rendered,
            path: 'pages/detail/detail?id=' + this.data.detail.id,
            imageUrl: this.data.detail.post_thumbnail_image,
            success: function (res) {
                // 转发成功
                console.log(res);
            },
			fail: function (res) {
                // 转发失败
                console.log(res);
            }
        }
    },
	// 主页按钮
    goHome: function () {
        wx.switchTab({
            url: '../index/index'
        })
    },
	// 用户点击赞赏
	praise: function () {
		wx.previewImage({
			urls: [config.getZanImageUrl],
		});
	},
    // 给a标签添加跳转和复制链接事件
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
