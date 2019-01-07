
var Api = require('api.js');
var WxParse = require('../wxParse/wxParse.js');
import config from 'config.js'

module.exports = {
	// 获取指定分类id下的所有文章
	fetchCategoryPosts: function (page, id) {
		var self = page;
		self.setData({
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
			self.setData({
				category: response.data
			});
			wx.setNavigationBarTitle({
				title: response.data.name,
				success: function (res) {
					// success
				}
			});
			this.fetchPostsData(self, self.data);
		})
	},

	// 获取文章列表数据
	fetchPostsData: function (page, data) {
		var self = page;
		if (!data) data = {};
		if (!data.page) data.page = 1;
		if (!data.category) data.category = {id: 0, name: ''};
		if (!data.searchKey) data.search = '';
		if (data.page === 1) {
			self.setData({
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
					self.setData({
						isLastPage: true
					});
				}
				// 显示文章列表
				self.setData({
					floatDisplay: "block",
					postsList: self.data.postsList.concat(response.data.map(function (item) {
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
					self.setData({
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
				self.setData({
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
				self.setData({
					page: data.page - 1
				});
			}
		})
		.finally(function (response) {
			wx.hideLoading();
			wx.stopPullDownRefresh();
		});
	},
}