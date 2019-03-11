App({
	onLaunch: function () {
		// ...
	},
	conf: {
		// 配置域名,域名只修改此处。如果wordpress没有安装在网站根目录请加上目录路径
		domain: "moooc.cc",
		// 网站名称
		websiteName: 'FANG',
		// "关于"页面的id
		aboutId: 2,
		// 每页文章数目
		pageCount: '10',
		// 微信赞赏的图片链接，用于个人小程序的赞赏
		zanImageUrl: 'https://moooc.cc/wp-content/themes/bigsize/wechat.png'
	},
	globalData: {
		userInfo: null,
		isAuthorized: false,
		categoriesList: {}
	}
})
