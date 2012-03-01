function resizer (config) {
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

                        foreach(config.imgs, function (img, i) {
                            if (init) init(img, i);

                            img.setAttribute('height', _browserHeight);
                            img.style.left = Math.round((_browserWidth - img.width) / 2) + "px";
                        });

                        init = undefined;
            };
}
function pager (config) {
            var lock  = false,
                focus = 0,
                last  = config.imgs.length - 1;
            
            fade = function () {};

            return function (getNextFocus, nowFocus) {
                        if (isUndefined(nowFocus)) nowFocus = focus;

                        var now       = config.imgs[nowFocus],
                            nextFocus = getNextFocus(nowFocus, last),
                            next      = config.imgs[nextFocus];

                        if ((! lock) && now && next) {
                            var nowStyle    = now.style,
                                nextStyle   = next.style,
                                nowOpacity  = 1,
                                nextOpacity = 0,
                            
                            help = function () {
                                        setOpacity(now,  nowOpacity  -= config.pagingFade.pitch);
                                        setOpacity(next, nextOpacity += config.pagingFade.pitch);
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
                                            }, config.pagingFade.interval);
                            };

                            lock = true;

                            nextStyle.visibility = 'visible';
                            nextStyle.zIndex     = 10;

                            help();
                            fade();
                        }
            };
}

addEvent(window, 'load', function () {

var config, resise, paging, kb,
    _next, _prev, _auto;

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


resize = resizer(config);
paging = pager(config);
kb     = new Hotkey;


_next = function () {
    paging(function (now, last) {
        return (now === last) ? 0 : now + 1;
    });
};
_prev = function () {
    paging(function (now, last) {
        return (now === 0) ? last : now - 1;
    });
};
_auto = function () {
        var _on_off = false;

        return function () {
            if (_on_off) {
                clearInterval(_on_off);
                _on_off = undefined;
            } else {
                _on_off = setInterval(_next, config.autoPager.interval);
                setTimeout(_next, config.autoPager.startDelay);
            }
        };
}();



addEvent(gid('next'), 'click', _next);
addEvent(gid('prev'), 'click', _prev);
addEvent(gid('auto'), 'click', _auto);

foreach(config.imgs, function (img, i) {
    addEvent(img, 'click', function () {
        paging(function (now, last) {
            return (now === last) ? 0 : now + 1;
        }, i);
    });
});

kb.add('u', function () { document.location = gid('navi_toIndex').href; })
  .add('j', _next).add('k', _prev).add('space', _auto)
;

addEvent(window, 'resize', resize);

resize();

}, false);

1;

