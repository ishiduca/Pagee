addEvent(window, 'load', function () {
    var fade, slide,
        _next, _prev, _auto;
    
    fade  = new Effect;

    fade.onFocus = function (node) {
                    fade.fadeIn(node, 0.05, 20);
                    return this;
    };
    fade.outFocus = function (node) {
                    fade.fadeOut(node, 0.05, 20);
                    return this;
    };

    _next = function () { slide.next(); };
    _prev = function () { slide.prev(); };
    _auto = function () {
        if ('auto' in slide) {
            slide.autoPagingStop();
        } else {
            slide.autoPagingStart(2000);
        }
    };
    _toIndex = function () { document.location = '/'; };

    slide = new Slide({
        pages  : tags(gid('main_ul'), 'img'),
        effect : fade,

        hotkeys : {
            "j"     : _next,
            "left"  : _next,
            "k"     : _prev,
            "right" : _prev,
            'space' : _auto,
            "u"     : _toIndex,
        }
    });

    slide.addEventListener(window,      'resize', function () { slide.allPagesResize(); })
         .addEventListener(gid('next'), 'click',  _next)
         .addEventListener(gid('prev'), 'click',  _prev)
         .addEventListener(gid('auto'), 'click',  _auto)
         .addEventListener(gid('navi_toIndex'), 'click',  _toIndex)
         .onPageClick('next') 
         .allPagesResize()

    ;

}, false);
