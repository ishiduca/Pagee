var AP = Array.prototype;
if (! AP.empty) {
    AP.empty = function () {
        return (this.length > 0) ? false : true;
    };
}
if (! AP.forEach) {
    AP.forEach = function (func) {
        var i = 0, len = this.length;
        for (; i < len; i++) {
            func(this[i], i);
        }
    };
}
if (! AP.fold) {
    AP.fold = function (func) {
        var that  = this.slice();
        var first = that.shift();
        for (var i = 0, len = that.length; i < len; i++) {
            first = func(first, that.shift());
        }
        return first;
    };
}
if (! AP.map) {
    AP.map = function (func) {
        var that = this.slice();
        for (var i = 0, len = that.length; i < len; i++) {
            that[i] = func(that[i], i);
        }
        return that;
    };
}
if (! AP.grep) {
    AP.grep = function (func) {
        var that = [];
        for (var i = 0, len = this.length; i < len; i++) {
            _this = this[i];
            if (func(_this)) that.push(_this);
        }
        return that;
    };
}

if (! AP.max) {
    AP.max = function () {
        return Math.max.apply(null, this.grep(function (arg) {
            return isNumber(arg);
        }));
        //return this.grep(function (arg) {
        //    return isNumber(arg);
        //}).fold(function (a, b) {
        //    return (a < b) ? b : a;
        //});
    };
}
if (! AP.min) {
    AP.min = function () {
         return Math.min.apply(null, this.grep(function (arg) {
            return isNumber(arg);
        }));
        //return this.grep(function (arg) {
        //    return isNumber(arg);
        //}).fold(function (a, b) {
        //    return (a < b) ? a : b;
        //});
    };
}

if (! AP.swap) {
    AP.swap = function (a, b) {
        var that = this.slice();
        var buf  = that[a]; that[a] = that[b]; that[b] = buf;
        return that;
    };
}

if (! Function.prototype.partcial) {
    Function.prototype.partcial = function (thisObject, args) {
        var func = this;
        return function () {
            var _args = AP.slice.apply(arguments);
            return func.apply(thisObject, args.concat(_args));
        };
    };
}

var Np = Number.prototype;
if (! Np.createEmptyArray) {
    Np.createEmptyArray = function (type) {
        var arry = [], i = 0;
        for (;i < this; i += 1) {
            arry[i] = (isUndefined(type)) ? "" : type;
        }
        return arry;
    };
}
if (! Np.toKeta) {
    Np.toKeta = function (pattern) {
        if (isUndefined(pattern)) pattern = "00";
        if (! isString(pattern)) return this.toString();
        var that = this.toString();
        var length = pattern.length - that.length;
        if (length <= 0) return that;
        return [ pattern.slice(0, length), that ].join('');
    };
}

function isFalse (target) {
    return (target === false) ? true : false;
}
function isTrue (target) {
    return (target === true) ? true : false;
}
function isUndefined (target) {
    return (typeof target === 'undefined') ? true : false;
}
function isNumber (target) {
    return (target === target-0) ? true : false;
}
function isString (target) {
    return (typeof target === 'string') ? true : false;
}
function isDom (target) {
    return (! window)                   ? false :
           (! window.document)          ? false :
           (target === window)          ? true  :
           (target === window.document) ? true  :
           (target.parentNode)          ? true  :

           (target.setAttribute)        ? true  : false;
}

function foreach (arry, func) {
    var i = 0, len = arry.length;
    for (; i < len; i++) {
        func(arry[i], i);
    }
}
function join () {
    var args = AP.slice.apply(arguments);
    return args.join('');
}
function qw (str, cut) {
    if (! str) return [];
    str = str.replace(/^\s+/g, '').replace(/\s+$/g, '');
    return str.split(cut || new RegExp("\\s+", "g"));
}
function objectClone (org) {
    if (isUndefined(org)) {
        return ;
    }
    var F = function () {};
    F.prototype = org;
    return new F;
}
function Hotkey (element) {
    this.init(element);
}
(function (hp) {
    var keyCodes = {
        8  : 'back',
        9  : 'tab',
        13 : 'enter',
        16 : 'shift',
        17 : 'ctrl',
        46 : 'delete'
    };

    keyCodes.keymap = function (a, b, c) {
        if (isUndefined(c)) c = 0;
        for (; a <= b; a++) {
            this[a] = String.fromCharCode(a + c);
        }
    };

    keyCodes.keymap(48, 57);       // 0-9
    keyCodes.keymap(65, 90,  32);  // a-z
    keyCodes.keymap(96, 105, -48); // 

    delete keyCodes.keymap;

    foreach(qw('space pageup pagedown end home left up right down'), function (key, i) {
        keyCodes[i + 32] = key;
    });

    hp['keyCodes'] = keyCodes;
    hp['ignore']   = /input|textarea/i;

    hp.init = function (element) {
                this['target'] = element || document;
                this['funcs']  = {};

                var  that = this;

                addEvent(this['target'], 'keydown', function (e) {
                    that.onkeydown.apply(that, [ e ]);
                }, true);

                return this;
    };

    hp.onkeydown = function (e) {
                var tag = (e.target || e.srcElement).tagName;

                if (this['ignore'].test(tag)) return this;

                var key = this['keyCodes'][e.keyCode];

                if (isUndefined(key)) return this;;

                if (e.shiftKey && key.length === 1) key = key.toUpperCase();
                if (e.ctrlKey) key = [ "C", key ].join('');

                if (this['funcs'].hasOwnProperty(key)) this['funcs'][key].apply(this, [e]);

                return this;
    };

    hp.add = function (key, func) {
                if (key) {
                    if (key.constructor === Array) {
                        for (var i = 0, len = key.length; i < len; i++) {
                            this['funcs'][key[i]] = func;
                        }
                    } else {
                        this['funcs'][key] = func;
                    }
                }
                return this;
    };

})(Hotkey.prototype);


var d = document;

function addEvent (target, type, listener, useCapture) {
    if (target.addEventListener) {
        useCapture = useCapture || false;
        return target.addEventListener(type, listener, useCapture);
    }
    type = 'on' + type;
    if (target.attachEvent) {
        return target.attachEvent(type, listener);
    }
    target[type] = listener;
}

function getBrowserWidth () {
    if (window.innerWidth) {
        return window.innerWidth;
    }
    var de = document.documentElement;
    if (de && de.clientWidth) {
        return de.clientWidth;
    }
    var db = document.body;
    if (db && db.clientWidth) {
        return db.clientWidth;
    }
    return ;
}
function getBrowserHeight () {
    if (window.innerHeight) {
        return window.innerHeight;
    }
    var de = document.documentElement;
    if (de && de.clientHeight) {
        return de.clientHeight;
    }
    var db = document.body;
    if (db && db.clientHeight) {
        return db.clientHeight;
    }
    return ;
}


function gid (id) {
    if (! isString(id)) return alert('Type Error: typeof "id" should be "string"');
    var _gid = d.getElementById(id) || undefined;
    if (! _gid) alert('not found "' + id + '"');
    return _gid;
}
function tags (parentnode, tagname) {
    if (arguments.length === 0) return alert('Type Error: not found "arguments" in "tags"');
    if (arguments.length === 1) {
        tagname = arguments[0];
        parentnode = document;
    }
    if (! isDom(parentnode)) return alert('Type Error: "parentnode" should be "DOM"');
    if (! isString(tagname)) return alert('Type Error: "tagname" should be "string"');
    var arrayNodes = [];
    for (var i = 0, nodes = parentnode.getElementsByTagName(tagname), len = nodes.length; i < len; i += 1) {
        arrayNodes[i] = nodes[i];
    }
    return arrayNodes;
}
function remove (parentnode) {
    if (! parentnode) return alert('not found "parentnode"');
    if (! isDom(parentnode)) return alert('typeof "parentnode" should be "document" or "element"');
    if (parentnode.hasChildNodes()) {
        var childs = parentnode.childNodes,
            len    = childs.length;
        for (len--; len >= 0; len--) {
            parentnode.removeChild(childs[len]);
        }
    }
}

function createElement (data) {
    //if (typeof data === 'undefined') return alert('"typeof data" is "undefined"');
    if (! data) data = '';
    if (isDom(data)) return data;
    if (isString(data) || isNumber(data)) return document.createTextNode(data);
    if (! data['tagname']) return alert('not found "data.tagname"');
    var tagname    = data['tagname'],
        attributes = data['attributes'] || {},
        childs     = data['childs']     || [],
        events     = data['events']     || [],
        _element   = document.createElement(tagname);

    for (var prop in attributes) {
        if (prop.match(/^(class|classname)$/i)) {
            _element.className = attributes[prop];
        } else {
            _element.setAttribute(prop, attributes[prop]);
        }
    }

    foreach(events, function (ev) {
        if (! 'type'     in ev) return alert('not found "type" in ev');
        if (! 'listener' in ev) return alert('not found "listener" in ev');
        addEvent(_element, ev['type'], ev['listener'], (ev['useCapture'] || false));
    });

    foreach(childs, function (child) {
        _element.appendChild(createElement(child));
    });

    return _element;
}

// style
function setOpacity (node, val) {
    if (isDom(node)) {
        var style = node.style;
        style.opacity    = val;
        style.MozOpacity = val;
        style.filter = [ 'alpha(opacity=', (val * 100), ')' ].join('');
    }
}
function fadeIn (node, pitch, interval) {
    if (isDom(node)) {
        if (! isNumber(pitch - 0)) pitch = 0.01;
        pitch = Math.abs(Number(pitch - 0));
        if (! isNumber(interval - 0)) interval = 20;

        var intervalID, start = 0;
        
        intervalID = setInterval(function () {
            if (start >= 1) clearInterval(intervalID);
            setOpacity(node, start);
            start += pitch;
        }, interval);

        return intervalID;
    }
}
function fadeOut (node, pitch, interval) {
    if (isDom(node)) {
        if (! isNumber(pitch - 0)) pitch = 0.01;
        pitch = Math.abs(Number(pitch - 0));
        if (! isNumber(interval - 0)) interval = 20;

        var intervalID, start = 1;

        intervalID = setInterval(function () {
            if (start <= 0) clearInterval(intervalID);
            setOpacity(node, start);
            start -= pitch;
        }, interval);

        return intervalID;
    }
}

function Repeat (func, interval) {
    this['func']     = func;
    this['interval'] = interval || 1000;
    return this;
}
(function (rp) {
    rp.start = function () {
                this['intervalID'] = window.setInterval(this['func'], this['interval']);
                return this;
    };
    rp.stop  = function () {
                window.clearInterval(this['intervalID']);
                delete this['intervalID'];
                return this;
    };
})(Repeat.prototype);

function Query () {}
(function () {
    QP.parse = function (queryString) {};
    QP.stringify = function (data) {
        var querys = [];
        data.forEach(function (param, i) {
            querys.push([ param[0], encodeURIComponent(param[1]) ].join('='));
        });
        return querys.join('&');
    };
})(QP = Query.prototype);

function XMLHttpClient () {
    this.request = new this.RequestClient;
}
(function (CP) {

    CP.RequestClient = function () {
        var _request;
        if (XMLHttpRequest) {
            _request = XMLHttpRequest;
        } else {
            _request = ActiveXObject("Microsoft.XMLHTTP");
        }
        return _request;
    }();

    CP.post = function (uri, headers, body, callback) {
        request.apply(this, ['POST', uri, headers, body, callback]);
        return this;
    };
    CP.get = function (uri, headers, query, callback) {
        request.apply(this, ['GET', uri, headers, query, callback]);
        return this;
    };

    var request = function (/* method, uri, headers, body, callback */) {
        var args     = AP.slice.apply(arguments),
            method   = args.shift().toUpperCase(),
            uri      = args.shift(),
            callback = args.pop(),
            headers  = args.shift() || {},
            body     = args.shift() || null
        ;

        if (!(method === 'GET' || method === 'POST')) {
            alert('method error: method should "GET" or "POST"');
            return false;
        }

        if (typeof uri !== 'function') {
            alert('typeof "uri" should be "function"');
            return false;
        }

        if (typeof callback !== 'function') {
            alert('typeof "callback" should be "function"');
            return false;
        }

        uri = uri();

        if (method === 'GET' && body) {
            uri  = join([uri, body].join('?'));
            body = null;
        }

        if (method === 'POST') {
            if (! headers['content-type'])
                headers['content-type'] = 'application/x-www-form-urlencoded';
        }

        var that     = this,
            _request = this.request;

        _request.onreadystatechange = function () {
            if (_request.readyState == 4) {
                if (_request.status == 200) {
                    callback(JSON.parse(_request.responseText));
                } else {
                    alert([ 'ERROR', _request.status, _request.statusText ].join(': '));
                    return false;
                }
            }
        };

        _request.open(method, uri, true);
        if (headers) {
            for (var prop in headers) {
                _request.setRequestHeader(prop, headers[prop]);
            }
        }
        _request.send(body);

    };
}) (XMLHttpClient.prototype);

1;

