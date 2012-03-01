addEvent(window, 'load', function () {
    var config = {
        imgs       : tags(gid('main_ul'), 'img'),
        pagingFade : {
            interval : 25,
            pitch    : .05
        },
        autoPager  : {
            interval : 2200,
            delay    : 250
        }
    };

    var paging = function (imgs, pagingFade) {
            var lock  = false,
                focus = 0,
                last  = imgs.length - 1;

            return function (getNextFocus, nowFocus) {
                    if (isUndefined(nowFocus)) nowFocus = focus;

                    var now       = imgs[nowFocus],
                        nextFocus = getNextFocus(nowFocus, last),
                        next      = imgs[nextFocus];

                    if (lock === false && now && next) {
                            var nowStyle    = now.style,
                                nextStyle   = next.style,
                                nowOpacity  = 1,
                                nextOpacity = 0,

                            help = function () {
                                setOpacity(now,  nowOpacity  -= pagingFade.pitch);
                                setOpacity(next, nextOpacity += pagingFade.pitch);
                            },

                            fade = function () {
                                var intervalID = setInterval(function () {
                                    if (nowOpacity < 0) {
                                        setOpacity(now,  0);
                                        setOpacity(next, 1);

                                        nowStyle.visibility  = 'hidden';
                                        nowStyle.zIndex      = 1;

                                        clearInterval(intervalID);

                                        lock = false;
                                        focus = nextFocus;
                                        //fade  = undefined;
                                    }
                                    help();
                                }, pagingFade.interval);
                            };

                            lock = true;

                            nextStyle.visibility = 'visible';
                            nextStyle.zIndex     = 10;

                            help();
                            fade();
                    }
            };

    }(config.imgs, config.pagingFade);

    var imgsInit = function (img, i) {
        var style        = img.style;
        style.position   = 'fixed';
        style.top        = 0;
        style.zIndex     = (i === 0) ? 10 : 1;
        style.visibility = (i === 0) ? 'visibility' : 'hidden';

        addEvent(img, 'click', function () {
            paging(function (now, last) {
                return (now === last) ? 0 : now + 1;
            }, i);
        });
    };

    var _windowOnResize = function (imgs) {
        var _browserHeight = getBrowserHeight(),
            _browserWidth  = getBrowserWidth();

        foreach(imgs, function (img, i) {
            if (imgsInit) imgsInit(img, i);
            img.setAttribute('height', _browserHeight + 'px');
            img.style.left = Math.round((_browserWidth - img.width) / 2) + "px";
        });

        imgsInit = undefined;
    };

    var pagingNext = function () {
        paging(function (now, last) {
            return (now === last) ? 0 : now + 1;
        });
    };
    var pagingPrev = function () {
        paging(function (now, last) {
            return (now === 0) ? now = last : now - 1;
        });
    };
    var autoPaging = function (setting) {
        var _on_off;
        return function () {
            if (_on_off) {
                clearInterval(_on_off);
                _on_off = undefined;
            } else {
                _on_off = setInterval(pagingNext, setting.interval);
                setTimeout(pagingNext, setting.delay);
            }
        };
    }(config.autoPager);

    var kb = new Hotkey;

    kb.add('j', pagingNext).add('k', pagingPrev).add('space', autoPaging)
      .add('u', function () { document.location = gid('navi_toIndex').href; });

    addEvent(gid('prev'), 'click', pagingPrev);
    addEvent(gid('next'), 'click', pagingNext);
    addEvent(gid('auto'), 'click', autoPaging);
    addEvent(window, 'resize',function () { _windowOnResize(config.imgs); });

    _windowOnResize(config.imgs);

}, false);

1;

