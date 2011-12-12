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
        console.log(e);
        $(it.data.selectors.rotate).show();
        $(it.data.selectors.rotate).css('left', e.pageX - $(it.data.selectors.model).position().left 
            - $(it.data.selectors.face).position().left - 16 + 'px');
        $(it.data.selectors.rotate).css('top' , e.pageY - $(it.data.selectors.model).position().top
            - $(it.data.selectors.face).position().top - 16 + 'px');
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
