$(document).ready(function(){
    var flip = 1;
    var angle = 0;

    var transform = function() {
        var transform = "scaleX(" + flip + ") rotate(" + angle + "deg)";
        switch(true) {
            case $.browser.mozilla:
                $("#face .main").css('-moz-transform', transform);
                break;
            case $.browser.opera:
                $("#face .main").css('-o-transform', transform);
                break;
            case $.browser.webkit:
                $("#face .main").css('-webkit-transform', transform);
                break;
            default:
                $("#face .main").css('transform', transform);
        }
    }





    $('#face').draggable();
    $( "#face img.main" ).resizable({
        aspectRatio: true,
    });
    $('#face .flip').click(function() {
        if (flip == 1) {
            flip = -1;
        } else {
            flip = 1;
        }
        transform();
    });
    $('#angle_image').slider({
        value: 0,
        min: -180,
        max: 180,
        step: 5,
    });
    $('#angle_image').on('slide', function(e, _angle) {
        $(this).parent('#face').find('.angle').text(_angle.value);
        angle = _angle.value;
        console.log(angle);
        transform();
    })
});
