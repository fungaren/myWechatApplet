/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * 开源协议：MIT
 * Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 */
// 利用这个包装，可以把 success 和 fail 的结果都返回
function wxPromisify(fn) {
	return function (obj = {}) {
		return new Promise((resolve, reject) => {
			obj.success = function (res) {
				//成功
				resolve(res)
			}
			obj.fail = function (res) {
				//失败
				reject(res)
			}
			fn(obj)
		})
	}
}
// 定义 finally 方法，无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
	let P = this.constructor;
	return this.then(
		value => P.resolve(callback()).then(() => value),
		reason => P.resolve(callback()).then(() => { throw reason })
	);
};

/**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data) {
	var getRequest = wxPromisify(wx.request)
	return getRequest({
		url: url,
		method: 'GET',
		data: data,
		header: {
			'Content-Type': 'application/json'
		}
	})
}

/**
 * 微信请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data) {
	var postRequest = wxPromisify(wx.request)
	return postRequest({
		url: url,
		method: 'POST',
		data: data,
		header: {
			"content-type": "application/json"
		},
	})
}

/**
 * 微信用户登录,获取code
 */
function wxLogin() {
	return wxPromisify(wx.login)
}

/**
 * 获取微信用户信息
 * 注意:须在登录之后调用
 */
function wxGetUserInfo() {
	return wxPromisify(wx.getUserInfo)
}

/**
 * 获取系统信息
 */
function wxGetSystemInfo() {
	return wxPromisify(wx.getSystemInfo)
}

/**
 * 保留当前页面，跳转到应用内的某个页面
 * url:'../index/index'
 * params:{key:value1}
 */
function wxNavigateTo(url, params) {
	var wxNavigateTo = wxPromisify(wx.navigateTo)
	const serializedParams = this.paramSerializer(params)
	if (serializedParams.length > 0) {
		url += ((url.indexOf('?') == -1) ? '?' : '&') + serializedParams
	}
	return wxNavigateTo({
		url: url
	})
}

import config from 'config.js'
var domain = config.getDomain;
var HOST_URI = 'https://' + domain + '/wp-json/wp/v2/';

module.exports = {
	postRequest: postRequest,
	getRequest: getRequest,
	wxPromisify: wxPromisify,
	wxLogin: wxLogin,
	wxGetUserInfo: wxGetUserInfo,
	wxGetSystemInfo: wxGetSystemInfo,

	// 获取文章列表数据
	getPosts: function (obj) {
		var url = HOST_URI + 'posts?per_page=' + config.getPageCount + '&orderby=date&order=desc&page=' + obj.page;
		if (typeof (obj.category) != 'undefined' &&
			typeof (obj.category.id) != 'undefined' && 
			obj.category.id != 0) {
			url += '&categories=' + obj.category.id;
		}
		else if (typeof (obj.searchKey) != 'undefined' && 
				obj.searchKey != '') {
			url += '&search=' + encodeURIComponent(obj.searchKey);
		}
		else if (config.getIndexListType != 'all') {
			url += '&categories=' + config.getIndexListType;
		}
		console.log(url)
		return url;
	},

	// 获取多个分类文章列表数据
	getPostsByCategories: function (categories) {
		return HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=1&categories=' + categories;
	},

	// // 获取置顶的文章
	// getStickyPosts: function () {
	// 	return HOST_URI + 'posts?sticky=true&per_page=5&page=1';
	// },

	// // 获取tag相关的文章列表
	// getPostsByTags: function (id, tags) {
	// 	return HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags;
	// },

	// // 获取特定id的文章列表
	// getPostsByIDs: function (obj) {
	// 	return HOST_URI + 'posts?include=' + obj;
	// },

	// 获取内容页数据
	getPostByID: function (id) {
		return HOST_URI + 'posts/' + id;
	},

	// 获取页面列表数据
	getPages: function () {
		return HOST_URI + 'pages';
	},

	// 获取页面列表数据
	getPageByID: function (id, obj) {
		return HOST_URI + 'pages/' + id;
	},

	//获取分类列表
	getCategories: function () {
		if (config.getCategoriesID == 'all') {
			return HOST_URI + 'categories?per_page=100&orderby=count&order=desc';
		}
		else {
			return HOST_URI + 'categories?include=' + config.getCategoriesID + '&orderby=count&order=desc';
		}
	},

	// 获取某个分类信息
	getCategoryByID: function (id) {
		return HOST_URI + 'categories/' + id;
	},

	// 获取某文章评论
	getComments: function (obj) {
		return HOST_URI + 'comments?per_page=100&orderby=date&order=asc&post=' + obj.postId + '&page=' + obj.page;
	},

	// 获取网站的最新20条评论
	getNewComments: function () {
		return HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc';
	},

	// 获取回复
	getChildrenComments: function (obj) {
		return HOST_URI + 'comments?parent_exclude=0&per_page=100&orderby=date&order=desc&post=' + obj.postId
	},

	// //获取最近的30个评论
	// getRecentfiftyComments: function () {
	// 	return HOST_URI + 'comments?per_page=30&orderby=date&order=desc'
	// },

	// 提交评论
	postComment: function () {
		return HOST_URI + 'comments'
	},

};