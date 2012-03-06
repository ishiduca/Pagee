// MVC model で強引に当てはめてみると
// Model:      Focus
// View:       Revolver
// Controller: Hotkey, addEvent

function RevolverTools () {}
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
    rp.roll = function (scrollConfig, _pos) {
                var lock = false;

                return function (now, next) {
                            if ((! lock) && now !== next) {
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

                            return now;
                };
    };
    rp.fire = function (domList) {
                return function (now) {
                            var link = tags(domList, 'a')[now];

                            link.style.color = '#ff5500';
                            setTimeout(function () {
                                document.location = link.href;
                            }, 250);
                };
    };
})(RevolverTools.prototype);

function setFocus (_now, _first, _last) {
    _now   = (! isNumber(_now))   ? 0         : Number(_now);
    _first = (! isNumber(_first)) ? undefined : Number(_first);
    _last  = (! isNumber(_last))  ? undefined : Number(_last);

    return function (f) {
        if (f && typeof f === 'function') {
            var buf = f(_now, _first, _last);
            if (isNumber(buf)) _now = Number(buf);
        }

        if (isNumber(_first) && _now < _first) _now = _first;
        if (isNumber(_last)  && _now > _last)  _now = _last;

        //console.log(_now);
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
    revolver = new RevolverTools;
// 作業する関数を設定
    _focus   = setFocus(config.focus, 0, (tags(config.doms.list, 'li').length - 1));

    _focus.inc = function (n) {
            return this(function (now, start, last) {
                return (n === 'LAST')  ? last
                     : (n === 'START') ? start
                     : (isNumber(n))   ? (now + Number(n))
                     :                   (now + 1);
            });
    };

    _pos     = revolver.pos(config.doms.list, config.doms.defaultTop);
    _roll    = revolver.roll(config.scroll, _pos);
    _fire    = revolver.fire(config.doms.list);
    _rewidth = revolver.rewidth([config.doms.list, config.doms.focus], config.doms.widthMargin);

// 初期セットアップ
// domのセットアップ
    _pos(_focus() * config.scroll.size);
    _rewidth();

// イベントリスナーの作成
    kb = new Hotkey;

    kb.add(qw('space enter'), function () { _fire(_focus()); });

    foreach([['j', 1 ], [ 'k', -1 ], [ 'h',  3 ], [ 'l', -3 ], [ 'g', 'START' ], [ 'G', 'LAST' ]], function (arg) {
        kb.add(arg[0], function () { _roll(_focus(), _focus.inc(arg[1])); });
    });

    addEvent(window, 'resize', _rewidth);

}, false);

1;

