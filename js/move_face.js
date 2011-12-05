
    // y=kx+b
    var find_k_b = function(A, B) {
        A.x = parseInt(A.x);
        A.y = parseInt(A.y);
        B.x = parseInt(B.x);
        B.y = parseInt(B.y);

        var k = (A.y - B.y)/(A.x - B.x);
        var b = B.y - k*B.x;
        return {k: k, b: b};
    }

    // C{b, k} - из уравнения y=kx+b
    // A - центр окружности  
    // R - радиус
    var find_x_y = function(C, A, R) {
        // при решении комплекса уравнение пришли к старшному квадратичному уравнениею. выделим его части
        var a = 1 + C.k * C.k;
        var b = 2*C.k*(C.b - A.y) - 2*A.x;
        var c = A.x*A.x + (C.b - A.y)*(C.b - A.y) - R*R;
        var D = Math.sqrt(b*b - 4*a*c);
        var x1 = (-b + D)/(2*a);
        var y1 = C.k*x1 + C.b;
        var x2 = (-b - D)/(2*a);
        var y2 = C.k*x2 + C.b;
        return {x1: x1, y1: y1, x2: x2, y2: y2};
    }

    //O центр координат
    //B позиция мыши
    //R - Radius
    var rotation = function (O, B, R) {
        var k_b = find_k_b({x: O.x, y: O.y}, {x: B.x, y: B.y});
        var x_y = find_x_y(k_b, {x:O.x, y:O.y}, R);
        if (B.x > O.x) {
            return {x: x_y.x1, y: x_y.y1, k: k_b.k, b: k_b.b, l: true};
        } else {
            return {x: x_y.x2, y: x_y.y2, k: k_b.k, b: k_b.b, r: true};
        };
    }

var MoveFace = function(data) {
    var it = this;
    this.data = data;

    $(data.selectors.main).css('background-image', 'url(' + data.maneken_url + ')');
    $(data.selectors.face_img).attr('src', data.face.url);
    $(data.selectors.face_img).attr('width', data.face.w);
    $(data.selectors.face_img).attr('height', data.face.h);

    var flip = 1;
    var angle = 0;

    var transform = function() {
        var transform = "scaleX(" + flip + ") rotate(" + flip*angle + "deg)";
        switch(true) {
            case $.browser.mozilla:
                //$(it.data.selectors.face_img).css('-moz-transform', transform);
                $("#test").css('-moz-transform', transform);
                break;
            case $.browser.opera:
                $(it.data.selectors.face_img).css('-o-transform', transform);
                break;
            case $.browser.webkit:
                $(it.data.selectors.face_img).css('-webkit-transform', transform);
                break;
            case $.browser.msie:
                $(it.data.selectors.face_img).css('-ms-transform', transform);
                break;
            default:
                $(it.data.selectors.face_img).css('transform', transform);
        }
    }

    $(it.data.selectors.face_holder).draggable({drag: it.drag});
    this.drag = function(e, data) {
        if (data.position.left > it.data.area.w - $(this).width()) { data.position.left = it.data.area.w - $(this).width() };
        if (data.position.left < 0) { data.position.left = 0 };

        if (data.position.top > it.data.area.h - $(this).height()) { data.position.top = it.data.area.h - $(this).height() };
        if (data.position.top < 0) { data.position.top = 0 };
    }

    $(it.data.selectors.face_holder).resizable({
        aspectRatio: true,
        maxWidth: it.data.restrict.max,
        minWidth: it.data.restrict.min,
        alsoResize: it.data.selectors.face_img,
        resize: function() {
            $(it.data.selectors.rotate_view).trigger('drag');
        }
    });


    $(it.data.selectors.flip).click(function() {
        flip = (flip == 1)? -1 : 1;
        transform();
    });
    $(it.data.selectors.rotate).slider({
        value: 0,
        min: -180,
        max: 180,
        step: 5,
    });
    //$(it.data.selectors.rotate).on('slide', function(e, _angle) {
        //$(it.data.selectors.rotate_view).text(_angle.value)
        //angle = _angle.value;
        //transform();
    //})
    $(it.data.selectors.rotate_view).draggable({
        //handle: 'b',
        start: function(e, data) {
            //console.log(data.position.left);
            //console.log(data.position.top);
            //$(this).detach();
            //$(this).prependTo('#face');

        },
        drag: function(e, data) {
            //data = $(this);
            //console.log($(this));
            //console.log($(this));
            //console.log(data);
            var R = $(it.data.selectors.face_holder).height()/2;
            var O = {}
            O.x = $(it.data.selectors.face_holder).width()/2;
            O.y = $(it.data.selectors.face_holder).height()/2;
            var x_y = rotation(O, {x: data.position.left, y: data.position.top}, R + 20);

            if (x_y.l) {
                angle = Math.atan(x_y.k)*57 + 90;
            } else if(x_y.r){
                angle = Math.atan(x_y.k)*57 - 90;
            }
            transform();

            //data.position.left = x_y.x;
            //data.position.top = x_y.y;
            //$(this).css('left', x_y.x + 'px');
            //$(this).css('top', x_y.y + 'px');

            //$(this).css('left', '0px');
            //$(this).css('top', '0px');
            //data.position.left = 0;//x_y.x;
            //data.position.top = 0;//x_y.y;
            //return false;
        },
        stop: function(e, data){
            console.log($('#test2').offset());
            //console.log(data);
            //$(this).appendTo($('#test2 b'));
            //$(this).css('left', 'auto');
            //$(this).css('top', 'auto');
            //console.log($('#test2 b').offset().left);
            //console.log($('#test2 b'));

            //data.offset.left = $('#test2 b').position().left;
            //data.offset.top = $('#test2 b').position().top;
            //$(it.data.selectors.rotate_view).css('left', $('#test2 b').offset().left + 'px');
            //$(it.data.selectors.rotate_view).css('top', $('#test2 b').offset().top + 'px');
        },
        //revert: true,

    });

    $("#test2 b").mouseover(function(e, data){
        $(it.data.selectors.rotate_view).css('left', e.clientX - $('#maneken').position().left - 8 + 'px');
        $(it.data.selectors.rotate_view).css('top', e.clientY - $('#maneken').position().top - 8 + 'px');
    })

    //$(it.data.selectors.rotate_view).css('left', $('#test2 b').position().left + 'px');
    //$(it.data.selectors.rotate_view).css('top', $('#test2 b').position().top + 'px');
    //console.log($('#test2 b').position().top);

    //var old_x = 0;
    //var old_y = 0;
    //$('#test').draggable();
    //$('#test').bind('drag', function(e, data){
        //var offset = '';
        //if(!old_x) { old_x = data.offset.left };
        //if(!old_y) { old_y = data.offset.top};
        //if ((data.offset.left < old_x)&&(data.offset.top < old_y)) { offset = 'xy' };
        //if ((data.offset.left < old_x)&&(data.offset.top > old_y)) { offset = 'xY' };
        //if ((data.offset.left > old_x)&&(data.offset.top < old_y)) { offset = 'Xy' };
        //if ((data.offset.left > old_x)&&(data.offset.top > old_y)) { offset = 'XY' };

        //if ((data.offset.left > old_x)&&(data.offset.top == old_y)) { offset = 'X' };
        //if ((data.offset.left < old_x)&&(data.offset.top == old_y)) { offset = 'x' };

        //if ((data.offset.left == old_x)&&(data.offset.top > old_y)) { offset = 'Y' };
        //if ((data.offset.left == old_x)&&(data.offset.top < old_y)) { offset = 'y' };

        ////if (data.offset.left >= old_x) {
            ////if(data.offset.top >= old_y) {
                ////offset = "XY";
            ////} else {
                ////offset = "Xy";
            ////};
        ////} else {
            ////if(data.offset.top > old_y) {
                ////offset = "xY";
            ////} else {
                ////offset = "xy";
            ////};
        ////};
        
        //console.log(offset);

        ////if (data.offset.left < old_x) {
            //////angle-=Math.abs(old_x - data.offset.left);
            ////angle--;
        ////} else {
            //////angle+=Math.abs(old_x - data.offset.left);
            //angle++;
        ////}
        //old_x = data.offset.left;
        //old_y = data.offset.top; 
        //transform();
        //data.position.left = 0;
        //data.position.top = 0;
        ////return false;
    //})
    //$('#test').bind('dragstop', function(e, data){
        //old_x = 0;
        //old_y = 0;
    //});
}
$(document).ready(function(){
    new MoveFace({
        maneken_url: "temp/maneken.jpg", 
        face: {
            url: "temp/face.png",
            w: 150,
            h: 180, 
        },
        area: {w: 600, h: 800},
        restrict: {max: 300, min: 100}, //ограничения по ширине
        selectors: {
            main: '#maneken',
            face_holder: '#maneken #face',
            face_img: "#face img.main",
            flip: "#face .flip",
            rotate: "#angle_image",
            rotate_view: ".rotate",
        }
    });

    $('#round').draggable({
        drag: function(e, data){
            var R = 200;
            var x_y = rotation({x: 1300, y: 500}, {x: data.position.left, y: data.position.top}, R);
            data.position.left = x_y.x;
            data.position.top = x_y.y;
            return true;
        },
    });

    //find_x_y({k:1,b:0}, {x:0,y:0}, 2);



});
