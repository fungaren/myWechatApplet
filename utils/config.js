/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.nets
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * 开源协议：MIT
 * Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 */
export default {
	//配置域名,域名只修改此处。
	//如果wordpress没有安装在网站根目录请加上目录路径,例如："www.watch-life.net/blog"
	getDomain: "moooc.cc",
	//网站名称
	getWebsiteName: 'FANG',
	//wordpress网站"页面"的id,注意这个"页面"是wordpress的"页面"，不是"文章"
	getAboutId: 2,
	//赞赏消息模版id
	getPayTemplateId: 'hzKpxuPF2rw7O-qTElkeoE0lMwr0O4t9PJkLyt6v8rk',
	//每页文章数目
	getPageCount: '10',
	//专题页显示全部的分类，'1,1059,98,416,189,374,6,463' 指定专题页显示的分类的id
	getCategoriesID :'all',
	//回复评论消息模版id
	getReplayTemplateId: 'IiAVoBWP34u1uwt801rI_Crgen7Xl2lvAGP67ofJLo8',
	//微信赞赏的图片链接，用于个人小程序的赞赏
	getZanImageUrl: 'https://moooc.cc/wp-content/themes/bigsize/wechat.png',
	//首页显示所有分类
	getIndexListType: "all",
	// 网站的logo图片
	getLogo: "../../images/logo-icon.png",
	//生成海报如果没有首图，使用此处设置的图片作为海报图片。
	getPostImageUrl: "../../default-banner.jpg",
	//设置downloadFile合法域名,不带https ,在中括号([])里增加域名，格式：{id=**,domain:'www.**.com'}，用英文逗号分隔。
	//此处设置的域名和小程序与小程序后台设置的downloadFile合法域名要一致。
	getDownloadFileDomain: [
		{ id: 1, domain: 'moooc.oss-cn-shenzhen.aliyuncs.com' }
	]
}
