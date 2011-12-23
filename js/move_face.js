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

    $(it.data.selectors.face_area).resizable({
        aspectRatio: true,
        maxWidth: it.data.restrict.max,
        minWidth: it.data.restrict.min,
        alsoResize: it.data.selectors.face_img,
        resize: function(e, data) {
        }
    });

    $(it.data.selectors.flip).click(function() {
        flip = (flip == 1)? -1 : 1;
        transform();
    });

    /* вращение объекта */
    (function(){
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
            $(it.data.selectors.rotate).css('left', e.pageX - $(it.data.selectors.model).position().left 
                - $(it.data.selectors.face).position().left - 16 + 'px');
            $(it.data.selectors.rotate).css('top' , e.pageY - $(it.data.selectors.model).position().top
                - $(it.data.selectors.face).position().top - 16 + 'px');
        })
        $(it.data.selectors.rotate).mouseout(function(){
            $(this).hide();
        });
    })();

    var set_image = function(sex) {
        var model_url = $(it.data.selectors.model_colors).find('.' + sex + '.active').find('a').attr('href');
        $(it.data.selectors.model).css('background-image', 'url(' + model_url + ')');
        $(it.data.selectors.model_colors).find('li').hide();
        $(it.data.selectors.model_colors).find('li.' + sex).show();
    }
    //set_image($(it.data.selectors.select_model).val());

    $(it.data.selectors.model_colors).find('a').click(function() {
        var current_model = $(it.data.selectors.select_model).val();
        var it_li = $(this).parent('li');
        it_li.addClass('active');
        $(it.data.selectors.model_colors).find('li.' + current_model).each(function(i, li) {
            if (li != it_li.get(0)) { $(li).removeClass('active')};
        });
        $(it.data.selectors.model).css('background-image', 'url(' + $(this).attr('href') + ')');
        return false;
    })

    // выбор модели (М|Ж)
    $(it.data.selectors.select_model).change(function(e, data) {
        set_image($(this).val())
    });

    // сохранение
    $(it.data.selectors.save_form).submit(function() {
        var form = $(this);

        var img_addition_x = $(it.data.selectors.face_img).position().left;
        var img_addition_y = $(it.data.selectors.face_img).position().top;
        var x = $(it.data.selectors.face).position().left + img_addition_x;
        var y = $(it.data.selectors.face).position().top + img_addition_y;
        var _flip = flip; 
        var _angle = _flip*angle; 
        var width = $(it.data.selectors.face_img).width();
        var height = $(it.data.selectors.face_img).height();
        var sex = $(it.data.selectors.select_model).val;
        var model_color = $(it.data.selectors.model_colors).find('.' + sex + '.active').find('a').attr('href');
        
        form.find('input[name=x]').val(x); 
        form.find('input[name=y]').val(y); 
        form.find('input[name=flip]').val(_flip); 
        form.find('input[name=angle]').val(_angle); 
        form.find('input[name=width]').val(width); 
        form.find('input[name=height]').val(height); 
        form.find('input[name=sex]').val(sex); 
        form.find('input[name=model_color]').val(model_color); 

        return false;
    });
}
