function Revolver () {}
(function (rp) {
    rp.rewidth = function (doms, widthMargin) {
                return function () {
                            var _width = (getBrowserWidth() - (widthMargin * 2));

                            foreach(doms, function (dom) {
                                dom.style.width = _width + "px";
                            });
                };
    };
    rp.pos = function (dom, defaultTop) {
                return function (top) {
                            dom.style.top = (defaultTop - top) + "px";
                };
    };
    rp.roll = function (domList, scrollConfig, _pos) {
                var last = tags(domList, 'li').length - 1,
                    lock = false;

                return function (getNextFocus, now) {
                            if (! lock) {
                                var next = getNextFocus(last);

                                if (next < 0)    next = 0;
                                if (next > last) next = last;

                                if (now !== next) {
                                    var isUp   = (now > next) ? true : false,
                                        start  = now  * scrollConfig.size,
                                        finish = next * scrollConfig.size;

                                    lock = setInterval(function () {
                                        if ((isUp) ? (start < finish) : (start > finish)) {
                                            clearInterval(lock);
                                            lock = false;
                                            _pos(finish);
                                            return;
                                        }
                                        start = (isUp) ? (start - scrollConfig.pitch) : (start + scrollConfig.pitch);
                                        _pos(start);
                                    }, scrollConfig.interval);
                                    now = next;
                                }
                            }

                            return now;
                };
    };
    rp.fire = function (domList) {
                return function (now) {
                            var link = tags(domList, 'a')[now];

                            link.style.color = '#ffaa00';
                            setTimeout(function () {
                                document.location = link.href;
                            }, 250);
                };
    };
})(Revolver.prototype);

function setNow (_now) {
    _now = (! isNumber(_now)) ? 0 : Number(_now);

    return function (n) {
        if (! isUndefined(n)) _now = n;
        return _now;
    };
}

addEvent(window, 'load', function () {
// 変数の明示
    var config, revolver, kb, _pos, _rewidth, _roll, _fire, _focus;

// 設定
    config = {
        focus : 2,
        doms : {
            list : gid('main_ul'),
            focus : gid('focus'),
            defaultTop  : (138 + 6),
            widthMargin : ( 24 + 6)
        },
        scroll : {
            size        : 36,
            pitch       :  6,
            interval    : 25
        }
    };
// 機能を提供するコレクションの呼び出し
    revolver = new Revolver;
// 作業する関数を設定
    _focus   = setNow(config.focus);
    _pos     = revolver.pos(config.doms.list, config.doms.defaultTop);
    _roll    = revolver.roll(config.doms.list, config.scroll, _pos);
    _fire    = revolver.fire(config.doms.list);
    _rewidth = revolver.rewidth([config.doms.list, config.doms.focus], config.doms.widthMargin);

// 初期セットアップ
// domのセットアップ
    _pos(_focus() * config.scroll.size);
    _rewidth();

// イベントリスナーの作成
    kb = new Hotkey;

    kb.add(qw('space enter'), function () { _fire(_focus()); });
    kb.add('j', function () {
        _focus(_roll(function () { return _focus() + 1; }, _focus()));
    });
    kb.add('k', function () {
        _focus(_roll(function () { return _focus() - 1; }, _focus()));
    });
    kb.add('h', function () {
        _focus(_roll(function () { return _focus() + 3; }, _focus()));
    });
    kb.add('l', function () {
        _focus(_roll(function () { return _focus() - 3; }, _focus()));
    });
    kb.add('g', function () {
        _focus(_roll(function () { return 0; }, _focus()));
    });
    kb.add('G', function () {
        _focus(_roll(function (last) { return last; }, _focus()));
    });

    addEvent(window, 'resize', _rewidth);

}, false);

1;

