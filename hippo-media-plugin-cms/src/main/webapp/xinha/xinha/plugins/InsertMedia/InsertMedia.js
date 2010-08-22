/*
//########################################################################
//  GLOBAL VARIABLES
//########################################################################
*/
var MEDIA_PLUGIN_NAME = 'InsertMedia';
var DEFAULT_MEDIA_WIDTH = 425;
var DEFAULT_MEDIA_HEIGHT = 344;
var DEFAULT_MEDIA_URL = 'http://content.longtailvideo.com/videos/flvplayer.flv';
var DEFAULT_MEDIA_PLAYER_LOCATION = 'http://player.longtailvideo.com/player.swf';
var MEDIA_REG_EXP_IMAGE = '(<img[^>]*alt="?MEDIA_placeholder"?[^>]*>)';
var MEDIA_REG_EXP_IMAGE_HEIGHT = '(?:height="([0-9]*)(?:"))';
var MEDIA_REG_EXP_IMAGE_WIDTH = '(?:width="([0-9]*)(?:"))';
var MEDIA_REG_EXP_IMAGE_PLAYER = '(?:player="([a-zA-Z0-9-_]*)(?:"))';
var MEDIA_REG_EXP_OBJECT_HEIGHT = '<object\\s+([^>]*)height="([^"]*)"(.*?)>(.*?)<\/object>';
var MEDIA_REG_EXP_OBJECT_WIDTH = '<object\\s+([^>]*)width="([^"]*)"(.*?)>(.*?)<\/object>';
var MEDIA_REG_EXP_IMAGE_REPLACE = '(<img[^>]*alt="?MEDIA_placeholder"?[^>]*>)';
var MEDIA_REG_EXP_IMAGE_ALT = '(<img\\s+.+alt\\=[\\x27\\x22])([^\\x27\\x22]*)(?:[\\x27\\x22])';
var MEDIA_REG_EXP_OBJECT_DATA = '(<object\\s+.+data\\=[\\x27\\x22])([^\\x27\\x22]*)(?:[\\x27\\x22])';
var MEDIA_OBJECT_TEMPLATE = '<object id="player" name="player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="#WIDTH#" height="#HEIGHT#"><param name="movie" value="#DATA#"><param name="allowfullscreen" value="true"><param name="allowscriptaccess" value="always"><param name="flashvars" value="file=#DATA#imagepreview.jpg"><embed type="application/x-shockwave-flash" id="player2" name="player2" width="#WIDTH#" height="#HEIGHT#" allowscriptaccess="always" allowfullscreen="true" flashvars="file=#DATA#imagepreview.jpg"></object>';
var MEDIA_IMG_TEMPLATE = null;
var MEDIA_OBJECT_REPLACE_DATA = /#DATA#/gi;
var MEDIA_OBJECT_REPLACE_WIDTH = /#WIDTH#/gi;
var MEDIA_OBJECT_REPLACE_HEIGHT = /#HEIGHT#/gi;
var MEDIA_OBJECT_REPLACE_PAYER = /#PLAYER#/gi;
var DUMMY_LOCATION_JWPLAYER = 'http://www.jwplayer.com';
var DUMMY_LOCATION_PLAYER = '';
var DUMMY_LOCATION_VIDEO = '';
var MEDIA_IMG_EDITMODE_PATH = Xinha.getPluginDir(MEDIA_PLUGIN_NAME) + '/img/Media-Player.png';

//########################################################################
//  STANDARD METHODS
//########################################################################
function InsertMedia(editor) {
    this.editor = editor;
    var cfg = editor.config;

    this.mediaPlaceHolderImagePath = Xinha.getPluginDir(MEDIA_PLUGIN_NAME) + '/img/Media-Player.png';
    this.template = '<img alt="MEDIA_placeholder" title="#DATA#" class="Flash"  width="#WIDTH#" height="#HEIGHT#" src="' + this.mediaPlaceHolderImagePath + '" />';
    this.media = null;
    this.dialog = null;

    var self = this;
    cfg.registerButton({
        id       : "insertmedia",
        tooltip  : this._lc("Insert Media"),
        image    : editor.imgURL("media.png", MEDIA_PLUGIN_NAME),
        textMode : false,
        action   : function() {
            self.show();
        }
    });
    cfg.addToolbarElement("insertmedia", "createlink", 1);
}

InsertMedia._pluginInfo = {
    name          : MEDIA_PLUGIN_NAME,
    origin        : "version: 1.0",
    version       : "1.0",
    developer     : "A.Benedetti",
    developer_url : "http://www.sourcesense.nl",
    c_owner       : "SourceSense",
    license       : "APL"
};

InsertMedia.prototype._lc = function(string) {
    return Xinha._lc(string, MEDIA_PLUGIN_NAME);
};

InsertMedia.prototype.onGenerateOnce = function() {
    var self = this;
    Xinha._getback(Xinha.getPluginDir(MEDIA_PLUGIN_NAME) + '/dialog.html', function(getback) {
        self.html = getback;
        self._prepareDialog();
    });
};

InsertMedia.prototype._prepareDialog = function() {
    var self = this;
    var editor = this.editor;

    this.dialog = new Xinha.Dialog(editor, this.html, MEDIA_PLUGIN_NAME, {
        width:DEFAULT_MEDIA_WIDTH, 
        height:DEFAULT_MEDIA_HEIGHT, 
        name:''
    });
    this.dialog.getElementById('ok').onclick = function() {
        self.apply();
    };
    var self = this;
    this.dialog.getElementById('external').onclick = function() {
        var url = editor.config.CreateLink.callbackUrl;

        self.myDialog = new ModalDialog(url, 'hello', '', editor);
        // Connect the OK button
        self.myDialog.onOk = function(values) {
            console.dir(values);
        //self.apply();
        //self.editor.plugins.AutoSave.instance.save();
        };
        self.myDialog.show();
    };

    this.dialog.getElementById('cancel').onclick = function() {
        self.dialog.hide();
    };
};

/**
 * Called when editor button is clicked
 */
InsertMedia.prototype.show = function(el) {
    if (this.dialog == null) {
        this._prepareDialog();
    }

    if (typeof el == "undefined") {
        el = this.editor.getParentElement();
        if (el && el.tagName.toLowerCase() != 'img') {
            el = null;
        }
    }

    var w, h, n;
    if (el == null) {
        this.media = null;
        w = DEFAULT_MEDIA_WIDTH;
        h = DEFAULT_MEDIA_HEIGHT;
        n = DEFAULT_MEDIA_URL;
    } else {
        this.media = el;
        w = typeof this.media['width'] !== 'undefined' ? this.media['width'] : DEFAULT_MEDIA_WIDTH;
        h = typeof this.media['height'] !== 'undefined' ? this.media['height'] : DEFAULT_MEDIA_HEIGHT;
        n = typeof this.media['alt'] !== 'undefined' ? this.media['alt'] : '';
        // y = typeof this.media['href'] != 'undefined' ? this.media['href'] : '';
    }

    this.dialog.show({
        name : n, 
        height : h, 
        width : w
    });
    this.dialog.getElementById("name").focus();
};

InsertMedia.prototype.apply = function () {
    var editor = this.editor;
    var param = this.dialog.hide();
    var url = param['name'];
    var height = param['height'];
    var width = param['width'];

    if (height == null || height.length == 0) {
        height = DEFAULT_MEDIA_HEIGHT;
    }
    if (width == null || width.length == 0) {
        width = DEFAULT_MEDIA_WIDTH;
    }

    if (url == null || url.length == 0) {
        if (this.media != null) {
            var child = this.outwardHtml(this.media.innerHTML);
            this.media.parentNode.removeChild(this.media);
            editor.insertHTML(child);
        } else {
            alert('url empty and media as well??');
        }
        return;
    }

    //IE doesn't understand	setting properties after insert, so workaround it.
    var create = this.media == null;
    if (create) {
        this.media = editor._doc.createElement("img");
    }

    this.media.src = this.mediaPlaceHolderImagePath;
    this.media.title = parseMediaLink(url);
    this.media.height = height;
    this.media.width = width;
    //this.media.player = player;
    this.media.alt = "MEDIA_placeholder";
    this.media.className = "mediaItemFlv";

    if (create) {
        editor.insertNodeAtSelection(this.media);
    }
};


//########################################################################
//  =====================================================================
//########################################################################

/**
 * For given link, check if format is embedded link or not. If not auto-convert it into embedded link
 * ex: http://www.media.com/watch?v=XXX_YYY_ZZZ&hl=en_US&fs=1&
 * should return:
 * http://www.media.com/v/XXX_YYY_ZZZ
 * @param link media link
 */
function parseMediaLink(link) {
    if (link == null) {
        return "";
    }
    if (link.indexOf("watch") != -1) {
        var arr = link.split('?');
        if (arr.length > 1) {
            var start = "http://www.media.com/v/";
            var q = extractQuery(arr[1]);
            if (q.v) {
                return start + q.v + "&fs=1";
            }
        }
    }
    return link;
}

function extractQuery(query) {
    var obj = {}, ret = [];
    query.replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
        obj[key] = (obj[key] ? obj[key] + "," : "") + value;
    });
    return obj;
}

//########################################################################
//  HTML PARSING / INSERTING
//########################################################################
/**
 * This is producing HTML which is used within "EDIT" view,
 * (so it is a fake one). We add an image after the object tag, so editing is not messed up
 * (otherwise all content ends up within <object> tags)
 * @param html editor html
 */
InsertMedia.prototype.inwardHtml = function(html) {
    // first we'll replace old image, if any
    // (shouldn't be there, but just to be sure):
    // var mediaPlaceholder = this.mediaPlaceHolderImagePath;
    // var MEDIA_OBJECT_MATCHER = /<object\b[^>]*(?:title="player")*>(?:[^>]*)(<param[^>]*name="movie"?[^>]*>)[^>]*<\/object>/gi;
    // html.replace(MEDIA_OBJECT_MATCHER, function(object, param, embed) {
    //     var widthRex = new RegExp(MEDIA_REG_EXP_IMAGE_WIDTH, "gi");
    //     var width = mediaPopulateFromImage(embed, widthRex, DEFAULT_MEDIA_WIDTH, 1);
    //     var heightRex = new RegExp(MEDIA_REG_EXP_IMAGE_HEIGHT, "gi");
    //     var height = mediaPopulateFromImage(object, heightRex, DEFAULT_MEDIA_HEIGHT, 1);
    //     var dataRex = new RegExp(MEDIA_REG_EXP_OBJECT_DATA, "gi");
    //     var data = mediaPopulateFromImage(object, dataRex, "", 2);
    //     var replaced = mediaPopulateImageTemplate(mediaPlaceholder, height, width, data);
    //     html = html.replace(object, replaced);
    // });
    // //  
    // return html;
    var startPos = -1, endPos, invalue, attribs, chunkBefore, chunkAfter, img, startPosEmbed, endPosEmbed, ci, attribsob, count;
    
    while ((startPos = html.indexOf('<object', startPos+1)) != -1) {
        //if (!/h|ShockWave|WindowsMedia|QuickTime|RealMedia|Flv)/.test(attribs['class']))
	 //   continue;
        endPos = html.indexOf('</object>', startPos);
	invalueOb = html.substring(startPos + 7, endPos);
	attribsob = parseAttributes(invalueOb);
	endPos += 9;
	
	switch (attribsob['type']) {
	case 'application/x-shockwave-flash':
	    ci = 'mediaItemFlash';
	    break;
	case 'application/x-director':
	    ci = 'mediaItemShockWave';
	    break;
	case 'application/x-mplayer2':
	    ci = 'mediaItemWindowsMedia';
	    break;
	case 'video/quicktime':
	    ci = 'mediaItemQuickTime';
	    break;
	case 'audio/x-pn-realaudio-plugin':
	    ci = 'mediaItemRealMedia';
	    break;
	}
 	if(attribsob['allowscriptaccess']){
	    ci = 'mediaItemFlv';
	}
        //todo, identify the type of obj when the element is an <object>
	// if (!//.test(attribsob['classid']))
        // if(attribsob['classid']){
        //     ci = 'mediaItemFlv';
        // }
	img = makeIMG(ci, attribsob);
    }
    // to enable when xinha supports embed 
    // while ((startPosEmbed = invalueOb.indexOf('<embed', startPosEmbed+1)) != -1) {
    //     endPosEmbed = invalueOb.indexOf('</embed>', startPosEmbed);
    //     invalue = invalueOb.substring(startPosEmbed + 6, endPosEmbed);
    //     attribs = parseAttributes(invalue);
    //     endPosEmbed += 8;
    
    //     switch (attribs['type']) {
    //     case 'application/x-shockwave-flash':
    // 	ci = 'mediaItemFlash';	// 	break;
    //     case 'application/x-director':
    // 	ci = 'mediaItemShockWave';
    // 	break;
    //     case 'application/x-mplayer2':
    // 	ci = 'mediaItemWindowsMedia';
    // 	break;
    //     case 'video/quicktime':
    // 	ci = 'mediaItemQuickTime';
    // 	break;
    //     case 'audio/x-pn-realaudio-plugin':
    // 	ci = 'mediaItemRealMedia';
    // 	break;
    //     }
    //     if(attribs['allowscriptaccess']){
    // 	ci = 'mediaItemFlv';
    //     }
    //     img = makeIMG(ci, attribs);
    // }
    chunkBefore = html.substring(0, startPos);
    chunkAfter = html.substring(endPos);
    html = chunkBefore + img + chunkAfter;
return html;

};

/**
 * Outward HTML is output HTML (which is saved).
 * We only remove all images we inserted for the EDIT view (images with MEDIA_placholder class)
 * @param html editor html (source)
 */
InsertMedia.prototype.outwardHtml = function(html) {
    // // we'll replace image placeholders with object tags:
    // var MEDIA_IMAGE_MATCHER = /<img[^>]*(?:alt="MEDIA_placeholder")[^>]*>/gi;
    // html.replace(MEDIA_IMAGE_MATCHER, function(img) {
    //     var altRex = new RegExp(MEDIA_REG_EXP_IMAGE_ALT, "gi");
    //     var heightRex = new RegExp(MEDIA_REG_EXP_IMAGE_HEIGHT, "gi");
    //     var widthRex = new RegExp(MEDIA_REG_EXP_IMAGE_WIDTH, "gi");
    //     // extract height:
    //     var width = mediaPopulateFromImage(img, widthRex, DEFAULT_MEDIA_WIDTH, 1);
    //     var height = mediaPopulateFromImage(img, heightRex, DEFAULT_MEDIA_HEIGHT, 1);
    //     var alt = mediaPopulateFromImage(img, altRex, "", 2);
    //     var replaced = mediaPopulateTemplate(false, height, width, alt);
    //     html = html.replace(img, replaced);
    // });

    // return html;//.replace(/(<img[^>]*class="?MEDIA_placeholder"?[^>]*>)/ig, "");
    var startPos = -1, endPos, invalue, attribs, chunkBefore, chunkAfter, embedHTML, at, pl, cb, mt, ex, ci;
    while ((startPos = html.indexOf('<img', startPos+1)) != -1) {
	endPos = html.indexOf('/>', startPos);
	invalue = html.substring(startPos + 4, endPos);
	attribs = parseAttributes(invalue);
	
	if(/width/i.test(attribs['style'])){
	    var split_style_val, next;
	    var split_style = attribs['style'].split(":"); 
	    for(var i=0;i<split_style.length;i++){
		if(/width/i.test(split_style[i])){
		    next = i+1;
		    split_style_val = split_style[next].split(";"); 
		    attribs['width'] = split_style_val[0].replace(/px/g,'');
		}
		if(/height/i.test(split_style[i])){
		    next = i+1;
		    split_style_val = split_style[next].split(";");
		    attribs['height'] = split_style_val[0].replace(/px/g,'');
		}
	    }
	}
	try{
	    attribs['height'] = attribs['height'].replace(/^\s+/,'');
	    attribs['width'] = attribs['width'].replace(/^\s+/,'');
	}catch(e){}
	
	if (!/mediaItem(Flash|ShockWave|WindowsMedia|QuickTime|RealMedia|Flv)/.test(attribs['class']))
	    continue;

	endPos += 2;
	// Parse attributes
	at = attribs['title'];
	if (at) {
	    at = at.replace(/&(#39|apos);/g, "'");
	    at = at.replace(/&#quot;/g, '"');
	    
	    var strlen = at.length - 1;
	    var at_test = at.substr(strlen,1);
	    if(at_test == ','){
		at = at.substr(0,strlen);
	    }
	    try {
		pl = eval('x={' + at + '};');
	    } catch (ex) {
		pl = {};
	    }
	}

	// Use object/embed
	//if (getParam('media_use_script', false)){
	switch (attribs['class']) {
	case 'mediaItemFlash':
	    ci = 'd27cdb6e-ae6d-11cf-96b8-444553540000';
	    cb = 'http://get.adobe.com/nl/flashplayer/';
	    mt = 'application/x-shockwave-flash';
	    break;
	case 'mediaItemShockWave':
	    ci = '166B1BCA-3F9C-11CF-8075-444553540000';
	    cb = 'http://get.adobe.com/shockwave/otherversions/';
	    mt = 'application/x-director';
	    break;
	case 'mediaItemWindowsMedia':
	    ci = '6BF52A52-394A-11D3-B153-00C04F79FAA6';
	    cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/';
	    mt = 'application/x-mplayer2';
	    break;
	case 'mediaItemQuickTime':
	    ci = '02BF25D5-8C17-4B23-BC80-D3488ABDDC6B';
	    cb = 'http://www.apple.com/qtactivex';
	    mt = 'video/quicktime';
	    break;
	case 'mediaItemRealMedia':
	    ci = 'CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA';
	    cb = 'http://www.real.com/download/';
	    mt = 'audio/x-pn-realaudio-plugin';
	    break;
	case 'mediaItemFlv':
	    ci = 'd27cdb6e-ae6d-11cf-96b8-444553540000';
	    cb = 'http://get.adobe.com/nl/flashplayer/';
	    mt = 'application/x-shockwave-flash';
	    break;
	}
	embedHTML = getEmbed(ci, cb, mt, pl, attribs);
	/*} else {
	// Use script version
	switch (attribs['class']) {
	case 'mediaItemFlash':
	s = 'writeFlash';
	break;

	case 'mediaItemShockWave':
	s = 'writeShockWave';
	break;

	case 'mediaItemWindowsMedia':
	s = 'writeWindowsMedia';
	break;

	case 'mediaItemQuickTime':
	s = 'writeQuickTime';
	break;

	case 'mediaItemRealMedia':
	s = 'writeRealMedia';
	break;
	}

	if (attribs.width)
	at = at.replace(/width:[^0-9]?[0-9]+%?[^0-9]?/g, "width:'" + attribs.width + "'");
	if (attribs.height)
	at = at.replace(/height:[^0-9]?[0-9]+%?[^0-9]?/g, "height:'" + attribs.height + "'");
	// Force absolute URL
	pl.src = tinyMCE.convertURL(pl.src, null, true);
	at = at.replace(new RegExp("src:'[^']*'", "g"), "src:'" + pl.src + "'");
	embedHTML = '<script type="text/javascript">' + s + '({' + at + '});</script>';
	}*/
	// Insert embed/object chunk
	chunkBefore = html.substring(0, startPos);
	chunkAfter = html.substring(endPos);
	html = chunkBefore + embedHTML + chunkAfter;
    }
    
    return html;
};

/**
 * Parses values from the image placeholder, so we can populate the dialog
 * @param html image html (as text)
 * @param regexp regular expression object
 * @param defaultValue value returned if no match found
 * @param idx which matched group to return
 */
function mediaPopulateFromImage(html, regexp, defaultValue, idx) {
    var res = regexp.exec(html);
    if (res == null) {
        return defaultValue;
    }
    return res[idx];
}

function mediaPopulateImageTemplate(src, height, width, url) {
    return '<img title="MEDIA_placeholder" alt="' + url
        + '" width="' + width
        + '" src="' + src
        + '" height="' + height
        + '" />';
}

function mediaPopulateTemplate(imageTemplate, height, width, url) {
    var result = MEDIA_OBJECT_TEMPLATE;
    //var playerl = DEFAULT_MEDIA_PLAYER_LOCATION;
    result = result.replace(MEDIA_OBJECT_REPLACE_DATA, url);
    result = result.replace(MEDIA_OBJECT_REPLACE_WIDTH, width);
    result = result.replace(MEDIA_OBJECT_REPLACE_HEIGHT, height);
    //result = result.replace(MEDIA_OBJECT_REPLACE_PLAYER, playerl);
    return result;
}

function doFlashvars(m, i){
    var result = 'file=' + m + '&amp;image=' + i;
    var combination = 'file='+ m + '&amp;autoplay=false&=image' + i ; 
    return result;
    
}

function getEmbed(cls, cb, mt, p, at) {
    var h = '', n;

    p.width = at.width ? at.width : p.width;
    p.height = at.height ? at.height : p.height;
    p.title = at.title ? at.title : p.title;
    p.allowfullscreen = "true";
    p.allowscriptaccess = "always";
    p.seamlesstabbing = "true";
    p.vmode = "transparent";
    p.type="application/x-shockwave-flash";
    p.flashvars = doFlashvars(p.title, at.src);
    p.movie = DEFAULT_MEDIA_PLAYER_LOCATION;


    h += '<object id="player"  classid="clsid:' + cls + '" codebase="' + cb + '"';
    h += typeof(p.id) != "undefined" ? ' id="' + p.id + '"' : '';
    h += typeof(p.name) != "undefined" ? ' name="' + p.name + '"' : '';
    h += typeof(p.width) != "undefined" ? ' width="' + p.width + '"' : '';
    h += typeof(p.height) != "undefined" ? ' height="' + p.height + '"' : '';
    h += typeof(p.align) != "undefined" ? ' align="' + p.align + '"' : '';
    h += typeof(p.title) != "undefined" ? ' data="' + p.movie + '"' : '';
    h += typeof(p.type) != "undefined" ? ' type="' + p.type + '"' : '';
    h += '>';

    for (n in p) {
        if (typeof(p[n]) != "undefined" && typeof(p[n]) != "function") {
            h += '<param name="' + n + '" value="' + p[n] + '" />';

            // Add extra url parameter if it's an absolute URL on WMP
            if (n == 'src' && p[n].indexOf('://') != -1 && mt == 'application/x-mplayer2')
                h += '<param name="url" value="' + p[n] + '" />';
        }

    }

    //Todo, because embed element is xhtml deprecated into object?
    // h += '<embed type="' + mt + '"';

    // for (n in p) {
    //     if (typeof(p[n]) == "function")
    //         continue;

    //     // Skip url parameter for embed tag on WMP
    //     if (!(n == 'url' && mt == 'application/x-mplayer2'))
    //         h += ' ' + n + '="' + p[n] + '"';
    // }

    // h += '</embed>';
    h += '</object><br/>';

    return h;
}

function parseAttributes(attribute_string) {
    var attributeName = "", endChr = '"';
    var attributeValue = "";
    var withInName;
    var withInValue;
    var attributes = new Array();
    var whiteSpaceRegExp = new RegExp('^[ \n\r\t]+', 'g');

    if (attribute_string == null || attribute_string.length < 2)
        return null;

    withInName = withInValue = false;

    for (var i=0; i<attribute_string.length; i++) {
        var chr = attribute_string.charAt(i);

        if ((chr == '"' || chr == "'") && !withInValue) {
            withInValue = true;
            endChr = chr;
        } else if (chr == endChr && withInValue) {
            withInValue = false;

            var pos = attributeName.lastIndexOf(' ');
            if (pos != -1)
                attributeName = attributeName.substring(pos+1);

            attributes[attributeName.toLowerCase()] = attributeValue.substring(1);

            attributeName = "";
            attributeValue = "";
        } else if (!whiteSpaceRegExp.test(chr) && !withInName && !withInValue)
            withInName = true;

        if (chr == '=' && withInName)
            withInName = false;

        if (withInName)
            attributeName += chr;

        if (withInValue)
            attributeValue += chr;
    }

    return attributes;
}

function makeIMG(ci, at) {

    var h = '', n;
    // var mediaPlaceholder = this.mediaPlaceHolderImagePath;
    // h += '<img src="' + _editor_url + '.... todo /img/trans.gif" ';
    h += '<img alt="MEDIA_placeholder" src="' + MEDIA_IMG_EDITMODE_PATH + '"';
    //element inserted from the route of the image.
    h += ' class="' + ci + '"';
    h += ' title="';
    //setted the title in the link
    for(n in at){
        if(typeof(at[n]) != "undefined" && typeof(at[n]) != "function" && n != 'type'){
            h += ""+ n +":'"+at[n]+"',";
        }
    }
    h += '"';
    h += typeof(at.id) != "undefined" ? ' id="' + at.id + '"' : '';
    h += typeof(at.name) != "undefined" ? ' name="' + at.name + '"' : '';
    h += typeof(at.width) != "undefined" ? ' width="' + at.width + '"' : '';
    h += typeof(at.height) != "undefined" ? ' height="' + at.height + '"' : '';
    h += typeof(at.align) != "undefined" ? ' align="' + at.align + '"' : '';
    h += typeof(at.style) != "undefined" ? ' style="' + at.style + '"' : '';
    h += '/>';

    return h;

}

function getParam(name, default_value, strip_whitespace, split_chr) {
    var i, outArray, value = (typeof(this.settings[name]) == "undefined") ? default_value : this.settings[name];

    // Fix bool values
    if (value == "true" || value == "false")
        return (value == "true");

    if (strip_whitespace)
        value = regexpReplace(value, "[ \t\r\n]", "");

    if (typeof(split_chr) != "undefined" && split_chr != null) {
        value = value.split(split_chr);
        outArray = [];

        for (i=0; i<value.length; i++) {
            if (value[i] && value[i] !== '')
                outArray[outArray.length] = value[i];
        }

        value = outArray;
    }

    return value;
}

function doScript(param, id)
{
    scr = '<script type="text/freezescript">\nvar fo = new SWFObject("' + param["f_url"] + '", "o' + id + '", "' + param["f_width"] + '", "' + param["f_height"] + '", "8", "' + param["f_bgcolor"] + '");\n';
    var fields = ["align", "quality", "play", "loop", "menu", "devfont", "wmode"];
    for (i=0;i<fields.length;i++) 
        scr+='  fo.addParam("' + fields[i] + '", "' + param['f_'+fields[i]] + '");\n';
    //additional parameters  
    var ar=param["f_addparams"].split("\n");
    for(i=0;i<ar.length;i++) {
        if(ar[i].indexOf("=")>0)
            scr+='  fo.addParam("' + ar[i].split("=")[0] + '", "' + ar[i].split("=")[1] + '");\n';
    }
    scr+='  fo.write("' + id + '")\n</script>\n';  
    return scr;  
}

function doDiv(param,id, scr, html5)
{
    var div='<div class="FlashOverlay" id="' + id + '" style="height:' + param["f_height"] + ';width:' + param["f_width"] + '; border: 1px solid' + param["f_bgcolor"] + ';">\n';
    div+=param["f_alttext"];
    div+='<script type="text/freezescript" src="' + (param["f_scripturl"]) + '"></script>';
    if(!html5){
        div+= scr + '</div>\n';
    } else {
        div+= '<video>'+ param ["f_height"]+' ' +param ["f_width"]+'  '+ param ["f_alttext"]+ '</video>';
        div+= '</div>\n';
    }
    return div;
}
//Need to create 'guid', because incremental ids are not enough - we may have several different contents displayed on the same page
function randomNumber(){
    var idlen=16, id='';
    for(i=1;i<=idlen;i++)
        id+=Math.floor(Math.random() * 16.0).toString(16);
    return id;
}
