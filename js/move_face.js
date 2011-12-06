
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

    $(data.selectors.model).css('background-image', 'url(' + data.model.url + ')');
    $(data.selectors.model).css('width', data.model.w + 'px');
    $(data.selectors.model).css('height', data.model.h + 'px');

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
                $(it.data.selectors.face_area).css('-moz-transform', transform);
                break;
            case $.browser.opera:
                $(it.data.selectors.face_area).css('-o-transform', transform);
                break;
            case $.browser.webkit:
                $(it.data.selectors.face_area).css('-webkit-transform', transform);
                break;
            case $.browser.msie:
                $(it.data.selectors.face_area).css('-ms-transform', transform);
                break;
            default:
                $(it.data.selectors.face_img).css('transform', transform);
        }
    }

    $(it.data.selectors.face).draggable({
        drag: function(e, data) {
            if (data.position.left > it.data.model.w - $(this).width()) { data.position.left = it.data.model.w - $(this).width() };
            if (data.position.left < 0) { data.position.left = 0 };

            if (data.position.top > it.data.model.h - $(this).height()) { data.position.top = it.data.model.h - $(this).height() };
            if (data.position.top < 0) { data.position.top = 0 };
        }
    });
    this.drag = function(e, data) {
        if (data.position.left > it.data.model.w - $(this).width()) { data.position.left = it.data.model.w - $(this).width() };
        if (data.position.left < 0) { data.position.left = 0 };

        if (data.position.top > it.data.model.h - $(this).height()) { data.position.top = it.data.model.h - $(this).height() };
        if (data.position.top < 0) { data.position.top = 0 };
    }

    $(it.data.selectors.face_area).resizable({
        aspectRatio: true,
        maxWidth: it.data.restrict.max,
        minWidth: it.data.restrict.min,
        alsoResize: it.data.selectors.face_img,
        resize: function() {
            $(it.data.selectors.rotate).trigger('drag');
        }
    });

    $(it.data.selectors.flip).click(function() {
        flip = (flip == 1)? -1 : 1;
        transform();
    });

    $(it.data.selectors.rotate).draggable({
        drag: function(e, data) {
            var R = $(it.data.selectors.face).height()/2;
            var O = {}
            O.x = $(it.data.selectors.face).width()/2;
            O.y = $(it.data.selectors.face).height()/2;
            var x_y = rotation(O, {x: data.position.left, y: data.position.top}, R + 20);

            if (x_y.l) {
                angle = Math.atan(x_y.k)*57 + 90;
            } else if(x_y.r){
                angle = Math.atan(x_y.k)*57 - 90;
            }
            transform();
        },
    });

    $(it.data.selectors.rotate_handle).mouseover(function(e, data){
        $(it.data.selectors.rotate).show();
        $(it.data.selectors.rotate).css('left', e.clientX - $(it.data.selectors.model).position().left - $('#face').position().left - 16 + 'px');
        $(it.data.selectors.rotate).css('top' , e.clientY - $(it.data.selectors.model).position().top - $('#face').position().top - 16 + 'px');
    })
    $(it.data.selectors.rotate).mouseout(function(){
        $(this).hide();
    });
}
$(document).ready(function(){
    new MoveFace({
        model: {
            url: "temp/maneken.jpg", 
            w: 600, 
            h: 800,
        },
        face: {
            url: "temp/face.png",
            w: 150,
            h: 180, 
        },
        restrict: { max: 300, min: 100 }, //ограничения по ширине
        selectors: {
            model: '#model',
            face: '#face',
            face_area: '#face_area',
            face_img: "#face img.face",
            flip: "#face .flip",
            rotate: "#rotate",
            rotate_handle: "#rotate_handle .handle",
        }
    });
});
