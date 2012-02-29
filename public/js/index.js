function Revolver (data) {
    this.focus        = data.focus || 0;
    this.pitch        = data.pitch;
    this.dom          = _dom = data.dom;
    this.scroll       = data.scroll;
    this.dom.listLast = tags(_dom.list, 'li').length - 1;

    var that = this;
    addEvent(window, 'resize', function () { that.onResize(); });

    return this.pos(this.focus * this.pitch).onResize();
}
(function (rp) {
    rp.setBrowserWidth = function () {
                    this.browserWidth = getBrowserWidth();
                    return this;
    };
    rp.setWidth = function () {
                    var dom      = this.dom,
                        domWidth = this.browserWidth - (this.dom.widthMargin * 2);

                    foreach(qw("list focus"), function (domid) {
                        dom[domid].style.width = domWidth + "px";
                    });

                    return this;
    };
    rp.onResize = function () {
                    return this.setBrowserWidth().setWidth();
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
                                    that.pos(finish);
                                    return;
                                }
                                start = (isUp) ? (start - that.scroll.pitch) : (start + that.scroll.pitch);
                                that.pos(start);
                            }, this.scroll.interval);

                            this.focus = _focus;
                        }
                    }
                    return this;
    };
    rp.pos = function (_pos) {
                    var _dom = this.dom;

                    _pos = _pos || 0;

                    _dom.list.style.top = (_dom.defaultTop - _pos) + "px";

                    return this;
    };
    rp.onSelect = function (func) {
                    if (func && typeof func === 'function') func();
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

        (new Hotkey).add(qw('space enter'), function () {
                revolver.onSelect(function () {
                    var link = tags(revolver.dom.list, 'a')[revolver.focus];

                    link.style.color = '#ffaa33';

                    setTimeout(function () {
                        document.location = link.href;
                    }, 250);
                });
            })
            .add('j', function () { revolver.roll(1);  })
            .add('k', function () { revolver.roll(-1); })
            .add('h', function () { revolver.roll(3);  })
            .add('l', function () { revolver.roll(-3); })
            .add('g', function () { revolver.roll('top');  })
            .add('G', function () { revolver.roll('last'); })
            .add("q", function () {
                var _on_off = false;
                return function () {
                    gid('navi').style.display = (_on_off) ? 'block' : 'none';
                    _on_off = (_on_off) ? false : true;
                };
            }())
        ;

}, false);

1;

