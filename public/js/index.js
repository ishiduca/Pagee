function Revolver (data) {
    this.focus        = data.focus || 0;
    this.pitch        = data.pitch;
    this.dom          = _dom = data.dom;
    this.scroll       = data.scroll;
    this.dom.listLast = tags(_dom.list, 'li').length - 1;

    var that = this;
    addEvent(window, 'resize', function () { that.__onResize__(); });

    return this.__pos__(this.focus * this.pitch).__onResize__();
}
(function (rp) {
    rp.__setBrowserWidth__ = function () {
                    this.browserWidth = getBrowserWidth();
                    return this;
    };
    rp.__setWidth__ = function () {
                    var dom      = this.dom,
                        domWidth = this.browserWidth - (this.dom.widthMargin * 2);

                    foreach(qw('list focus'), function (domid) {
                        dom[domid].style.width = domWidth + 'px';
                    });

                    return this;
    };
    rp.__onResize__ = function () {
                    return this.__setBrowserWidth__().__setWidth__();
    };
    rp.__pos__ = function (_pos) {
                    var _dom = this.dom;

                    _pos = _pos || 0;

                    _dom.list.style.top = (_dom.defaultTop - _pos) + 'px';

                    return this;
    };

    rp.roll = function (addFocus) {
                    if (! this.scrollState) {
                        var _focus = this.focus,
                            last   = this.dom.listLast;

                        if ((/^top$/i).test(addFocus)) {
                            _focus = 0;
                        } else if ((/^last$/i).test(addFocus)) {
                            _focus = last;
                        } else {
                            _focus += addFocus;

                            if (_focus > last) _focus = last;
                            if (_focus < 0)    _focus = 0;
                        }

                        if (this.focus !== _focus) {
                            var isUp   = (this.focus > _focus) ? true : false,
                                start  = this.focus * this.pitch,
                                finish = _focus     * this.pitch,
                                that   = this;

                            this.scrollState = setInterval(function () {
                                if ((isUp) ? (start < finish) : (start > finish)) {
                                    clearInterval(that.scrollState);
                                    delete that.scrollState;
                                    that.__pos__(finish);
                                    return;
                                }
                                start = (isUp) ? (start - that.scroll.pitch) : (start + that.scroll.pitch);
                                that.__pos__(start);
                            }, this.scroll.interval);

                            this.focus = _focus;
                        }
                    }
                    return this;
    };
    rp.fire = function (func) {
                    var link = tags(this.dom.list, 'a')[this.focus];

                    if ((! isUndefined(func)) && typeof func === 'function') {
                        func(link, focus);
                    } else {
                        document.location = link.href;
                    }

                    return this;
    };
})(Revolver.prototype);


addEvent(window, 'load', function () {

        var revolver = new Revolver({
            focus : 2,
            pitch : 36,
            dom   : {
                list        : gid('main_ul'),
                focus       : gid('focus'),
                defaultTop  : (138 + 6),
                widthMargin : (24 + 6)
            },
            scroll : {
                pitch    : 6,
                interval : 20
            }
        });

        var naviPreview =  function () {
                        var _on_off = false;
                        return function () {
                            gid('navi').style.display = (_on_off) ? 'block' : 'none';
                            _on_off = (_on_off) ? false : true;
                        };
         }();

        (new Hotkey)
            .add(qw('space enter'), function () {
                revolver.fire(function (link /*, now*/) {
                        link.style.color = '#ff8800';
                        setTimeout(function () { document.location = link.href; }, 250);
                });
            })
            .add('j', function () { revolver.roll(1);  })
            .add('k', function () { revolver.roll(-1); })
            .add('h', function () { revolver.roll(3);  })
            .add('l', function () { revolver.roll(-3); })
            .add('g', function () { revolver.roll('top');  })
            .add('G', function () { revolver.roll('last'); })
            .add('q', naviPreview)
        ;

}, false);

1;

