function Effect () {
    this.init();
}
(function (ep) {
    ep.getBrowserHeight = function () {
                if (window.innerHeight) {
                    return window.innerHeight;
                }
                if (document.documentElement && document.documentElement.clientHeight != 0) {
                    return document.documentElement.clientHeight;
                }
                if (document.body) {
                    return document.body.clientHeight;
                }
                return 0;
    };
    ep.getBrowserWidth  = function () {
                 if (window.innerWidth) {
                    return window.innerWidth;
                }
                if (document.documentElement && document.documentElement.clientWidth != 0) {
                    return document.documentElement.clientWidth;
                }
                if (document.body) {
                    return document.body.clientWidth;
                }
                return 0;   
    };
    ep.setOpacity = function (node, opacityValue) {
                if (isDom(node) && node.parentNode) {
                    if (isNumber(opacityValue - 0)) {
                        opacityValue = (opacityValue < 0) ? 0
                                     : (opacityValue > 1) ? 1 : opacityValue;
                        var style = node.style;
                        style.opacity    = opacityValue;
                        style.MozOpacity = opacityValue;
                        //style.filter     = 'alpha(opacity=' + (opacityValue * 100) + ')';
                    }
                }
                return this;
    };

    ep.style  = function (node, option) {
                if (isDom(node)) {
                    var style = node.style;
                    for (var prop in option) {
                        node.setAttribute(prop, option[prop]);
                        style[prop] = option[prop];
                    }
                }

                return this;
    };

    ep.height = function (node, height) {
                if (isDom(node)) {
                    height = (isNumber(height)) ? height : this.browserHeight;
                    if (node.height) {
                        node.setAttribute('height', height + "px");
                    } else if (node.style && node.style.height) {
                        node.style.height = height + "px";
                    }

                }

                return this;
    };
    ep.centering = function (node, width) {
                if (isDom(node)) {
                    width = (isNumber(width)) ? width : this.browserWidth;
                    node.style.left = Math.round((width - node.width) / 2) + "px";
                }
                return this;
    };
    ep.fadeIn = function (node, pitch, interval) {
                if (isDom(node)) {
                    var repeat, start = 0;
                    pitch    = (pitch < 1 && pitch > 0) ? Number(pitch) : 0.25;
                    interval = (interval > 0) ? interval : 1000;

                    ep.setOpacity(node, 0);
                    node.style.visibility = 'visible';
                    node.style.zIndex     = 10;

                    repeat = new Repeat(function () {
                        if (start >= 1) {
                            repeat.stop();
                            ep.setOpacity(node, 1);
                        }
                        start += pitch;
                        ep.setOpacity(node, start);
                    }, interval).start();
                }

                return this;
    };
    ep.fadeOut = function (node, pitch, interval) {
                if (isDom(node)) {
                    var repeat, start = 1;
                    pitch    = (pitch < 1 && pitch > 0) ? Number(pitch) : 0.25;
                    interval = (interval > 0) ? interval : 1000;

                    ep.setOpacity(node, 1);

                    repeat = new Repeat(function () {
                        if (start <= 0) {
                            repeat.stop();
                            node.style.visibility = 'hidden';
                            node.style.zIndex     = 0;
                            ep.setOpacity(node, 0);
                        }
                        start -= pitch;
                        ep.setOpacity(node, start);
                    }, interval).start();
                }

                return this;
    };
    ep.init = function () {
                var that = this,
                    help = function () {
                        that['browserHeight'] = that.getBrowserHeight();
                        that['browserWidth']  = that.getBrowserWidth();
                    };

                addEvent(window, 'resize', help);

                help();

                return this;
    };

    ep.onSetUp = function (node, _on_off) {
                var _style = {
                    top      : 0,
                    position : 'fixed'
                };
                if (_on_off === 0) {
                    _style['zIndex'] = 10;
                    _style['visibility'] = 'visible';
                } else {
                    _style['zIndex'] = 0;
                    _style['visibility'] = 'hidden';
                }
                return this.style(node, _style);
    };

    ep.onFocus = function (node) {
                return this.style(node, {
                    zIndex : 10, visibility : 'visible'
                });
    };
    ep.outFocus = function (node) {
                return this.style(node, {
                    zIndex : 0, visibility : 'hidden'
                });
    };
})(Effect.prototype);


function Slide (args) {
                this.init(args);
}
(function (sp) {
    sp.init = function (args) {
                this.pages   = args['pages']  || [];
                this.effect  = args['effect'] || Effect.prototype.init();
                this.cursor  = 0;
                this.hotkeys = args['hotkeys'];

                if (this['hotkeys']) {
                    for (var cha in this['hotkeys']) {
                        this.addHotkey(cha, this['hotkeys'][cha]);
                    }
                }

                effect  = this['effect'];

                foreach(this['pages'], function (page, i) {
                    effect.onSetUp(page, i);
                });

                return this;
    };
    sp.addHotkey = function (cha, ev) {
                if (! this['kb']) this['kb'] = new Hotkey;
                this['hotkeys'][cha] = ev;
                this['kb'].add(cha, ev);
                return this;
    };
    sp.onPageClick = function (method) {
                var that = this;
                method = (method in this) ? method : 'next';
                foreach(this['pages'], function (page, i) {
                    var n = i;
                    that.addEventListener(page, 'click', function () {
                        that['cursor'] = n;
                        that[method]();
                    });
                });

                return this;
    };
    sp.paging = function (flg) {
                var pages  = this['pages'],
                    last   = this['pages'].length - 1,
                    cursor = this['cursor'];

                this['effect'].outFocus(pages[cursor]);

                this['cursor'] = (flg <= 0)
                               ? ((cursor === 0) ? last : cursor - 1)
                               : ((cursor === last) ? 0 : cursor + 1);

                this['effect'].onFocus(pages[this['cursor']]);

                return this;
    };
    sp.next = function () { return this.paging( 1); };
    sp.prev = function () { return this.paging(-1); };

    sp.autoPagingStart = function (interval) {
                var that = this;
                this['auto'] = setInterval(function () {
                    that.next();
                }, interval || 1000);

                return this;
    };
    sp.autoPagingStop = function () {
                clearInterval(this['auto']);
                delete this['auto'];

                return this;
    };

    sp.addEventListener = function (target, type, listener, useCapture) {
                addEvent(target, type, listener, useCapture);
                return this;
    };
    sp.allPagesResize = function () {
                var effect = this['effect'];
                foreach(this['pages'], function (page, i) {
                    effect.height(page).centering(page);
                });

                return this;
    };
})(Slide.prototype);


1;


