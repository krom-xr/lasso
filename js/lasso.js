// объект заполнятеся при инициализации объекта Contur
var global = {
    start_point: {x: '', y: ''},
    paper_size: {w: '', h: ''},
    dot_size: 4,
    contur_closed: ko.observable(false),
}

var Dot = function(data) {
    var it = this;
    var _x = data.x;
    var _y = data.y;

    this.start = ko.observable(data.start||false);

    this.stop = data.stop||false;
    //this.x = data.x;
    //this.y = data.y;
    this.x = function(x) {
        if (!x) { return _x };
        if (x + global.start_point.x < global.start_point.x) {
            _x = 0; 
        } else if (x > global.paper_size.w) {
            _x = global.paper_size.w;
        } else {
            _x = x;
        }
    }
    this.y = function(y) {
        if (!y) { return _y };
        if (y + global.start_point.y < global.start_point.y) {
            _y = 0; 
        } else if (y > global.paper_size.h) {
            _y = global.paper_size.h;
        } else {
            _y = y;
        }
    }
    this.radius = (global.dot_size/2).toFixed();

    this.show_start_dot = function(){
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


    this.remove = function(e, dot) {
        $(document).trigger('removeDot', this);
    }

    $(document).trigger('newDot', this);

    this.toString = function(){
        return this.i;
    }
}

var Contur = function(data) {
    var it = this;
    this.data = data;
    this.dots = ko.observableArray();

    global.start_point = data.start_point;
    global.paper_size = data.paper_size;

    var get_browser_offset = function(e, axis) {
        if ($.browser.opera) { return e['offset' + axis.toUpperCase()] };
        return e['layer' + axis.toUpperCase()];
    }

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

    this.paper = Raphael(data.start_point.x, data.start_point.y, 
                         data.paper_size.w, data.paper_size.h);

    this.paper = Raphael(data.start_point.x, data.start_point.y, 
                         data.paper_size.w, data.paper_size.h);
    this.contur = this.paper.path();
    this.contur.attr('stroke', data.contur.color);
    this.contur.attr('stroke-dasharray', data.contur.dasharray);
    this.contur.attr('stroke-width', data.contur.width);
    //this.contur.attr('cursor', 'pointer');
     
    this.back = this.paper.path();
    this.back.attr('fill', data.back.color);
    this.back.attr('opacity', data.back.opacity)
    this.back.attr('stroke', 0)

    this.lasso_area = this.paper.rect(0, 0, 
                                      data.paper_size.w, data.paper_size.h);
    this.lasso_area.attr('fill', data.lasso_area.color);
    this.lasso_area.attr('opacity', data.lasso_area.opacity);

    var lasso_area_mousdown = function(e) {
        new Dot({
            x: get_browser_offset(e, 'x'),
            y: get_browser_offset(e, 'y'),
        });
    }
    this.lasso_area.click(lasso_area_mousdown);

    var lasso_area_mousemove = function(e) {
        if (it.dots().length && !global.contur_closed()) {
            it.render_path(it.get_path([
                "L", 
                get_browser_offset(e, 'x'),
                get_browser_offset(e, 'y'),
            ]));
        };
    }
    this.lasso_area.mousemove(lasso_area_mousemove);

    this.get_path = function(new_coord) {
        var path = []
        $.each(it.dots(), function(i, dot) {
            if (dot.start()) {
                path.push(['M', dot.x(), dot.y()]);
            } else if (dot.stop) {
                path.push([ dot.x(), dot.y(), 'Z']);
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
            (function() 
            {
                if (it.direction_path){ return false };
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


    $(document).on('newDot', function(e, dot){
        if (!Boolean(it.dots().length)) { 
            dot.start(true);
            it.render_path();
        }
        if (!global.contur_closed()) {
            it.dots.push(dot);
        } else {
            var old_dot = it.dots()[it.dots().length - 1];
            var index = false;
            $.each(it.dots(), function(i, _dot) {
                var a = Math.sqrt(Math.pow((dot.x() - _dot.x()), 2) + Math.pow((dot.y() - _dot.y()), 2)) + Math.sqrt(Math.pow((old_dot.x() - dot.x()), 2) + Math.pow((old_dot.y() - dot.y()), 2));
                var b = Math.sqrt(Math.pow((_dot.x() - old_dot.x()), 2) + Math.pow((_dot.y() - old_dot.y()), 2));
                if (Math.abs(a-b) < 0.1) {
                    index = i;
                    return false;
                };
                old_dot = _dot;
            })
            if (index === false) { return };
            if (index) {
                it.dots.splice(index,0,dot);
            } else {
                dot.stop = true;
                it.dots()[it.dots().length - 1].stop = false;
                it.dots.push(dot);
            };
            it.render_path();
        }

    });

    $(document).on('click', 'div.start', function() {
        if (global.contur_closed()) { return false };
        if(it.dots().length > 2) {

            it.lasso_area.unmousemove(lasso_area_mousemove);
            //it.lasso_area.unmouseup(lasso_area_mousdown);
            //it.contur.unclick(contur_click);

            //последня точка приобретает значение stop
            it.dots()[it.dots().length -1].stop = true;         
            global.contur_closed(true);
            it.render_path();

        }
    })

    $(document).on('mouseenter', 'div.dot', function() {
        var $this = $(this);
        if(!$(this).is(':data(draggable)')) {
            $(this).draggable();
        }
    })

    $(document).on('dotDragged', function(){
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

    $('.clear_all').click(function() {
        it.dots.removeAll();
        global.contur_closed(false);
        it.render_path();
        it.direction_path = false;
        it.back.attr('path', '');
        it.lasso_area.mousemove(lasso_area_mousemove);
    })


    var style = [
        ".dot{ background-color: "+ data.dot.color + "}",
        ".dot{ width: "+ data.dot.size + "px}",
        ".dot{ height: "+ data.dot.size + "px}",
        ".dot{ border_radius: "+ data.dot.border_radius + "px}",
        ".dot{ border-radius: "+ data.dot.border_radius + "px}",
        ".dot.start{ background-color: "+ data.dot.start_color + "}",
    ];
    $("<style>" + style.join('') + "</style>").appendTo('body');
    $(".dot").draggable();

    ko.applyBindings(this, $('#lasso_area').get(0));

    this.add_dots = function(dots) {
        var last_index = dots.length - 1;
        $.each(dots, function(i, dot) {
            var start = false;
            var stop = false;
            if (i == 0) { start = true };


            console.log(stop);
            var dot = new Dot({
                x: dot[0],
                y: dot[1],
                start: start,
                radius: 3,

            });
            if (i == last_index) { global.contur_closed(true) };
        });
        it.render_path();
    }
    if (data.dots) { this.add_dots(data.dots) };
    console.log(this.dots());
}
