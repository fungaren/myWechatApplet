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
// 无论promise对象最后状态如何都会执行
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
var pageCount = config.getPageCount;
var categoriesID = config.getCategoriesID;
var indexListType = config.getIndexListType;
var HOST_URI = 'https://' + domain + '/wp-json/wp/v2/';
var HOST_URI_WATCH_LIFE_JSON = 'https://' + domain + '/wp-json/watch-life-net/v1/';

module.exports = {
	postRequest: postRequest,
	getRequest: getRequest,
	wxPromisify: wxPromisify,
	wxLogin: wxLogin,
	wxGetUserInfo: wxGetUserInfo,
	wxGetSystemInfo: wxGetSystemInfo,
	
	// 获取文章列表数据
	getPosts: function (obj) {
		var url = HOST_URI + 'posts?per_page=' + pageCount + '&orderby=date&order=desc&page=' + obj.page;
		if (obj.categories != 0) {
			url += '&categories=' + obj.categories;
		}
		else if (obj.search != '') {
			url += '&search=' + encodeURIComponent(obj.search);
		}
		else {
			if (indexListType != 'all') {
				url += '&categories=' + indexListType;
			}
		}
		return url;
	},

	// 获取多个分类文章列表数据
	getPostsByCategories: function (categories) {
		var url = HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=1&categories=' + categories;
		return url;
	},

	// 获取置顶的文章
	getStickyPosts: function () {
		var url = HOST_URI + 'posts?sticky=true&per_page=5&page=1';
		return url;
	},

	//获取是否开启评论的设置
	getEnableComment: function () {
		var url = HOST_URI_WATCH_LIFE_JSON;
		url += 'options/enableComment';
		return url;
	},

	// 获取tag相关的文章列表
	getPostsByTags: function (id, tags) {
		var url = HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags;
		return url;
	},

	// 获取特定id的文章列表
	getPostsByIDs: function (obj) {
		var url = HOST_URI + 'posts?include=' + obj;
		return url;
	},

	// 获取特定slug的文章内容
	getPostBySlug: function (obj) {
		var url = HOST_URI + 'posts?slug=' + obj;
		return url;
	},

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
		var url = '';
		if (categoriesID == 'all') {
			url = HOST_URI + 'categories?per_page=100&orderby=count&order=desc';
		}
		else {
			url = HOST_URI + 'categories?include=' + categoriesID + '&orderby=count&order=desc';
		}
		return url
	},

	// 获取某个分类信息
	getCategoryByID: function (id) {
		var dd = HOST_URI + 'categories/' + id;
		return HOST_URI + 'categories/' + id;
	},

	// 获取某文章评论
	getComments: function (obj) {
		var url = HOST_URI + 'comments?per_page=100&orderby=date&order=asc&post=' + obj.postID + '&page=' + obj.page;
		return url;
	},

	// 获取文章评论及其回复
	getCommentsReplay: function (obj) {
		var url = HOST_URI_WATCH_LIFE_JSON;
		url += 'comment/getcomments?postid=' + obj.postId + '&limit=' + obj.limit + '&page=' + obj.page + '&order=desc';
		return url;
	},

	// 获取网站的最新20条评论
	getNewComments: function () {
		return HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc';
	},

	// 获取回复
	getChildrenComments: function (obj) {
		var url = HOST_URI + 'comments?parent_exclude=0&per_page=100&orderby=date&order=desc&post=' + obj.postID
		return url;
	},

	//获取最近的30个评论
	getRecentfiftyComments: function () {
		return HOST_URI + 'comments?per_page=30&orderby=date&order=desc'
	},

	// 提交评论
	postComment: function () {
		return HOST_URI + 'comments'
	},

	// 提交微信评论
	postWeixinComment: function () {
		var url = HOST_URI_WATCH_LIFE_JSON;
		return url + 'comment/add'
	},

	// 获取微信评论
	getWeixinComment: function (openid) {
		var url = HOST_URI_WATCH_LIFE_JSON;
		return url + 'comment/get?openid=' + openid;
	},

	// 获取文章的第一个图片地址,如果没有给出默认图片
	getContentFirstImage: function (content) {
		var regex = /<img.*?src=[\'"](.*?)[\'"].*?>/i;
		var arrReg = regex.exec(content);
		var src = "../../images/logo700.png";
		if (arrReg) {
			src = arrReg[1];
		}
		return src;
	},

	// 更新文章浏览数
	updatePageviews(id) {
		var url = HOST_URI_WATCH_LIFE_JSON;
		url += "post/addpageview/" + id;
		return url;
	},

	// 获取用户openid
	getOpenidUrl(id) {
		var url = HOST_URI_WATCH_LIFE_JSON;
		url += "weixin/getopenid";
		return url;
	},

	// 发送模版消息
	sendMessagesUrl() {
		var url = HOST_URI_WATCH_LIFE_JSON;
		url += "weixin/sendmessage";
		return url;
	}
};