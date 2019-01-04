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

// HTML 支持的数学符号
function strNumDecode(str) {
	str = str.replace(/&forall;/g, '∀');
	str = str.replace(/&part;/g, '∂');
	str = str.replace(/&exists;/g, '∃');
	str = str.replace(/&empty;/g, '∅');
	str = str.replace(/&nabla;/g, '∇');
	str = str.replace(/&isin;/g, '∈');
	str = str.replace(/&notin;/g, '∉');
	str = str.replace(/&ni;/g, '∋');
	str = str.replace(/&prod;/g, '∏');
	str = str.replace(/&sum;/g, '∑');
	str = str.replace(/&minus;/g, '−');
	str = str.replace(/&lowast;/g, '∗');
	str = str.replace(/&radic;/g, '√');
	str = str.replace(/&prop;/g, '∝');
	str = str.replace(/&infin;/g, '∞');
	str = str.replace(/&ang;/g, '∠');
	str = str.replace(/&and;/g, '∧');
	str = str.replace(/&or;/g, '∨');
	str = str.replace(/&cap;/g, '∩');
	str = str.replace(/&cap;/g, '∪');
	str = str.replace(/&int;/g, '∫');
	str = str.replace(/&there4;/g, '∴');
	str = str.replace(/&sim;/g, '∼');
	str = str.replace(/&cong;/g, '≅');
	str = str.replace(/&asymp;/g, '≈');
	str = str.replace(/&ne;/g, '≠');
	str = str.replace(/&le;/g, '≤');
	str = str.replace(/&ge;/g, '≥');
	str = str.replace(/&sub;/g, '⊂');
	str = str.replace(/&sup;/g, '⊃');
	str = str.replace(/&nsub;/g, '⊄');
	str = str.replace(/&sube;/g, '⊆');
	str = str.replace(/&supe;/g, '⊇');
	str = str.replace(/&oplus;/g, '⊕');
	str = str.replace(/&otimes;/g, '⊗');
	str = str.replace(/&perp;/g, '⊥');
	str = str.replace(/&sdot;/g, '⋅');
	return str;
}

//HTML 支持的希腊字母
function strGreeceDecode(str) {
	str = str.replace(/&Alpha;/g, 'Α');
	str = str.replace(/&Beta;/g, 'Β');
	str = str.replace(/&Gamma;/g, 'Γ');
	str = str.replace(/&Delta;/g, 'Δ');
	str = str.replace(/&Epsilon;/g, 'Ε');
	str = str.replace(/&Zeta;/g, 'Ζ');
	str = str.replace(/&Eta;/g, 'Η');
	str = str.replace(/&Theta;/g, 'Θ');
	str = str.replace(/&Iota;/g, 'Ι');
	str = str.replace(/&Kappa;/g, 'Κ');
	str = str.replace(/&Lambda;/g, 'Λ');
	str = str.replace(/&Mu;/g, 'Μ');
	str = str.replace(/&Nu;/g, 'Ν');
	str = str.replace(/&Xi;/g, 'Ν');
	str = str.replace(/&Omicron;/g, 'Ο');
	str = str.replace(/&Pi;/g, 'Π');
	str = str.replace(/&Rho;/g, 'Ρ');
	str = str.replace(/&Sigma;/g, 'Σ');
	str = str.replace(/&Tau;/g, 'Τ');
	str = str.replace(/&Upsilon;/g, 'Υ');
	str = str.replace(/&Phi;/g, 'Φ');
	str = str.replace(/&Chi;/g, 'Χ');
	str = str.replace(/&Psi;/g, 'Ψ');
	str = str.replace(/&Omega;/g, 'Ω');

	str = str.replace(/&alpha;/g, 'α');
	str = str.replace(/&beta;/g, 'β');
	str = str.replace(/&gamma;/g, 'γ');
	str = str.replace(/&delta;/g, 'δ');
	str = str.replace(/&epsilon;/g, 'ε');
	str = str.replace(/&zeta;/g, 'ζ');
	str = str.replace(/&eta;/g, 'η');
	str = str.replace(/&theta;/g, 'θ');
	str = str.replace(/&iota;/g, 'ι');
	str = str.replace(/&kappa;/g, 'κ');
	str = str.replace(/&lambda;/g, 'λ');
	str = str.replace(/&mu;/g, 'μ');
	str = str.replace(/&nu;/g, 'ν');
	str = str.replace(/&xi;/g, 'ξ');
	str = str.replace(/&omicron;/g, 'ο');
	str = str.replace(/&pi;/g, 'π');
	str = str.replace(/&rho;/g, 'ρ');
	str = str.replace(/&sigmaf;/g, 'ς');
	str = str.replace(/&sigma;/g, 'σ');
	str = str.replace(/&tau;/g, 'τ');
	str = str.replace(/&upsilon;/g, 'υ');
	str = str.replace(/&phi;/g, 'φ');
	str = str.replace(/&chi;/g, 'χ');
	str = str.replace(/&psi;/g, 'ψ');
	str = str.replace(/&omega;/g, 'ω');
	str = str.replace(/&thetasym;/g, 'ϑ');
	str = str.replace(/&upsih;/g, 'ϒ');
	str = str.replace(/&piv;/g, 'ϖ');
	str = str.replace(/&middot;/g, '·');
	return str;
}

// 加入常用解析
function strCharacterDecode(str) {
	str = str.replace(/&nbsp;/g, ' ');
	str = str.replace(/&quot;/g, "'");
	str = str.replace(/&amp;/g, '&');

	// str = str.replace(/&lt;/g, '‹');
	// str = str.replace(/&gt;/g, '›');
	str = str.replace(/&lt;/g, '<');
	str = str.replace(/&gt;/g, '>');

	str = str.replace(/&#8226;/g, '•');
	str = str.replace(/&/g, '&');
	str = str.replace(/&#8221;/g, '"');
	str = str.replace(/&#8216;/g, '\'');
	str = str.replace(/&#8217;/g, '\'');
	str = str.replace(/&#x27;/g, '\'');
	str = str.replace(/&#8230;/g, '...');
	str = str.replace(/&#8220;/g, '"');
	str = str.replace(/&#038;/g, '&');
	str = str.replace(/&#8211;/g, '-');
	str = str.replace(/&#8212;/g, '--');
	return str;
}

// HTML 支持的其他实体
function strOtherDecode(str) {
	str = str.replace(/&OElig;/g, 'Œ');
	str = str.replace(/&oelig;/g, 'œ');
	str = str.replace(/&Scaron;/g, 'Š');
	str = str.replace(/&scaron;/g, 'š');
	str = str.replace(/&Yuml;/g, 'Ÿ');
	str = str.replace(/&fnof;/g, 'ƒ');
	str = str.replace(/&circ;/g, 'ˆ');
	str = str.replace(/&tilde;/g, '˜');
	str = str.replace(/&ensp;/g, '');
	str = str.replace(/&emsp;/g, '');
	str = str.replace(/&thinsp;/g, '');
	str = str.replace(/&zwnj;/g, '');
	str = str.replace(/&zwj;/g, '');
	str = str.replace(/&lrm;/g, '');
	str = str.replace(/&rlm;/g, '');
	str = str.replace(/&ndash;/g, '–');
	str = str.replace(/&mdash;/g, '—');
	str = str.replace(/&lsquo;/g, '‘');
	str = str.replace(/&rsquo;/g, '’');
	str = str.replace(/&sbquo;/g, '‚');
	str = str.replace(/&ldquo;/g, '“');
	str = str.replace(/&rdquo;/g, '”');
	str = str.replace(/&bdquo;/g, '„');
	str = str.replace(/&dagger;/g, '†');
	str = str.replace(/&Dagger;/g, '‡');
	str = str.replace(/&bull;/g, '•');
	str = str.replace(/&hellip;/g, '…');
	str = str.replace(/&permil;/g, '‰');
	str = str.replace(/&prime;/g, '′');
	str = str.replace(/&Prime;/g, '″');
	str = str.replace(/&lsaquo;/g, '‹');
	str = str.replace(/&rsaquo;/g, '›');
	str = str.replace(/&oline;/g, '‾');
	str = str.replace(/&euro;/g, '€');
	str = str.replace(/&trade;/g, '™');

	str = str.replace(/&larr;/g, '←');
	str = str.replace(/&uarr;/g, '↑');
	str = str.replace(/&rarr;/g, '→');
	str = str.replace(/&darr;/g, '↓');
	str = str.replace(/&harr;/g, '↔');
	str = str.replace(/&crarr;/g, '↵');
	str = str.replace(/&lceil;/g, '⌈');
	str = str.replace(/&rceil;/g, '⌉');

	str = str.replace(/&lfloor;/g, '⌊');
	str = str.replace(/&rfloor;/g, '⌋');
	str = str.replace(/&loz;/g, '◊');
	str = str.replace(/&spades;/g, '♠');
	str = str.replace(/&clubs;/g, '♣');
	str = str.replace(/&hearts;/g, '♥');

	str = str.replace(/&diams;/g, '♦');
	str = str.replace(/&#39;/g, '\'');
	return str;
}

function strDecode(str) {
	str = strNumDecode(str);
	str = strGreeceDecode(str);
	str = strCharacterDecode(str);
	str = strOtherDecode(str);
	return str;
}

function urlToHttpUrl(url, rep) {
	var pattern = new RegExp("^//");
	var result = pattern.test(url);
	if (result) {
		url = rep + ":" + url;
	}
	return url;
}

function removeDOCTYPE(html) {
    return html
        .replace(/<\?xml.*\?>\n/, '')
        .replace(/<.*!doctype.*\>\n/, '')
        .replace(/<.*!DOCTYPE.*\>\n/, '');
}

function trimHtml(html) {
	return html
        .replace(/\n+/g, '')
        .replace(/<!--.*?-->/ig, '')
        .replace(/\/\*.*?\*\//ig, '')
        .replace(/[ ]+</ig, '<')
}

function html2json(html, bindName) {
    html = removeDOCTYPE(html);
    html = trimHtml(html);
    html = strDecode(html);
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
		if (__emojis[ele])
		{
			emojiObj.node = "element";
			emojiObj.tag = "emoji";
			emojiObj.text = __emojis[ele];
			emojiObj.baseSrc= __emojisBaseSrc;
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
    __emojisBaseSrc=baseSrc;
    __emojis=emojis;
}

module.exports = {
    html2json: html2json,
    emojisInit:emojisInit
};
