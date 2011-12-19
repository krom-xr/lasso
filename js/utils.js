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


// находит коэффициэнты k и b для уравнения y=kx+b
// заданного точками A и B
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

// проверяет лежит ли точка С на отрезка А, В
// assumption - погрешность
var belongs_to_segment = function(A, B, C, assumption) {
    var on_segment = function(A, B, x, assumption) {
        return Math.abs(Math.abs(A-x) + Math.abs(B-x) - Math.abs(B - A)) < assumption;
    }

    var kb = find_k_b({x: A.x, y: A.y}, {x: B.x, y: B.y});
    if (Math.abs(C.y - C.x*kb.k - kb.b) < assumption) { 
        if (on_segment(A.x, B.x, C.x, assumption) && on_segment(A.y, B.y, C.y, assumption)) {
            return true;
        }
    };
    return false;
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
