/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 * 
 */

App({
	onLaunch: function () {
		// 从本地缓存中读取登陆记录
		var login_date = wx.getStorageSync('login_date') || []
		login_date.unshift(Date.now()) // 在数组顶部插入一条记录
		wx.setStorageSync('login_date', login_date)
	},
	getUserInfo: function (cb) {
		var that = this
		// 已经登陆
		if (this.globalData.userInfo) {
			// 回调
			typeof cb == "function" && cb(this.globalData.userInfo)
		} else {
			// 登陆
			wx.login({
				success: function () {
					// 获取用户数据
					wx.getUserInfo({
						success: function (res) {
							// 存储到全局区
							that.globalData.userInfo = res.userInfo
							// 回调
							typeof cb == "function" && cb(that.globalData.userInfo)
						}
					})
				}
			})
		}
	},
	globalData:{
		userInfo: null,
		openid: '',
		isGetUserInfo: false,
		isGetOpenid: false
	}
})
