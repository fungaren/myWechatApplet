App({
  towxml: require('/towxml/index'),
  conf: {
    // 配置域名。如果 Wordpress 没有安装在网站根目录请加上目录路径
    domain: "moooc.cc",
    // 网站名称
    websiteName: 'FANG',
    // "关于"页面的id
    aboutPageId: 2,
    // 每页文章数目
    pageCount: '10',
    // 微信赞赏的图片链接，用于个人小程序的赞赏
    rewardImgUrl: 'https://moooc.cc/wp-content/uploads/2022/10/wechat.png'
  },
  globalData: {
    userInfo: null,
    categories: {},
    categoriesList: [],
  },
  onLaunch() {
  },
})
