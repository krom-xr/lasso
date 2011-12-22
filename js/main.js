$(document).ready(function(){	

$('#UserPanel .user-menu').css('width', 917-$('#UserPanel .search').outerWidth()-$('#UserPanel .bonuses').outerWidth()-$('#UserPanel .login-reg').outerWidth()-$('#UserPanel .hide-visible').innerWidth());
	
	
var offset = $('.w980').offset();

$('#UserPanel .active').css('left', offset.left);
$('#UserPanel .unactive').css('left', 786+offset.left);

$(window).bind('resize', function(){	
	var offset = $('.w980').offset();
	$('#UserPanel .active').css('left', offset.left);
	$('#UserPanel .unactive').css('left', 786+offset.left);
});
	
	
	$(".sale-leaders").easySlider({
		auto: false, 
		continuous: false,
		tska: 5,
		speed: 200
	});		
			
	$(".sale-images").easySlider({
		auto: false, 
		continuous: false,
		tska: 5,
		speed: 200
	});	

	$(".effects .selector .slider .overflow").easySlider({
		auto: false, 
		tska: 1,
		prevId: 		'prev-button-selector',
		nextId: 		'next-button-selector',
		speed: 200,
		continuous: false
	});
		
	$("header .model").live('mouseenter mouseleave', function(i) {
		$(".model .imodel.selector").toggle();
		$(".model a.nav").toggleClass("active");
	});
	
	$("header .background").live('mouseenter mouseleave', function(i) {
		$(".background .ibackground.selector").toggle();
		$(".background a.nav").toggleClass("active");
	});	
	
	$("header .effects").live('mouseenter mouseleave', function(i) {
		$(".effects .ieffects.selector").toggle();
		$(".effects a.nav").toggleClass("active");
	});	


	// Табы на главной
	$("#BlockSaleImages .switcher").each(function(i){
		var $this = $(this);
		$this.click(function(){
			$("#BlockSaleImages .switcher").removeClass("active").eq(i).addClass("active");
			$("#BlockSaleImages section.tab").removeClass("active").eq(i).addClass("active");
			return false
		});
	});
	
	// Табы на странице каталога
	$("#BlockLookAtThis .switcher").each(function(i){
		var $this = $(this);
		$this.click(function(){
			$("#BlockLookAtThis .switcher").removeClass("active").eq(i).addClass("active");
			$("#BlockLookAtThis section").removeClass("active").eq(i).addClass("active");
			return false
		});
	});
	
	
	// Табы на странице каталога
	$("#BlockDressedImages .switcher").each(function(i){
		var $this = $(this);
		$this.click(function(){
			$("#BlockDressedImages .switcher").removeClass("active").eq(i).addClass("active");
			$("#BlockDressedImages section").removeClass("active").eq(i).addClass("active");
			return false
		});
	});		
	
	// Выпадающее меню (основное)
	$("nav#Main li.with-submenu").each(function(i){
		var $this = $(this);
		$this.bind('mouseenter mouseleave', function(){
			$("nav#Main li section").eq(i).toggleClass("active");
			$this.find("a.woman").toggleClass('active');
			$this.find("a.man").toggleClass('active');
			$this.find("a.child").toggleClass('active');			
			return false
		});		
	});	
	
	
	$("header li.catalog").each(function(i){
		var $this = $(this);
		$this.bind('mouseenter mouseleave', function() {
		$(".catalog .icatalog.selector").toggle();
		$(".catalog a.nav").toggleClass("active");
		});
	});		
	
	$(".brands li").each(function(i) {
		var $this = $(this);
		$this.bind('mouseenter mouseleave', function(){	
			$(".submenu .container aside.active").removeClass("active");
			$(".submenu .container aside").eq(i).toggleClass("active");
		});
	});
	
	// Панель пользователя
	$("#UserPanel .hide-visible a").click(function(i){
        $("#UserPanel .active").slideToggle(500);
        $("#UserPanel .unactive").slideToggle(500);
        if ($(this).attr("id") == "close_floating_menu")
          var is_closed_menu = true;
        else 
          var is_closed_menu = false;
        $.cookie('is_closed_menu', is_closed_menu);
        return false    
	}); 
	
	// Выпадающее меню
		$(".block.select .title").click(function(i){
			$(this).toggleClass('active');
			$(this).nextAll("article").toggleClass('active');
			return false;
		});	
		
// Открытие корзины при клике
		$("header .cart a").click(function(i){
			$("#OpenCart").toggleClass("display");
			return false;
		});	
		
		$("#OpenCart .close").click(function(i){
			$("#OpenCart").toggleClass("display");
			return false;
		});			
		
// Наведение на пункты правого меню
	$("#rightmenu a").each(function(i){
		var $this = $(this);
		$this.hover(function() {
			$("#rightmenu a em").eq(i).toggle();
			$("#rightmenu a span").eq(i).toggle();
		})
	});
	
	
// Клик по корзинетовара

	$("#WishesContent .content article ul li.wishes-item").each(function(i){
		var $this = $(this);
		$this.hover(function() {
			$("#WishesContent .content article ul li.wishes-item .open-product.popup").eq(i).toggleClass('display');
			$("#WishesContent .content article ul li.wishes-item .popup-delete-button").eq(i).toggle();
		})
	});
	
	$("#DressingCatalogContent .content article ul li.list-item").each(function(i){
		var $this = $(this);
		$this.hover(function() {
			$("#DressingCatalogContent .content article ul li .open-dressed").eq(i).toggleClass('display');
			$("#DressingCatalogContent .content article ul li .popup-delete-button").eq(i).toggle();
		})
	});	
	
	$("#PersonalRoomEnterContent .content article ul li.wishes-item").each(function(i){
		var $this = $(this);
		$this.hover(function() {
			$("#PersonalRoomEnterContent .content article .wishes-list ul li.wishes-item .open-product").eq(i).toggleClass('display');
			$("#PersonalRoomEnterContent .content article .wishes-list ul li.wishes-item .popup-delete-button").eq(i).toggle();
		})
	});	
	
	$("#PersonalRoomEnterContent .dressed-list ul li").each(function(i){
		var $this = $(this);
		$this.hover(function() {
			$("#PersonalRoomEnterContent .dressed-list ul li .open-dressed").eq(i).toggleClass('active');
			$("#PersonalRoomEnterContent .dressed-list ul li .popup-delete-button").eq(i).toggle();
		})
	});	
	
	
	$(".dresseds li.child").hover(function() {
		$(".dresseds li.with-submenu ul").toggle();
	});
	
});
	
	