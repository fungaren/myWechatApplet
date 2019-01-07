
var Api = require('api.js');
var WxParse = require('../wxParse/wxParse.js');
import config from 'config.js'
var app = getApp();

module.exports = {
	// 获取指定分类id下的所有文章
	fetchCategoryPosts: function (page, id) {
		page.setData({
			category: []
		});
		Api.getRequest(Api.getCategoryByID(id)).then(response => {
			var catImage = "";
			if (typeof (response.data.category_thumbnail_image) == "undefined" || response.data.category_thumbnail_image == "") {
				catImage = "../../images/website.png";
			}
			else {
				catImage = response.data.category_thumbnail_image;
			}
			page.setData({
				category: response.data
			});
			wx.setNavigationBarTitle({
				title: response.data.name,
				success: function (res) {
					// success
				}
			});
			this.fetchPostsData(page, page.data);
		})
	},

	// 获取文章列表数据
	fetchPostsData: function (page, data) {
		if (!data) data = {};
		if (!data.page) data.page = 1;
		if (!data.category) data.category = {id: 0, name: ''};
		if (!data.searchKey) data.search = '';
		if (data.page === 1) {
			page.setData({
				postsList: []
			});
		};
		wx.showLoading({
			title: '正在加载',
			mask: true
		});
		Api.getRequest(Api.getPosts(data)).then(response => {
			if (response.statusCode === 200) {
				// 返回的文章数量小于每页的文章数
				if (response.data.length < config.getPageCount) {
					page.setData({
						isLastPage: true
					});
				}
				// 显示文章列表
				page.setData({
					floatDisplay: "block",
					postsList: page.data.postsList.concat(response.data.map(function (item) {
						if (item.category_name != null)
							item.categoryImage = "../../images/category.png";
						else
							item.categoryImage = "";

						// 获取文章的第一个图片地址,如果没有给出默认图片
						var featureImage = item.content.rendered.match(/<img.*?(?: |\\t|\\r|\\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\\t|\\r|\\n)+.*?)?>/);
						if (featureImage != null)
							item.post_thumbnail_image = featureImage[1];
						else
							item.post_thumbnail_image = "../../images/default-thumbnail.png";
						
						// 时间戳，只取年、月、日部分
						item.date = item.date.substring(0, 10);
						// 标题中的HTML转义
						item.title.rendered = WxParse.htmlDecode(item.title.rendered)
						return item;
					})),
				});
				setTimeout(function () {
					wx.hideLoading();
				}, 900);
			}
			else {
				// 达到最大页数
				if (response.data.code == "rest_post_invalid_page_number") {
					page.setData({
						isLastPage: true
					});
					wx.showToast({
						title: '没有更多内容',
						mask: false,
						duration: 1500
					});
				}
				else {
					// 其他错误
					wx.showToast({
						title: response.data.message,
						duration: 1500
					})
				}
			}
		})
		.catch(function (response) {
			if (data.page == 1) {
				page.setData({
					showerror: "block",
					floatDisplay: "none"
				});
			}
			else {
				wx.showModal({
					title: '加载失败',
					content: '加载数据失败，请重试',
					showCancel: false,
				});
				page.setData({
					page: data.page - 1
				});
			}
		})
		.finally(function (response) {
			wx.hideLoading();
			wx.stopPullDownRefresh();
		});
	},

	// 获取页面内容
	fetchPageData: function (page, id) {
		Api.getRequest(Api.getPageByID(id)).then(response => {
			// 解析HTML数据
			WxParse.wxParse('article', 'html', response.data.content.rendered, page, 5);
			page.setData({
				displayContent: 'block'
			});
		});
	},
	// 获取文章内容
	fetchPostData: function (page, id) {
		var self = this;
		Api.getRequest(Api.getPostByID(id)).then(response => {
			// 标题中的HTML转义
			response.data.title.rendered = WxParse.htmlDecode(response.data.title.rendered)
			WxParse.wxParse('article', 'html', response.data.content.rendered, page, 5);
			if (response.data.total_comments != null && response.data.total_comments != '') {
				page.setData({
					commentCount: "有" + response.data.total_comments + "条评论"
				});
			};
			page.setData({
				detail: response.data,
				postId: id,
				date: response.data.date.substring(0, 10),
				displayContent: 'block',
			});
		})
		.then(response => {
			// 设置标题
			wx.setNavigationBarTitle({
				title: page.data.detail.title.rendered
			});
		});
	},
	onClickHyperLink: function (href) {
		// 站外链接
		if (href.indexOf(config.getDomain) == -1) {
			wx.setClipboardData({
				data: url,
				success: function (res) {
					wx.getClipboardData({
						success: function (res) {
							wx.showToast({
								title: '链接已复制',
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
	// // 获取用户授权
	// isAuthorized: function () {
	// 	wx.getSetting({
	// 		success: function success(res) {
	// 			if (!('scope.userInfo' in res.authSetting)) {
	// 				console.log('从未授权');
	// 				app.globalData.isAuthorized = false;
	// 			} else {
	// 				if (res.authSetting['scope.userInfo'] === false) {
	// 					console.log('用户拒绝过授权', res.authSetting);
	// 					app.globalData.isAuthorized = false;
	// 					wx.showModal({
	// 						title: '用户未授权',
	// 						content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。请在授权管理中启用',
	// 						showCancel: true,
	// 						confirmText: '设置权限',
	// 						success: function (res) {
	// 							if (res.confirm) {
	// 								wx.openSetting({
	// 									success: function success(res) {
	// 										if (res.authSetting["scope.userInfo"] === true) {
	// 											console.log('用户已同意授权', res.authSetting);
	// 											app.globalData.isAuthorized = true;
	// 										}
	// 									}
	// 								});
	// 							}
	// 						}
	// 					});
	// 				} else {
	// 					console.log('用户已经授权过', res.authSetting);
	// 					app.globalData.isAuthorized = true;
	// 				}
	// 			}
	// 		}
	// 	});
	// },
	// // 获取用户信息
	// getUserInfo: function () {
	// 	// 注意必须先调用 wx.login 之后才能 getUserInfo
	// 	var wxLogin = Api.wxLogin();
	// 	wxLogin().then(response => {
	// 		var userInfo = Api.wxGetUserInfo();
	// 		return userInfo();
	// 	})
	// 	.then(res => {
	// 		console.log("成功获取用户公开信息", res.userInfo);
	// 		// 把数据保存到全局区域以便下次读取
	// 		app.globalData.userInfo = res.userInfo;
	// 	})
	// 	.catch(function (error) {
	// 		console.error(error.errMsg);
	// 	})
	// }
}