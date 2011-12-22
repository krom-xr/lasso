$(function(){
  $(".choices input").change(function(){
    
    if ($(this).attr("type") == 'radio'){
      // if element is radio uncheck all neighbors
      $(this).parents(".choices-group").find("label").removeClass("active");
      
    } else if (!$(this).is(':checked')){
        // else if checkbox and it is not checked uncheck only itself
        $(this).parent().removeClass("active");
        return;
      }
      
    $(this).parent().addClass("active");
  })
  
  $(".choices :checked").each(function(){
    $(this).parent().addClass("active");
  })
  
  $('input[type=radio][disabled=disabled]').addClass("jqTransformDisabled")
        
})