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
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var auth = require('../../utils/auth.js');
var app = getApp();
Page({
	data: {
		title: '分类列表',
        categoriesList: {}
    },
    onLoad: function (options) {
		var self = this;
        wx.setNavigationBarTitle({
            title: config.getWebsiteName + ' 文章分类',
            success: function (res) {
                // success
            }
        });
		self.setData({
			categoriesList: []
		});
		Api.getRequest(Api.getCategories()).then(response => {
			if (response.statusCode === 200) {
				self.setData({
					categoriesList: self.data.categoriesList.concat(response.data.map(function (item) {
						if (typeof (item.category_thumbnail_image) == "undefined" || 
							item.category_thumbnail_image == "") {
							item.category_thumbnail_image = "../../images/website.png";
						}
						return item;
					})),
				});
			}
			else {
				console.log(response);
			}
		})
		.then(res => {
			if (!app.globalData.isGetOpenid) {
				//self.userAuthorization();
			}
		})
		.catch(function (response) {
			console.log(response);
		})
    },
    onShow:function() {

    },
	// 用户分享该页面
    onShareAppMessage: function () {
        return {
            title: '分享 ' + config.getWebsiteName + ' 的专题栏目.',
            path: 'pages/topic/topic',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    // 跳转至某分类下的文章列表
	listAll: function (e) {
        wx.navigateTo({
			url: '../list/list?categoryId=' + e.currentTarget.dataset.id
        });
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
                                    // 用户点击确定
                                    wx.openSetting({
                                        success: function success(res) {
                                            console.log('打开设置', res.authSetting);
                                            var scopeUserInfo = res.authSetting["scope.userInfo"];
                                            if (scopeUserInfo) {
                                                self.getUserInfo(null);
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
            self.setData({ userInfo: userInfo })
        }
    },
    // 获取用户信息和openid
    getUserInfo: function (userInfoDetail) {
        var wxLogin = Api.wxLogin();
        var jscode = '';
        wxLogin().then(response => {
            jscode = response.code
            if (userInfoDetail == null) {
                var userInfo = Api.wxGetUserInfo();
                return userInfo();
            }
            else {
                return userInfoDetail;
            }
        })
		.then(response => {
			// 获取用户信息
            console.log(response.userInfo);
            console.log("成功获取用户信息(公开信息)");
            app.globalData.userInfo = response.userInfo;
            app.globalData.isGetUserInfo = true;
            var data = {
                js_code: jscode,
                encryptedData: response.encryptedData,
                iv: response.iv,
                avatarUrl: response.userInfo.avatarUrl,
                nickname: response.userInfo.nickName
            }
            this.getOpenId(data);
        })
		.catch(function (error) {
            console.log('error: ' + error.errMsg);
        })
    },
    getOpenId(data) {
        var url = Api.getOpenidUrl();
        var self  = this;
        var postOpenidRequest = Api.postRequest(url, data);
        // 获取openid
        postOpenidRequest.then(response => {
            if (response.data.status == '200') {
                app.globalData.openid = response.data.openid;
                app.globalData.isGetOpenid = true;
            }
            else {
                console.log(response);
            }
        })
		.then(res=>{
            setTimeout(function () {
                self.getSubscription();
            }, 500);
        })
    }
})
