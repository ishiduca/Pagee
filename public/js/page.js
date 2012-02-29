addEvent(window, 'load', function () {
    var focus = 0,
        imgs  = tags(gid('main_ul'), 'img'),
        last  = imgs.length - 1,
        pagingFadeInterval = 25,
        pagingFadePitch    = .05;

    var paging = function () {
                var guard = false;

                return function (now, next) {
                        if (guard === false && now && next) {
                                var nowStyle    = now.style,
                                    nextStyle   = next.style,
                                    nowOpacity  = 1,
                                    nextOpacity = 0,

                                help = function () {
                                    setOpacity(now,  nowOpacity  -= pagingFadePitch);
                                    setOpacity(next, nextOpacity += pagingFadePitch);
                                },

                                fade = function () {
                                    var intervalID = setInterval(function () {
                                        if (nowOpacity < 0) {
                                            setOpacity(now,  0);
                                            setOpacity(next, 1);

                                            nowStyle.visibility  = 'hidden';
                                            nowStyle.zIndex      = 1;

                                            clearInterval(intervalID);

                                            guard = false;
                                            //fade  = undefined;
                                        }
                                        help();
                                    }, pagingFadeInterval);
                                };

                                guard = true;

                                nextStyle.visibility = 'visible';
                                nextStyle.zIndex     = 10;

                                help();
                                fade();

                                return true;
                        }
                        return false;
                };
    }();

    var imgsInit = function (img, i) {
        var style        = img.style;
        style.position   = 'fixed';
        style.top        = 0;
        style.zIndex     = (i === 0) ? 10 : 1;
        style.visibility = (i === 0) ? 'visibility' : 'hidden';

        addEvent(img, 'click', function (n) {
            return function () {
                if (paging(img, imgs[ (n === last) ? 0 : n + 1 ])) {
                    focus = (n === last) ? 0 : n + 1;
                }
            };        
        }(i));
    };

    var _windowOnResize = function () {
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
        if (paging(imgs[focus], imgs[ (focus === last) ? 0 : focus + 1 ])) {
            focus = (focus === last) ? 0 : focus + 1;
        }
    };
    var pagingPrev = function () {
        if (paging(imgs[focus], imgs[ (focus === 0) ? last : focus - 1 ])) {
            focus = (focus === 0) ? last : focus - 1;
        }
    };
    var autoPaging = function () {
        var _on_off;
        return function () {
            if (_on_off) {
                clearInterval(_on_off);
                _on_off = undefined;
            } else {
                _on_off = setInterval(pagingNext, 2000);
                setTimeout(pagingNext, 250);
            }
        };
    }();

    var kb = new Hotkey;

    kb.add('j', pagingNext).add('k', pagingPrev).add('space', autoPaging).add('u', function () { document.location = '/'; });

    addEvent(gid('prev'), 'click', pagingPrev);
    addEvent(gid('next'), 'click', pagingNext);
    addEvent(gid('auto'), 'click', autoPaging);
    addEvent(window, 'resize', _windowOnResize);

    _windowOnResize();

}, false);

1;

