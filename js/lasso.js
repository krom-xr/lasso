
var Contur = function(data) {
    var it = this;
    this.dots = ko.observableArray();
    this.closed = false;

    this.contur = false;

    this.paper = Raphael(0,0,800,600)

     
    this.back_path = [
        ['M', 0, 0], 
        ['L', 0, 600], 
        ['L', 800, 600], 
        [800, 0, 'z']
    ];
    this.back = this.paper.path();
    this.back.attr('fill', '#fff');
    this.back.attr('opacity', 0.5)






    this.lasso_area = this.paper.rect(0,0,800,600)
    this.lasso_area.attr('fill', "#000");
    this.lasso_area.attr('opacity', '0.4');

    var lasso_area_mousdown = function(e) {
        console.log(e);
        new Dot({x: e.layerX || e.clientX, y: e.layerY||e.clientY});
    }
    this.lasso_area.mouseup(lasso_area_mousdown);

    var lasso_area_mousemove = function(e) {
        if (it.contur && !it.closed) {
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

    this.render_path = function(path) {
        if (!path) { path = this.get_path() }
        it.contur.attr('path', path);
        if (it.closed) {
            it.back.attr('path', it.back_path + path);
        };
    }

    var contur_click = function(e) {
        console.log(e);
        new Dot({x: e.layerX||e.clientX, y: e.layerY || e.clientY});
    }
    var contur_mousedown = function(e){
        $('div.dot').trigger('drag', $('div.dot'));
    }

    $(document).on('newDot', function(e, dot){
        if (!Boolean(it.dots().length)) { 
            dot.start(true);
            it.contur = it.paper.path("M" + dot.x + " " + dot.y);
            it.contur.attr('stroke', "#fff");
            it.contur.attr('stroke-width', "1");
            it.contur.attr('cursor', 'pointer');
            it.contur.click(contur_click);
            it.contur.mousedown(contur_click);
            it.contur.drag(contur_mousedown)
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
        console.log('clicked');
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
    this.stop = false;
    this.x = data.x;
    this.y = data.y;
    this.radius = 3;

    this.drag = function(e, dot) {
        console.log(dot);
        this.x = dot.offset.left + this.radius;
        this.y = dot.offset.top + this.radius;
        $(document).trigger('dotDragged');
        return true;
    }

    this.remove = function(e, dot) {
        $(document).trigger('removeDot', this);
    }

    $(document).trigger('newDot', this);


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
