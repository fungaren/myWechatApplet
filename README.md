# WordPress 博客微信小程序

### 说明

1. 可在任何 WordPress 主题上直接使用，无需安装额外插件
1. 修改 [app.js](app.js) 和 [copyright](templates/copyright.wxml) 即可完成适配
1. 开启评论功能需要进行额外设置（注意这可能会导致垃圾评论的增加）
1. 暂不支持评论嵌套，只能显示评论主楼
1. 可以在 [EasyWordPressBook](https://github.com/bestony/EasyWordPressBook) 了解 Wordpress REST API

### 开启评论

在 WordPress 主题的 `functions.php` 中加入

```php
add_filter('rest_allow_anonymous_comments', '__return_true');
```

> 微信用户头像直接存储在 `author_url` 字段，如果希望存在 `meta` 字段，参考 [register_meta](https://developer.wordpress.org/rest-api/extending-the-rest-api/modifying-responses/#working-with-registered-meta-in-the-rest-api)

### 第三方库

- [Towxml](https://github.com/sbfkcel/towxml)
