
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
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
    }
})
