var Ui = require('../../utils/ui.js');
var app = getApp();

Page({
	data: {
		title: '分类列表',
        categoriesList: {},
		showerror: false,
    },
    onLoad: function (options) {
        wx.setNavigationBarTitle({
			title: app.conf.websiteName + ' 文章分类',
            success: function (res) {
                // success
            }
        });
		this.setData({
			categoriesList: app.globalData.categoriesList,
		});
    },
	// 用户分享该页面
    onShareAppMessage: function () {
        return {
			title: '分享 ' + app.conf.websiteName + ' 的专题栏目.',
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
