function formatTime(date) {
  function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' +
    [hour, minute, second].map(formatNumber).join(':')
}

function openHyperLink(href) {
  if (href.indexOf(app.conf.domain) == -1) {
    wx.setClipboardData({
      data: href,
      success() {
        wx.showToast({
          icon: 'success',
          title: '链接已复制',
          mask: false,
          duration: 2000
        })
      }
    })
  } else {
    // 站内链接进行跳转
    var postId = href.substring(href.lastIndexOf("/") + 1)
    if (postId == '')
      wx.switchTab({
        url: '../index/index'
      })
    else
      wx.navigateTo({
        url: '../detail/detail?id=' + postId
      })
  }
}

// HTML 支持的数学符号
function strNumDecode(str) {
  str = str.replaceAll("&forall;",'∀')
  str = str.replaceAll("&part;",'∂')
  str = str.replaceAll("&exists;",'∃')
  str = str.replaceAll("&empty;",'∅')
  str = str.replaceAll("&nabla;",'∇')
  str = str.replaceAll("&isin;",'∈')
  str = str.replaceAll("&notin;",'∉')
  str = str.replaceAll("&ni;",'∋')
  str = str.replaceAll("&prod;",'∏')
  str = str.replaceAll("&sum;",'∑')
  str = str.replaceAll("&minus;",'−')
  str = str.replaceAll("&lowast;",'∗')
  str = str.replaceAll("&radic;",'√')
  str = str.replaceAll("&prop;",'∝')
  str = str.replaceAll("&infin;",'∞')
  str = str.replaceAll("&ang;",'∠')
  str = str.replaceAll("&and;",'∧')
  str = str.replaceAll("&or;",'∨')
  str = str.replaceAll("&cap;",'∩')
  str = str.replaceAll("&cap;",'∪')
  str = str.replaceAll("&int;",'∫')
  str = str.replaceAll("&there4;",'∴')
  str = str.replaceAll("&sim;",'∼')
  str = str.replaceAll("&cong;",'≅')
  str = str.replaceAll("&asymp;",'≈')
  str = str.replaceAll("&ne;",'≠')
  str = str.replaceAll("&le;",'≤')
  str = str.replaceAll("&ge;",'≥')
  str = str.replaceAll("&sub;",'⊂')
  str = str.replaceAll("&sup;",'⊃')
  str = str.replaceAll("&nsub;",'⊄')
  str = str.replaceAll("&sube;",'⊆')
  str = str.replaceAll("&supe;",'⊇')
  str = str.replaceAll("&oplus;",'⊕')
  str = str.replaceAll("&otimes;",'⊗')
  str = str.replaceAll("&perp;",'⊥')
  str = str.replaceAll("&sdot;",'⋅')
  return str;
}

//HTML 支持的希腊字母
function strGreeceDecode(str) {
  str = str.replaceAll("&Alpha;",'Α')
  str = str.replaceAll("&Beta;",'Β')
  str = str.replaceAll("&Gamma;",'Γ')
  str = str.replaceAll("&Delta;",'Δ')
  str = str.replaceAll("&Epsilon;",'Ε')
  str = str.replaceAll("&Zeta;",'Ζ')
  str = str.replaceAll("&Eta;",'Η')
  str = str.replaceAll("&Theta;",'Θ')
  str = str.replaceAll("&Iota;",'Ι')
  str = str.replaceAll("&Kappa;",'Κ')
  str = str.replaceAll("&Lambda;",'Λ')
  str = str.replaceAll("&Mu;",'Μ')
  str = str.replaceAll("&Nu;",'Ν')
  str = str.replaceAll("&Xi;",'Ν')
  str = str.replaceAll("&Omicron;",'Ο')
  str = str.replaceAll("&Pi;",'Π')
  str = str.replaceAll("&Rho;",'Ρ')
  str = str.replaceAll("&Sigma;",'Σ')
  str = str.replaceAll("&Tau;",'Τ')
  str = str.replaceAll("&Upsilon;",'Υ')
  str = str.replaceAll("&Phi;",'Φ')
  str = str.replaceAll("&Chi;",'Χ')
  str = str.replaceAll("&Psi;",'Ψ')
  str = str.replaceAll("&Omega;",'Ω')
  str = str.replaceAll("&alpha;",'α')
  str = str.replaceAll("&beta;",'β')
  str = str.replaceAll("&gamma;",'γ')
  str = str.replaceAll("&delta;",'δ')
  str = str.replaceAll("&epsilon;",'ε')
  str = str.replaceAll("&zeta;",'ζ')
  str = str.replaceAll("&eta;",'η')
  str = str.replaceAll("&theta;",'θ')
  str = str.replaceAll("&iota;",'ι')
  str = str.replaceAll("&kappa;",'κ')
  str = str.replaceAll("&lambda;",'λ')
  str = str.replaceAll("&mu;",'μ')
  str = str.replaceAll("&nu;",'ν')
  str = str.replaceAll("&xi;",'ξ')
  str = str.replaceAll("&omicron;",'ο')
  str = str.replaceAll("&pi;",'π')
  str = str.replaceAll("&rho;",'ρ')
  str = str.replaceAll("&sigmaf;",'ς')
  str = str.replaceAll("&sigma;",'σ')
  str = str.replaceAll("&tau;",'τ')
  str = str.replaceAll("&upsilon;",'υ')
  str = str.replaceAll("&phi;",'φ')
  str = str.replaceAll("&chi;",'χ')
  str = str.replaceAll("&psi;",'ψ')
  str = str.replaceAll("&omega;",'ω')
  str = str.replaceAll("&thetasym;",'ϑ')
  str = str.replaceAll("&upsih;",'ϒ')
  str = str.replaceAll("&piv;",'ϖ')
  str = str.replaceAll("&middot;",'·')
  return str;
}

// HTML 支持的其他实体
function strCharacterDecode(str) {
  str = str.replaceAll("&nbsp;",' ')
  str = str.replaceAll("&quot;","'")
  str = str.replaceAll("&amp;",'&')
  str = str.replaceAll("&lt;",'<')
  str = str.replaceAll("&gt;",'>')
  str = str.replaceAll("&#8226;",'•')
  str = str.replaceAll("&#8221;",'"')
  str = str.replaceAll("&#8216;",'\'')
  str = str.replaceAll("&#8217;",'\'')
  str = str.replaceAll("&#x27;",'\'')
  str = str.replaceAll("&#8230;",'...')
  str = str.replaceAll("&#8220;",'"')
  str = str.replaceAll("&#038;",'&')
  str = str.replaceAll("&#8211;",'-')
  str = str.replaceAll("&#8212;",'--')
  str = str.replaceAll("&OElig;",'Œ')
  str = str.replaceAll("&oelig;",'œ')
  str = str.replaceAll("&Scaron;",'Š')
  str = str.replaceAll("&scaron;",'š')
  str = str.replaceAll("&Yuml;",'Ÿ')
  str = str.replaceAll("&fnof;",'ƒ')
  str = str.replaceAll("&circ;",'ˆ')
  str = str.replaceAll("&tilde;",'˜')
  str = str.replaceAll("&ensp;",'')
  str = str.replaceAll("&emsp;",'')
  str = str.replaceAll("&thinsp;",'')
  str = str.replaceAll("&zwnj;",'')
  str = str.replaceAll("&zwj;",'')
  str = str.replaceAll("&lrm;",'')
  str = str.replaceAll("&rlm;",'')
  str = str.replaceAll("&ndash;",'–')
  str = str.replaceAll("&mdash;",'—')
  str = str.replaceAll("&lsquo;",'‘')
  str = str.replaceAll("&rsquo;",'’')
  str = str.replaceAll("&sbquo;",'‚')
  str = str.replaceAll("&ldquo;",'“')
  str = str.replaceAll("&rdquo;",'”')
  str = str.replaceAll("&bdquo;",'„')
  str = str.replaceAll("&dagger;",'†')
  str = str.replaceAll("&Dagger;",'‡')
  str = str.replaceAll("&bull;",'•')
  str = str.replaceAll("&hellip;",'…')
  str = str.replaceAll("&permil;",'‰')
  str = str.replaceAll("&prime;",'′')
  str = str.replaceAll("&Prime;",'″')
  str = str.replaceAll("&lsaquo;",'‹')
  str = str.replaceAll("&rsaquo;",'›')
  str = str.replaceAll("&oline;",'‾')
  str = str.replaceAll("&euro;",'€')
  str = str.replaceAll("&trade;",'™')
  str = str.replaceAll("&larr;",'←')
  str = str.replaceAll("&uarr;",'↑')
  str = str.replaceAll("&rarr;",'→')
  str = str.replaceAll("&darr;",'↓')
  str = str.replaceAll("&harr;",'↔')
  str = str.replaceAll("&crarr;",'↵')
  str = str.replaceAll("&lceil;",'⌈')
  str = str.replaceAll("&rceil;",'⌉')
  str = str.replaceAll("&lfloor;",'⌊')
  str = str.replaceAll("&rfloor;",'⌋')
  str = str.replaceAll("&loz;",'◊')
  str = str.replaceAll("&spades;",'♠')
  str = str.replaceAll("&clubs;",'♣')
  str = str.replaceAll("&hearts;",'♥')
  str = str.replaceAll("&diams;",'♦')
  str = str.replaceAll("&#39;",'\'')
  return str
}

function decodeHtmlEntities(str) {
  str = strNumDecode(str)
  str = strGreeceDecode(str)
  str = strCharacterDecode(str)
  return str
}

module.exports = {
  formatTime,
  openHyperLink,
  decodeHtmlEntities,
}
