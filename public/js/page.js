function Pager () {}
(function (pp) {
    pp.resize = function (imgs) {
            var init = function (img, i) {
                        var style = img.style;

                        style.position   = 'fixed';
                        style.top        = 0;
                        style.zIndex     = (i === 0) ? 10 : 0;
                        style.visibility = (i === 0) ? 'visible' : 'hidden';
            };

            return function () {
                        var _browserHeight = getBrowserHeight(),
                            _browserWidth  = getBrowserWidth();
     
                        foreach(imgs, function (img, i) {
                            if (init) init(img, i);
     
                            img.setAttribute('height', _browserHeight);
                            img.style.left = Math.round((_browserWidth - img.width) / 2) + "px";
                        });
     
                        init = undefined;
            };
    };
    pp.paging = function (imgs, fadeConfig) {
            var lock  = false,
                focus = 0,
                last  = imgs.length - 1;
            
            return function (getNextFocus, nowFocus) {
                        if (isUndefined(nowFocus)) nowFocus = focus;

                        var now       = imgs[nowFocus],
                            nextFocus = getNextFocus(nowFocus, last),
                            next      = imgs[nextFocus];

                        if ((! lock) && now && next) {
                            var nowStyle    = now.style,
                                nextStyle   = next.style,
                                nowOpacity  = 1,
                                nextOpacity = 0,
                            
                            help = function () {
                                        setOpacity(now,  nowOpacity  -= fadeConfig.pitch);
                                        setOpacity(next, nextOpacity += fadeConfig.pitch);
                            },
                        
                            fade = function () {
                                        var intervalID = setInterval(function () {
                                                    if (nowOpacity < 0) {
                                                        setOpacity(now,  0);
                                                        setOpacity(next, 1);

                                                        nowStyle.visibility = 'hidden';
                                                        nowStyle.zIndex     = 0;

                                                        clearInterval(intervalID);

                                                        lock = false;
                                                        focus = nextFocus;
                                                    }

                                                    help();
                                            }, fadeConfig.interval);
                            };

                            lock = true;

                            nextStyle.visibility = 'visible';
                            nextStyle.zIndex     = 10;

                            help();
                            fade();
                        }
            };

    };
    pp.autoPaging = function (func, autoPagerConfig) {
            var _on_off = false;

            return function () {
                if (_on_off) {
                    clearInterval(_on_off);
                    _on_off = undefined;
                } else {
                    setTimeout(function () {
                        func();
                        _on_off = setInterval(func, autoPagerConfig.interval);
                    }, autoPagerConfig.startDelay);
                }
            };

    };
})(Pager.prototype);


addEvent(window, 'load', function () {

    var config, pager, kb, _resize, _paging, _next, _prev, _auto;

    config = {
        imgs       : tags(gid('main_ul'), 'img'),
        pagingFade : {
            interval   : 25,
            pitch      : .05
        },
        autoPager  : {
            interval   : 2200,
            startDelay : 250
        }
    };

    pager = new Pager;

    _resize = pager.resize(config.imgs);
    _paging = pager.paging(config.imgs, config.pagingFade);

    _next = function () {
        _paging(function (now, last) {
            return (now === last) ? 0 : now + 1;
        });
    };
    _prev = function () {
        _paging(function (now, last) {
            return (now === 0) ? last : now - 1;
        });
    };

    _auto = pager.autoPaging(_next, config.autoPager);


    kb = new Hotkey;

    kb.add('u', function () { document.location = gid('navi_toIndex').href; });
    kb.add('j', _next);
    kb.add('k', _prev);
    kb.add(qw('space enter'), _auto);

    foreach(config.imgs, function (img, i) {
        addEvent(img, 'click', function () {
            _paging(function (now, last) {
                return (now === last) ? 0 : now + 1;
            }, i);
        });
    });

    addEvent(gid('next'), 'click', _next);
    addEvent(gid('prev'), 'click', _prev);
    addEvent(gid('auto'), 'click', _auto);
    addEvent(window, 'resize', _resize);

    _resize();

}, false);

1;

