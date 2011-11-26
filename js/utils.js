/* Универсальная функция наследования
 * link - http://karaboz.ru/?p=10
 * использование:
 * var A = function(){}
 * var B = function(){
 *     B.superClass.apply(this, arguments); //инициализация конструктора A  
 * }
 * B.inheritsFrom(A); // B наследует A 
 */
Function.prototype.inheritsFrom = function(superClass) {
	var Inheritance = function(){};
	Inheritance.prototype = superClass.prototype;

	this.prototype = new Inheritance();
	this.prototype.constructor = this;
	this.superClass = superClass;
}

var sm = Object;
/* Итерирует объект, и возвращает первое соответсвие заданному шаблону.
 * author - rmnx
 * использование:
       var item = sm.detect(['1', '2', '3', '4', '5'], function(value){
           return value > "3";
       });
       //item = 4
 */
sm.detect = function(iter_object, fn) {
  var result = false;
  $.each(iter_object, function(index, value){
      if(fn(value)){
          result = value;
          return false;
      }
  })
  return result;
};

