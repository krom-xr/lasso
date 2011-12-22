		$(document).ready(function(){	
				$(".sale-leaders").easySlider({
				auto: false, 
				continuous: true,
				tska: 5,
				speed: 200
			});		
			
			$(".sale-images").easySlider({
				auto: false, 
				continuous: true,
				tska: 5,
				speed: 200
			});		
			
		});	

	$("#BlockSaleImages .switcher").each(function(i){
		var $this = $(this);
		$this.click(function(){
			$("#BlockSaleImages .switcher").removeClass("active").eq(i).addClass("active");
			$("#BlockSaleImages section").removeClass("active").eq(i).addClass("active");
			return false
		});
	});
});
	
	