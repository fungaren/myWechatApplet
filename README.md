# WordPress 博客微信小程序

### 预览

![FunZone](https://moooc.oss-cn-shenzhen.aliyuncs.com/blog/wechatmp.png)

### 说明

1. 可在任何 WordPress 主题上直接使用，无需安装额外插件
2. 修改 [app.js](app.js) 和 [copyright](templates/copyright.wxml) 即可完成适配
3. 由于个人版微信小程序不支持 WebView，因此使用 [WxParse](https://github.com/icindy/wxParse) 实现 HTML 显示
4. 开启评论功能需要进行额外设置（注意这可能会导致垃圾评论的增加）
5. 暂不支持评论嵌套，只能显示评论主楼

### 开启评论

在 WordPress 主题的 `functions.php` 中加入

```php
add_filter('rest_allow_anonymous_comments', '__return_true');
```

> 微信用户头像直接存储在 `author_url` 字段，如果希望存在 `meta` 字段，参考 [register_meta](https://developer.wordpress.org/rest-api/extending-the-rest-api/modifying-responses/#working-with-registered-meta-in-the-rest-api)
