
var Contur = function(data) {
    var it = this;
    this.dots = ko.observableArray();
    this.closed = false;

    this.back_path_right = [
        ['M', 0, 0], 
        ['L', 0, 600], 
        ['L', 800, 600], 
        [800, 0, 'z']
    ];
    this.back_path_left= [
        ['M', 0, 0], 
        ['L', 800, 0], 
        ['L', 800, 600], 
        [0, 800, 'z']
    ];

    this.paper = Raphael(0,0,800,600)

    this.contur = this.paper.path();
    this.contur.attr('stroke', "#fff");
    this.contur.attr('stroke-dasharray', "--..");
    this.contur.attr('stroke-width', "1");
    this.contur.attr('cursor', 'pointer');
     
    this.back = this.paper.path();
    this.back.attr('fill', '#fff');
    this.back.attr('opacity', 0.5)

    this.lasso_area = this.paper.rect(0,0,800,600)
    this.lasso_area.attr('fill', "#000");
    this.lasso_area.attr('opacity', '0');

    var lasso_area_mousdown = function(e) {
        new Dot({x: e.layerX || e.clientX, y: e.layerY||e.clientY});
    }
    this.lasso_area.click(lasso_area_mousdown);

    var lasso_area_mousemove = function(e) {
        if (it.dots().length && !it.closed) {
            it.render_path(it.get_path(["L", e.layerX || e.clientX, e.layerY || e.clientY]));
        };
    }
    this.lasso_area.mousemove(lasso_area_mousemove);

    this.get_path = function(new_coord) {
        var path = []
        $.each(it.dots(), function(i, dot) {
            if (dot.start()) {
                path.push(['M', dot.x, dot.y]);
            } else if (dot.stop) {
                path.push([ dot.x, dot.y, 'Z']);
            } else {
                path.push(['L', dot.x, dot.y]);
            }
        })
        if (new_coord) { path.push(new_coord) };
        return path
    }

    this.direction_path = false;

    this.render_path = function(path) {
        if (!path) { path = this.get_path() }
        it.contur.attr('path', path);

        if (it.closed) {
            if (!this.direction_path) {
                var A = 0; B = 0; C = 0; D = 0;
                $.each(it.dots(), function(i, dot) {
                    if (!i) { A = dot; A.i = 0; B = dot; B.i = 0; C = dot; C.i = 0; D = dot; D.i = 0 };
                    if (A.x > dot.x) { A = dot; A.i = i };
                    if (B.y > dot.y) { B = dot; B.i = i };
                    if (C.x < dot.x) { C = dot; C.i = i };
                    if (D.y < dot.y) { D = dot; D.i = i };
                });

                var abcd = [A, B, C ,D];
                abcd.sort(function(a, b) {return a.i - b.i}); // сортировка по возрастанию i

                this.direction_path = it.back_path_left;
                switch(abcd.toString()) {
                    case [A, B, C ,D].toString():
                    case [B, C ,D, A].toString():
                    case [C ,D, A ,B].toString():
                    case [D, A, B, C].toString():
                        this.direction_path = it.back_path_right;
                }
            }
            it.back.attr('path', this.direction_path + path );
        };
    }

    $(document).on('newDot', function(e, dot){
        if (!Boolean(it.dots().length)) { 
            dot.start(true);
            it.render_path();
        }
        if (!it.closed) {
            it.dots.push(dot);
        } else {
            var old_dot = it.dots()[it.dots().length - 1];
            var index = false;
            $.each(it.dots(), function(i, _dot) {
                var a = Math.sqrt(Math.pow((dot.x - _dot.x), 2) + Math.pow((dot.y - _dot.y), 2)) + Math.sqrt(Math.pow((old_dot.x - dot.x), 2) + Math.pow((old_dot.y - dot.y), 2));
                var b = Math.sqrt(Math.pow((_dot.x - old_dot.x), 2) + Math.pow((_dot.y - old_dot.y), 2));
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
        if (it.closed) { return false };
        if(it.dots().length > 2) {

            it.lasso_area.unmousemove(lasso_area_mousemove);
            //it.lasso_area.unmouseup(lasso_area_mousdown);
            //it.contur.unclick(contur_click);

            //последня точка приобретает значение stop
            it.dots()[it.dots().length -1].stop = true;
            it.closed = true;
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



    ko.applyBindings(this, $('#lasso_area').get(0));


}
var Dot = function(data) {

    this.start = ko.observable(false);
    this.contur_closed = ko.observable(false);


    this.stop = false;
    this.x = data.x;
    this.y = data.y;
    this.radius = 3;

    this.show_start_dot = function(){
        return true;
    }

    this.drag = function(e, dot) {
        this.x = dot.offset.left + this.radius;
        this.y = dot.offset.top + this.radius;
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

$(document).ready(function(){
    contur = new Contur();
    // Creates circle at x = 50, y = 40, with radius 10
    //var circle = paper.path("M 140.40625 162.40625 L 140.40625 412.9375 L 415.1875 412.9375 L 415.1875 162.40625 L 140.40625 162.40625 z M 204.0625 220 L 363.65625 220 L 363.65625 360.40625 L 204.0625 360.40625 L 204.0625 220 z ");
    // Sets the fill attribute of the circle to red (#f00)
    //circle.attr("fill", "#f00");
    //circle.attr("opacity", '0.5');
    //circle.attr("stroke","#00e");
    //circle.attr("stroke-width","8");

    //circle.click(function(){
        //alert('fffuuuu');
    //})

    // Sets the stroke attribute of the circle to white
    //circle.attr("stroke", "#fff");













    $(".dot").draggable();
});
