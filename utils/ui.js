var WxParse = require('../wxParse/wxParse.js');
var Decode = require('decode.js')
var app = getApp();

var domain = app.conf.domain;
var HOST_URI = 'https://' + domain + '/wp-json/wp/v2/';

module.exports = {
	// 获取多个分类文章列表数据
	// HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=1&categories=' + categories

	// 获取置顶的文章
	// HOST_URI + 'posts?sticky=true&per_page=5&page=1'

	// 获取tag相关的文章列表
	// HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags

	// 获取特定id的文章列表
	// HOST_URI + 'posts?include=' + obj

	// 获取某文章评论
	// HOST_URI + 'comments?per_page=100&orderby=date&order=asc&post=' + obj.postId + '&page=' + obj.page

	// 获取网站的最新20条评论
	// HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc'

	// 获取回复
	// return HOST_URI + 'comments?parent_exclude=0&per_page=100&orderby=date&order=desc&post=' + obj.postId

	// 获取最近的30个评论
	// HOST_URI + 'comments?per_page=30&orderby=date&order=desc'

	// 获取所有分类
	getCategories: function (page) {
		wx.showLoading({
			title: '正在加载',
			mask: true
		});
		var self = page;
		var url = HOST_URI + 'categories?per_page=100&orderby=count&order=desc';
		console.log(url);
		wx.request({
			url: url,
			success: res => {
				wx.hideLoading();
				console.log(res);
				if (res.statusCode === 200) {
					// 创建一个从分类Id到分类信息的映射
					for (var i=0; i < res.data.length; ++i)
						app.globalData.categoriesList[res.data[i].id] = res.data[i];
				}
			},
			fail: res => {
				wx.hideLoading();
				console.log(res);
			}
		});
	},

	// 获取文章列表数据（首页列表、搜索列表、分类列表）
	fetchPostsData: function (page, data) {
		if (!data) data = {};
		if (!data.page) data.page = 1;
		if (!data.category) data.category = {id: 0, name: ''};
		if (!data.searchKey) data.search = '';
		if (data.page === 1) {
			page.data.postsList = [];
		};
		wx.showLoading({
			title: '正在加载',
			mask: true
		});
		var url = HOST_URI + 'posts?per_page=' + app.conf.pageCount + '&orderby=date&order=desc&page=' + data.page;
		if (typeof (data.category) != 'undefined' &&
			typeof (data.category.id) != 'undefined' &&
			data.category.id != 0) {
			url += '&categories=' + data.category.id;
		}
		else if (typeof (data.searchKey) != 'undefined' &&
			data.searchKey != '') {
			url += '&search=' + encodeURIComponent(data.searchKey);
		}
		console.log(url);
		wx.request({
			url: url,
			success: res => {
				console.log(res);
				if (res.statusCode === 200) {
					// 返回的文章数量小于每页的文章数
					if (res.data.length < app.conf.pageCount) {
						page.isLastPage = true;
					}
					// 显示文章列表
					page.setData({
						showerror: false,
						postsList: page.data.postsList.concat(res.data.map(item => {
							// 标题中的HTML转义
							item.title.rendered = Decode.htmlDecode(item.title.rendered)

							// 获取文章的第一个图片地址,如果没有给出默认图片
							var featureImage = item.content.rendered.match(/<img.*?(?: |\\t|\\r|\\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\\t|\\r|\\n)+.*?)?>/);
							if (featureImage != null)
								item.post_thumbnail_image = featureImage[1];
							else
								item.post_thumbnail_image = "../../images/default-thumbnail.png";

							// 时间戳，只取年、月、日部分
							item.date = item.date.substring(0, 10);
							item.commentCount = '0 条';
							item.views = '0 次';
							return item;
						}))
					});
					setTimeout(() => {
						wx.hideLoading();
					}, 900);
				} else {
					// 达到最大页数
					if (res.data.code == "rest_post_invalid_page_number") {
						page.setData({
							isLastPage: true
						});
						wx.showToast({
							title: '没有更多内容',
							mask: false,
							duration: 1500
						});
					} else {
						// 其他错误
						wx.showToast({
							title: res.data.message,
							icon: 'none',
							duration: 1500
						});
					}
				}
				wx.stopPullDownRefresh();
			},
			fail: res => {
				console.log(res);
				wx.showToast({
					title: '加载失败，请重试',
					icon: 'none',
					duration: 2000
				});
				if (data.page == 1) {
					page.setData({
						showerror: true
					});
				} else {
					page.setData({
						page: data.page - 1,
						showerror: true
					});
				}
				wx.stopPullDownRefresh();
			}
		});
	},

	// 获取页面内容
	fetchPageData: function (page, id) {
		wx.showLoading({
			title: '正在加载',
			mask: true
		});
		var url = HOST_URI + 'pages/' + id;
		console.log(url);
		wx.request({
			url: url,
			success: res => {
				console.log(res);
				WxParse.wxParse('article', 'html', res.data.content.rendered, page, 5);
				page.setData({
					content: res.data.content.rendered,
					showerror: false
				});
				wx.hideLoading();
			},
			fail: function (res) {
				console.log(res);
				wx.hideLoading();
				page.setData({
					showerror: true
				});
			}
		});
	},

	// 获取文章内容
	fetchPostData: function (page, id) {
		var self = this;
		wx.showLoading({
			title: '正在加载',
			mask: true
		});
		var url = HOST_URI + 'posts/' + id;
		console.log(url);
		wx.request({
			url: url,
			success: res => {
				console.log(url);
				WxParse.wxParse('article', 'html', res.data.content.rendered, page, 5);
				page.setData({
					content: res.data.content.rendered,
					// 标题中的HTML转义
					title: Decode.htmlDecode(res.data.title.rendered),
					commentCount: '0条评论',
					date: res.data.date.substring(0, 10),
					categoryName: app.globalData.categoriesList[res.data.categories].name,
					views: '0次阅读',
					showerror: false
				});
				wx.hideLoading();
			},
			fail: function (res) {
				console.log(url);
				wx.hideLoading();
			}
		});
	},
	
	onClickHyperLink: function (href) {
		// 站外链接
		if (href.indexOf(app.conf.domain) == -1) {
			wx.setClipboardData({
				data: href,
				success: function (res) {
					wx.getClipboardData({
						success: function (res) {
							wx.showToast({
								title: '链接已复制',
								duration: 2000
							})
						}
					})
				}
			})
		} else {
			// 站内链接进行跳转
			var postId = href.substring(href.lastIndexOf("/") + 1);
			if (postId == app.conf.domain || postId == '') {
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
	}
}
