const utils = require('utils')

const app = getApp()
const HOST_URI = `https://${app.conf.domain}/wp-json/wp/v2/`

async function get(url, data) {
  console.log("GET", url, data)
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'GET',
      data: data,
      success: resolve,
      fail: reject,
    })
  })
}

async function post(url, data) {
  console.log("POST", url, data)
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      success: resolve,
      fail: reject,
    })
  })
}

/**
 * @brief 获取所有分类
 * @return {Promise}
 */
async function getCategories() {
  wx.showLoading({
    title: '正在加载',
    mask: true
  })

  try {
    const res = await get(HOST_URI + 'categories', {
      "per_page": 100,
      "orderby": "count",
      "order": "desc",
    })
    wx.hideLoading()
    console.log(res)
    if (res.statusCode == 200) {
      app.globalData.categoriesList = res.data
      // 创建一个从分类 Id 到分类名称的映射
      for (category of res.data)
        app.globalData.categories[category.id] = category
    } else {
      wx.showToast({
        // 当图标非空时，最多显示 7 个汉字。当不显示图标时，最多可显示两行。
        icon: 'none',
        title: res.data.message,
        mask: false,
        duration: 2000
      })
    }
  } catch(res) {
    console.log(res)
    wx.hideLoading()
    wx.showToast({
      icon: 'none',
      title: res.errMsg,
      mask: false,
      duration: 2000
    })
  }
}

/**
 * @brief 获取文章列表数据（首页列表、搜索列表、分类列表）
 * @param {Number} page
 * @param {Number} categoryId
 * @param {String} searchKey
 * @param {Boolean} sticky nullable.
 * @param {Array} tags nullable.
 * @param {Array} exclude nullable.
 * @param {Array} include nullable.
 * @return {Promise}
 */
async function getPosts(page=1, categoryId=0, searchKey='',
  sticky=null, tags=null, exclude=null, include=null) {
  wx.showLoading({
    title: '正在加载',
    mask: true
  })
  const query = {
    "per_page": app.conf.pageCount,
    "orderby": "date",
    "order": "desc",
    "page": page,
  }
  if (categoryId != 0)
    query.categories = categoryId
  if (searchKey != '')
    query.search = searchKey
  if (sticky != null)
    query.sticky = sticky
  if (tags != null)
    query.tags = tags
  if (exclude != null)
    query.exclude = exclude
  if (include != null)
    query.include = include

  let res
  try {
    res = await get(HOST_URI + 'posts', query)
  } catch(res) {
    console.log(res)
    wx.hideLoading()
    wx.showToast({
      icon: 'none',
      title: res.errMsg,
      mask: false,
      duration: 2000
    })
    return null
  }
  console.log(res)
  if (res.statusCode == 200) {
    // 等待渲染完成
    setTimeout(() => wx.hideLoading(), 1000)
    return {
      // 返回的文章数量小于每页的文章数，说明到了最后一页
      isLastPage: res.data.length < app.conf.pageCount,
      posts: res.data.map(item => {
        // 获取文章的第一个图片地址,如果没有给出默认图片
        var featureImage = item.content.rendered.match(
          /<img.*?(?: |\\t|\\r|\\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\\t|\\r|\\n)+.*?)?>/
        )
        if (featureImage != null)
          item.post_thumbnail_image = featureImage[1]
        else
          item.post_thumbnail_image = "../../images/default-thumbnail.png"

        // 解码转义字符
        item.excerpt.rendered = utils.decodeHtmlEntities(item.excerpt.rendered)

        // 时间戳，只取年、月、日部分
        item.date = item.date.substring(0, 10)
        item.views = 0
        if (item.categories.length > 0) {
          item.categoryId = item.categories[0]
          item.categoryName = app.globalData.categories[item.categories[0]].name
        }
        return item
      }),
    }
  } else {
    // 达到最大页数
    if (res.data.code == "rest_post_invalid_page_number") {
      wx.showToast({
        icon: 'error',
        title: '没有更多内容',
        mask: false,
        duration: 2000
      })
      return {
        isLastPage: true,
        posts: [],
      }
    } else {
      // 其他错误
      wx.showToast({
        icon: 'none',
        title: res.data.message,
        mask: false,
        duration: 2000
      })
      return null
    }
  }
}

/**
 * @brief 获取页面内容
 * @param {Number} id
 * @return {Promise}
 */
async function getPageData(id) {
  wx.showLoading({
    title: '正在加载',
    mask: true
  })

  let res
  try {
    res = await get(HOST_URI + 'pages/' + id)
  } catch(res) {
    console.log(res)
    wx.hideLoading()
    wx.showToast({
      icon: 'none',
      title: res.errMsg,
      mask: false,
      duration: 2000
    })
  }
  console.log(res)
  wx.hideLoading()
  if (res.statusCode == 200) {
    return {
      commentOpen: res.data.comment_status == "open",
      content: res.data.content.rendered,
      title: res.data.title.rendered,
      date: res.data.date.substring(0, 10),
    }
  } else {
    wx.showToast({
      icon: 'none',
      title: res.data.message,
      mask: false,
      duration: 2000
    })
    return null
  }
}

/**
 * @brief 获取文章内容
 * @param {Number} id
 * @return {Promise}
 */
async function getPostData(id) {
  wx.showLoading({
    title: '正在加载',
    mask: true
  })

  try {
    const res = await get(HOST_URI + 'posts/' + id)
    console.log(res)
    if (res.statusCode == 200) {
      return {
        commentOpen: res.data.comment_status == "open",
        content: res.data.content.rendered,
        title: res.data.title.rendered,
        date: res.data.date.substring(0, 10),
        categoryId: res.data.categories[0] || 0,
        categoryName: res.data.categories[0] ? app.globalData.categories[res.data.categories[0]].name : "",
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: res.data.message,
        mask: false,
        duration: 2000
      })
      return null
    }
  } catch(res) {
    console.log(res)
    wx.hideLoading()
    wx.showToast({
      icon: 'none',
      title: res.errMsg,
      mask: false,
      duration: 2000
    })
    return null
  }
}

/**
 * @brief 获取评论内容
 * @param {Number} page
 * @param {Number} postId
 * @return {Promise}
 */
async function getComments(page, postId) {
  wx.showLoading({
    title: '正在加载',
    mask: true
  })

  try {
    const res = await get(HOST_URI + 'comments', {
      'post': postId,
      'per_page': 6,
      'parent': 0, // 暂时不支持评论嵌套
      'page': page,
      "orderby": "date",
      "order": "asc",
    })
    wx.hideLoading()
    console.log(res)

    if (res.statusCode == 200) {
      return {
        isLastPage: res.data.length < 6,
        comments: res.data.map(e => {
          e.date = e.date.replace(/T/, ' ')
          // 解码转义字符
          e.content.rendered = utils.decodeHtmlEntities(e.content.rendered)
          // 提取微信头像
          if (e.author_url.match(/https:\/\/wx.qlogo.cn\/mmopen\/vi_32\//))
            e.author_avatar_urls[48] = e.author_url
          return e
        }),
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: res.data.message,
        mask: false,
        duration: 2000
      })
      return null
    }
  } catch(res) {
    console.log(res)
    wx.hideLoading()
    wx.showToast({
      icon: 'none',
      title: res.errMsg,
      mask: false,
      duration: 2000
    })
    return null
  }
}

/**
 * @brief 发布评论
 * @param {Number} postId
 * @param {String} content
 * @param {Promise}
 */
async function addComment(postId, content) {
  wx.showLoading({
    title: '正在发布',
    mask: true
  })
  const data = {
    author_email: 'mp@wechat.com',
    author_name: app.globalData.userInfo.nickName,
    author_user_agent: 'wechat',
    content: content,
    parent: 0, // 暂时不支持评论嵌套
    post: postId,
    // 微信头像
    author_url: app.globalData.userInfo.avatarUrl,
    // meta: {
    // 	wechatAvatarUrl: app.globalData.userInfo.avatarUrl,
    // },
  }
  console.log(data)

  try {
    const res = await post(HOST_URI + 'comments', data)
    console.log(res)
    wx.hideLoading()

    if (res.statusCode == 201) {
      wx.showToast({
        icon: 'success',
        title: '发布成功',
        mask: false,
        duration: 1000
      })
      res.data.date = res.data.date.replace(/T/, ' ')
      res.data.author_avatar_urls[48] = res.data.author_url
      return res.data
    } else {
      wx.showToast({
        icon: 'none',
        title: res.data.message,
        mask: false,
        duration: 2000
      })
      return null
    }
  } catch(res) {
    console.log(res)
    wx.hideLoading()
    wx.showToast({
      icon: 'error',
      title: res.errMsg,
      mask: false,
      duration: 2000
    })
    return null
  }
}

module.exports = {
  addComment,
  getCategories,
  getComments,
  getPageData,
  getPostData,
  getPosts,
}