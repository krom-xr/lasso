// объект заполнятеся при инициализации объекта Contur
var global = {
    AJAX_PATH: "http://thestore.ru/fitting_room/faces/51/lasso_preview/",
    start_point: {x: 0, y: 0},
    paper_size: {w: '', h: ''},
    dot_size: 4,
    _contur_closed: ko.observable(false),
    contur_closed: function(value) {
        if (typeof value != 'undefined') {
            global._contur_closed(value);
        }
        if (value === true) { $(document).trigger('conturClosed') };
        if (value === false) { $(document).trigger('conturUnclosed') };
        
        return global._contur_closed();
    },
}

var Dot = function(data) {
    this.test = ko.observable(false);
    var it = this;
    var _x = ko.observable(data.x);
    var _y = ko.observable(data.y);
    this.data = data;
    this.start = ko.observable(data.start||false);

    this.stop = data.stop||false;
    //this.x = data.x;
    //this.y = data.y;
    this.x = function(x) {
        if (!x) { return _x() };
        if (x + global.start_point.x < global.start_point.x) {
            _x(0); 
        } else if (x > global.paper_size.w) {
            _x(global.paper_size.w);
        } else {
            _x(x);
        }
    }
    this.y = function(y) {
        if (!y) { return _y() };
        if (y + global.start_point.y < global.start_point.y) {
            _y(0); 
        } else if (y > global.paper_size.h) {
            _y(global.paper_size.h);
        } else {
            _y(y);
        }
    }
    this.radius = (global.dot_size/2).toFixed();

    this.show_start_dot = function() {
        return this.start() && !global.contur_closed();
    }

    this.drag = function(e, dot) {
        this.x(parseInt(dot.position.left) + parseInt(this.radius));
        this.y(parseInt(dot.position.top) + parseInt(this.radius));
        if (dot.position.left < this.x() || dot.position.left > this.x()) 
            { dot.position.left = this.x() - this.radius };
        if (dot.position.top < this.y() || dot.position.top > this.y()) 
            { dot.position.top = this.y() - this.radius };
        $(document).trigger('dotDragged');
        return true;
    }

    this.mouseup = function() {
        $(document).trigger('previewUpdate');
    }


    this.remove = function(e, dot) {
        $(document).trigger('removeDot', this);
    }

    $(document).trigger('newDot', this);

    this.toString = function() { return this.i };
}

ko.bindingHandlers.getDomEl = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor();
        value(element)
    },
}


var Contur = function(data) {
    var it = this;
    this.data = data;
    this.dots = ko.observableArray();

    //global.start_point = data.start_point;
    global.paper_size = data.paper_size;

    var get_browser_offset = function(e, axis) {
        if ($.browser.opera) { return e['offset' + axis.toUpperCase()] };
        return e['layer' + axis.toUpperCase()];
    }

    this.image_url = ko.observable(data.image_url);

    this.back_path_right = [
        ['M', data.start_point.x, data.start_point.y], 
        ['L', data.start_point.x, data.start_point.y + data.paper_size.h], 
        ['L', data.start_point.x + data.paper_size.w, data.start_point.y + data.paper_size.h], 
        [data.start_point.x + data.paper_size.w, data.start_point.y , 'z']
    ];
    this.back_path_left= [
        ['M', data.start_point.x, data.start_point.y], 
        ['L', data.start_point.x + data.paper_size.w, data.start_point.y], 
        ['L', data.start_point.x + data.paper_size.w, data.start_point.y + data.paper_size.h], 
        [data.start_point.x, data.start_point.y + data.paper_size.h, 'z']
    ];
    this.back_path_right = [
        ['M', 0, 0], 
        ['L', 0, data.paper_size.h], 
        ['L', data.paper_size.w, data.paper_size.h], 
        [data.paper_size.w, 0, 'z']
    ];
    this.back_path_left= [
        ['M', 0, 0], 
        ['L', data.paper_size.w, 0], 
        ['L', data.paper_size.w, data.paper_size.h], 
        [0, data.paper_size.h, 'z']
    ];

    this.setStartPoint = function(element) {
        $(it.paper.canvas).css('left', $(element).offset().left + 'px');
        $(it.paper.canvas).css('top',  $(element).offset().top + 'px');
    }


    this.paper = Raphael(data.start_point.x, data.start_point.y, 
                         data.paper_size.w, data.paper_size.h);

    //this.paper = Raphael(50, 50, 
                         //data.paper_size.w, data.paper_size.h);
    //this.paper = Raphael();
     
    this.back = this.paper.path();
    this.back.attr('fill', data.back.color);
    this.back.attr('opacity', data.back.opacity)
    this.back.attr('stroke', 0)

    this.lasso_area = this.paper.rect(0, 0, 
                                      data.paper_size.w, data.paper_size.h);
    this.lasso_area.attr('fill', data.lasso_area.color || "black");
    this.lasso_area.attr('opacity', data.lasso_area.opacity);


    this.contur = this.paper.path();
    this.contur.attr('stroke', data.contur.color);
    this.contur.attr('stroke-dasharray', data.contur.dasharray);
    this.contur.attr('stroke-width', data.contur.width);
    this.contur.attr('fill', 'black');
    this.contur.attr('fill-opacity', 0);



    this.contur.hover(
        function() {
            this.attr('cursor', 'pointer');
        },
        function() {
        }
    );

    var lasso_area_mousdown = function(e) {
        new Dot({
            x: get_browser_offset(e, 'x'),
            y: get_browser_offset(e, 'y'),
        });
    }
    this.lasso_area.mousedown(lasso_area_mousdown);
    this.contur.mousedown(lasso_area_mousdown);

    /* драгндроп для контура */
    var _temporary = Array(); //ko.observableArray();
    var _x = false;
    var _y = false;
    var _can_move = false;
    this.dragContur = function(x, y, a, b, e) {
        var delay = 40;
        if (!global.contur_closed()) { return false };
        if (!global.contur_closed()) { return false };
        if(!_can_move) {
            if (Math.abs(_x - e.clientX) > delay || Math.abs(_y - e.clientY) > delay) { _can_move = true };
        }
        if (!_can_move) { return false };
        $.each(it.dots(), function(i, dot) {
            var newx = _temporary[i].x + x;
            var newy = _temporary[i].y + y;
            dot.x(newx);
            dot.y(newy);
        });
        it.render_path();
    }
    this.startDragContur = function(_,_,e) {
        if (!global.contur_closed()) { return false };
        _x = e.clientX;
        _y = e.clientY;

        $.each(it.dots(), function(i, dot) {
            _temporary.push({x: dot.x(), y: dot.y()});
        })
    }
    this.stopDragContur = function() {
        if (!global.contur_closed()) { return false };
        _x = false;
        _y = false;
        _can_move = false;
        _temporary = Array();//([]);
        $(document).trigger('previewUpdate');
    }
    this.contur.drag(this.dragContur, this.startDragContur, this.stopDragContur);
    /* end драгндроп для контура */


    var lasso_area_mousemove = function(e) {
        if (it.dots().length && !global.contur_closed()) {
            it.render_path(it.get_path([
                "L", 
                get_browser_offset(e, 'x'),
                get_browser_offset(e, 'y'),
            ]));
        };
        if (it.dots().length && global.contur_closed()) {
            var l_a = this;
            //l_a.attr('cursor', 'default');
            var x = get_browser_offset(e, 'x');
            var y = get_browser_offset(e, 'y');

            if(it.between(x, y, 5)) {
                l_a.attr('cursor', 'pointer');
            } else {
                l_a.attr('cursor', 'default');
            }
        }
    }
    this.lasso_area.mousemove(lasso_area_mousemove);

    this.between = function(x, y, assumption) {
        var old_dot = it.dots()[it.dots().length - 1];
        var index = false;
        $.each(it.dots(), function(i, _dot) {
            if (belongs_to_segment({x: _dot.x(), y: _dot.y()}, {x: old_dot.x(), y: old_dot.y()}, {x: x, y: y}, assumption)) {
                index = i;
                return false;
            };
            old_dot = _dot;
        })
        if (index === false) { return false };
        if (index === 0) { return it.dots().length };
        return index;
    }

    this.get_path = function(new_coord) {
        var path = []
        $.each(it.dots(), function(i, dot) {
            if (dot.start()) {
                path.push(['M', dot.x(), dot.y()]);
            } else if (dot.stop) {
                path.push(['L', dot.x(), dot.y()]);
                path.push(['Z']);
            } else {
                path.push(['L', dot.x(), dot.y()]);
            }
        })
        if (new_coord) { path.push(new_coord) };
        return path
    }


    this.direction_path = false;


    this.render_path = function(path) {
        if (!path) { path = this.get_path() }
        this.contur.attr('path', path);


        if (global.contur_closed()) {
            // эта функция определяет замкнут контур: по часовой или против.
            // если сумма sum больше 0 то по, иначе - против
            (function() {
                if (it.direction_path) { return false };
                    var sum = 0;
                    var first_dot = 0;
                    var last_index = it.dots().length - 1;
                    $.each(it.dots(), function(i, dot) {
                        if (i==0) { first_dot = dot };
                        if (i!=last_index) {
                            sum = sum + (it.dots()[i+1].x() - dot.x())*(it.dots()[i+1].y() + dot.y());
                        } else {
                            sum = sum + (first_dot.x() - dot.x())*(first_dot.y() + dot.y());
                        }
                    })
                    if (sum > 0) {
                        it.direction_path = it.back_path_left;
                    } else {
                        it.direction_path = it.back_path_right;
                    }
            })();
            it.back.attr('path', this.direction_path + path );
        };
    }

    $(document).on('previewUpdate', function() {
        if (!global.contur_closed()) { return false };
        it.getPreview();
    })

    this.getPoints = function() {
        var points = Array();
        $.each(it.dots(), function(i, dot) {
            points.push(dot.x() + ',' + dot.y());
        });
        return points.join(',') ;
    }
    this.preview = ko.observable(true);
    this.getPreview = function() {
        $.ajax({
            url: global.AJAX_PATH + '?jsoncallback=?',
            dataType: 'json',
            data: {
                points: it.getPoints(),
            },
            complete: function(data) {
            },
            success: function(data){
                it.preview("http://thestore.ru" + data.cropped_url + '?' + Math.random());
            }
        })
    }

    this.increase = function() {
        if(!global.contur_closed()) { return false };
        $.each(it.dots(), function(i, dot) {
            dot.x(dot.x() * 1.01);
            dot.y(dot.y() * 1.01);
        })
        it.render_path();
    }

    this.decrease = function() {
        if(!global.contur_closed()) { return false };
        $.each(it.dots(), function(i, dot) {
            dot.x(dot.x()*0.99);
            dot.y(dot.y()*0.99 );
        })
        it.render_path();
    }

    this.nextStep = function() {
        if (!global.contur_closed()) { return false };
        return true;
    }

    $(document).on('newDot', function(e, dot) {
        if (!Boolean(it.dots().length)) { 
            dot.start(true);
            it.render_path();
        }
        if (!global.contur_closed()) {
            it.dots.push(dot);
        } else {
            var index = it.between(dot.x(), dot.y(), 5);
            if (!index) { return };
            if (index == it.dots().length) {
                dot.stop = true;
                it.dots()[it.dots().length - 1].stop = false;
                it.dots.push(dot);
            } else {
                it.dots.splice(index, 0, dot);
            };
            it.render_path();
        };
    });

    $(document).on('click', it.data.selectors.start, function() {
        if (global.contur_closed()) { return false };
        if(it.dots().length > 2) {
            //последня точка приобретает значение stop
            it.dots()[it.dots().length -1].stop = true;         
            global.contur_closed(true);
            it.render_path();
            $(document).trigger('previewUpdate');
        }
    })

    $(document).on('mouseenter', it.data.selectors.dot, function() {
        var $this = $(this);
        if(!$(this).is(':data(draggable)')) {
            $(this).draggable();
        }
    })

    $(document).on('dotDragged', function() {
        it.render_path();
    });

    $(document).on('removeDot', function(e, dot) {
        if (it.dots().length < 4) { return false };
        var dot = dot;
        it.dots.remove(dot);
        if (dot.start()) {
            it.dots()[0].start(true); 
        } 
        if (dot.stop) {
            it.dots()[it.dots().length - 1].stop = true;
        }
        it.render_path();
    })


    $('.clearall').click(function() {
        it.dots.removeAll();
        global.contur_closed(false);
        it.direction_path = false;
        it.back.attr('path', '');
        //it.lasso_area.mousemove(lasso_area_mousemove);
        it.render_path();
        return false;
    })


    var dot = it.data.selectors.dot;
    var style = [
        it.data.selectors.dot + "{ background-color: "+ data.dot.color + "}",
        it.data.selectors.dot + "{ width: "+ data.dot.size + "px}",
        it.data.selectors.dot + "{ height: "+ data.dot.size + "px}",
        it.data.selectors.dot + "{ border_radius: "+ data.dot.border_radius + "px}",
        it.data.selectors.dot + "{ border-radius: "+ data.dot.border_radius + "px}",
        it.data.selectors.start + "{ background-color: "+ data.dot.start_color + "}",
    ];
    $("<style>" + style.join('') + "</style>").appendTo('body');
    $(it.data.selectors.dot).draggable();

    ko.applyBindings(this, $(it.data.selectors.lasso_area).get(0));

    this.add_dots = function(dots) {
        var last_index = dots.length - 1;
        $.each(dots, function(i, dot) {
            var start = false;
            var stop = false;
            if (i == 0) { start = true };
            if (i == last_index) { stop = true };

            var dot = new Dot({
                x: dot[0],
                y: dot[1],
                start: start,
                stop: stop,
                radius: 3,

            });
            if (i == last_index) { global.contur_closed(true) };
        });
        it.render_path();
        $(document).trigger('previewUpdate');
    }
    if (data.dots) { this.add_dots(data.dots) };
}
