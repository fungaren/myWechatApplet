App({
	onLaunch: function () {
		// 检查用户有没有授权过
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							console.log('用户已授权，获得用户信息', res.userInfo);
							// 可以将 res 发送给后台解码出 unionId
							this.globalData.userInfo = res.userInfo;
						}
					});
				} else {
					// 用户从未进行过授权，需要点击按钮手动授权。
					console.log('The user have never authorized the app.');
				}
			}
		});
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
		categoriesList: {}
	}
})
