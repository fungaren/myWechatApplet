/**
 * html2Json 改造来自: https://github.com/Jxck/html2json
 * 
 * 
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 * 
 * github地址: https://github.com/icindy/wxParse
 * 
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

// Regular Expressions for parsing tags and attributes
var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
	endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
	attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

function makeMap(str) {
	var obj = {}, items = str.split(",");
	for (var i = 0; i < items.length; i++)
		obj[items[i]] = true;
	return obj;
}

// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");

// Block Elements - HTML 5
var block = makeMap("a,address,code,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

// Inline Elements - HTML 5
var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything)
var special = makeMap("wxxxcode-style,script,style,view,scroll-view,block");

function HTMLParser(html, handler) {
	var index, chars, match, stack = [], last = html;
	stack.last = function () {
		return this[this.length - 1];
	};
	while (html) {
		chars = true;
		// Make sure we're not in a script or style element
		if (!stack.last() || !special[stack.last()]) {
			// Comment
			if (html.indexOf("<!--") == 0) {
				index = html.indexOf("-->");

				if (index >= 0) {
					if (handler.comment)
						handler.comment(html.substring(4, index));
					html = html.substring(index + 3);
					chars = false;
				}
				// end tag
			} else if (html.indexOf("</") == 0) {
				match = html.match(endTag);
				if (match) {
					html = html.substring(match[0].length);
					match[0].replace(endTag, parseEndTag);
					chars = false;
				}
				// start tag
			} else if (html.indexOf("<") == 0) {
				match = html.match(startTag);
				if (match) {
					html = html.substring(match[0].length);
					match[0].replace(startTag, parseStartTag);
					chars = false;
				}
			}
			if (chars) {
				index = html.indexOf("<");
				var text = ''
				while (index === 0) {
					text += "<";
					html = html.substring(1);
					index = html.indexOf("<");
				}
				text += index < 0 ? html : html.substring(0, index);
				html = index < 0 ? "" : html.substring(index);

				if (handler.chars)
					handler.chars(text);
			}
		} else {
			html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function (all, text) {
				text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
				if (handler.chars)
					handler.chars(text);

				return "";
			});
			parseEndTag("", stack.last());
		}
		if (html == last)
			throw "Parse Error: " + html;
		last = html;
	}
	// Clean up any remaining tags
	parseEndTag();

	function parseStartTag(tag, tagName, rest, unary) {
		tagName = tagName.toLowerCase();
		if (block[tagName]) {
			while (stack.last() && inline[stack.last()]) {
				parseEndTag("", stack.last());
			}
		}
		if (closeSelf[tagName] && stack.last() == tagName) {
			parseEndTag("", tagName);
		}
		unary = empty[tagName] || !!unary;
		if (!unary)
			stack.push(tagName);
		if (handler.start) {
			var attrs = [];
			rest.replace(attr, function (match, name) {
				var value = arguments[2] ? arguments[2] :
					arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
							fillAttrs[name] ? name : "";
				attrs.push({
					name: name,
					value: value,
					escaped: value.replace(/(^|[^\\])"/g, '$1\\\"')
				});
			});
			if (handler.start) {
				handler.start(tagName, attrs, unary);
			}
		}
	}
	function parseEndTag(tag, tagName) {
		// If no tag name is provided, clean shop
		if (!tagName)
			var pos = 0;

		// Find the closest opened tag of the same type
		else {
			tagName = tagName.toLowerCase();
			for (var pos = stack.length - 1; pos >= 0; pos--)
				if (stack[pos] == tagName)
					break;
		}
		if (pos >= 0) {
			// Close all the open elements, up the stack
			for (var i = stack.length - 1; i >= pos; i--)
				if (handler.end)
					handler.end(stack[i]);

			// Remove the open elements from the stack
			stack.length = pos;
		}
	}
}

function urlToHttpUrl(url, rep) {
	var pattern = new RegExp("^//");
	var result = pattern.test(url);
	if (result) {
		url = rep + ":" + url;
	}
	return url;
}

var Decode = require('../utils/decode.js')
function html2json(html, bindName) {
	html = html	.replace(/<\?xml.*\?>\n/, '')
				.replace(/<.*!doctype.*\>\n/, '')
				.replace(/<.*!DOCTYPE.*\>\n/, '')
				//.replace(/\n+/g, '') // 会导致代码块中的换行丢失
				.replace(/<!--.*?-->/ig, '')
				.replace(/\/\*.*?\*\//ig, '')
				.replace(/[ ]+</ig, '<');
	html = Decode.htmlDecode(html);

    // 生成node节点
    var bufArray = [];
    var results = {
        node: bindName,
        nodes: [],
        images:[],
        imageUrls:[]
    };
    var index = 0;
    HTMLParser(html, {
        start: function (tag, attrs, unary) {
            // node for this element
            var node = {
                node: 'element',
                tag: tag,
            };

            if (bufArray.length === 0) {
                node.index = index.toString()
                index += 1
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                node.index = parent.index + '.' + parent.nodes.length
            }

            if (block[tag]) {
                node.tagType = "block";
            } else if (inline[tag]) {
                node.tagType = "inline";
            } else if (closeSelf[tag]) {
                node.tagType = "closeSelf";
            }

            if (attrs.length !== 0) {
                node.attr = attrs.reduce(function (pre, attr) {
                    var name = attr.name;
                    var value = attr.value;
                    if (name == 'class') {
                        //console.dir(value);
                        //  value = value.join("")
                        node.classStr = value;
                    }
                    // has multi attibutes, make it array of attribute
                    if (name == 'style') {
                        //console.dir(value);
                        //  value = value.join("")
                        node.styleStr = value;
                    }
                    if (value.match(/ /)) {
                        value = value.split(' ');
                    }
                    // if attr already exists, merge it
                    if (pre[name]) {
                        if (Array.isArray(pre[name])) {
                            // already array, push to last
                            pre[name].push(value);
                        } else {
                            // single value, make it array
                            pre[name] = [pre[name], value];
                        }
                    } else {
                        // not exist, put it
                        pre[name] = value;
                    }

                    return pre;
                }, {});
            }

            // 对img添加额外数据
            if (node.tag === 'img') {
                node.imgIndex = results.images.length;
                var imgUrl = node.attr.src;
                if (imgUrl[0] == '') {
                    imgUrl.splice(0, 1);
                }
				imgUrl = urlToHttpUrl(imgUrl, "https");
                node.attr.src = imgUrl;
                node.from = bindName;
                results.images.push(node);
                results.imageUrls.push(imgUrl);
            }
            
            // 处理font标签样式属性
            if (node.tag === 'font') {
                var fontSize = ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', '-webkit-xxx-large'];
                var styleAttrs = {
                    'color': 'color',
                    'face': 'font-family',
                    'size': 'font-size'
                };
                if (!node.attr.style) node.attr.style = [];
                if (!node.styleStr) node.styleStr = '';
                for (var key in styleAttrs) {
                    if (node.attr[key]) {
                        var value = key === 'size' ? fontSize[node.attr[key]-1] : node.attr[key];
                        node.attr.style.push(styleAttrs[key]);
                        node.attr.style.push(value);
                        node.styleStr += styleAttrs[key] + ': ' + value + ';';
                    }
                }
            }
            // 临时记录source资源
            if (node.tag === 'source') {
                results.source = node.attr.src;
            }
            if (unary) {
                // if this tag dosen't have end tag like <img src="hoge.png"/>
				// add to parents
                var parent = bufArray[0] || results;
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            } else {
                bufArray.unshift(node);
            }
        },
        end: function (tag) {
            // merge into parent tag
            var node = bufArray.shift();
            if (node.tag !== tag) console.error('invalid state: mismatch end tag');

            // 当有缓存source资源时于于video补上src资源
            if(node.tag === 'video' && results.source){
                node.attr.src = results.source;
                delete result.source;
            }
            
            if (bufArray.length === 0) {
                results.nodes.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            }
        },
        chars: function (text) {
            var node = {
                node: 'text',
                text: text,
                textArray:transEmojiStr(text)
            };
            
            if (bufArray.length === 0) {
                results.nodes.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                node.index = parent.index + '.' + parent.nodes.length
                parent.nodes.push(node);
            }
        },
        comment: function (text) {
            // var node = {
            //     node: 'comment',
            //     text: text,
            // };
            // var parent = bufArray[0];
            // if (parent.nodes === undefined) {
            //     parent.nodes = [];
            // }
            // parent.nodes.push(node);
        },
    });
    return results;
};

var __emojisReg = '';
var __emojisBaseSrc = '';
var __emojis = {};

function transEmojiStr(str) {
	//   var eReg = new RegExp("["+__reg+' '+"]");
	//   str = str.replace(/\[([^\[\]]+)\]/g,':$1:')
	var emojiObjs = [];
	if (__emojisReg.length == 0 || !__emojis) {
		var emojiObj = {}
		emojiObj.node = "text";
		emojiObj.text = str;
		array = [emojiObj];
		return array;
	}

	str = str.replace(/\[([^\[\]]+)\]/g, ':$1:')
	var eReg = new RegExp("[:]");
	var array = str.split(eReg);
	for (var i = 0; i < array.length; i++) {
		var ele = array[i];
		var emojiObj = {};
		if (__emojis[ele]) {
			emojiObj.node = "element";
			emojiObj.tag = "emoji";
			emojiObj.text = __emojis[ele];
			emojiObj.baseSrc = __emojisBaseSrc;
		} else {
			emojiObj.node = "text";
			emojiObj.text = ele;
		}
		emojiObjs.push(emojiObj);
	}

	return emojiObjs;
}

function emojisInit(reg, baseSrc, emojis) {
	__emojisReg = reg;
	__emojisBaseSrc = baseSrc;
	__emojis = emojis;
}


module.exports = {
    html2json: html2json
};
