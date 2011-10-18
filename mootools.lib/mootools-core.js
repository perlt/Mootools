/*
---
MooTools: the javascript framework

web build:
 - http://mootools.net/core/7c56cfef9dddcf170a5d68e3fb61cfd7

packager build:
 - packager build Core/Core Core/Array Core/String Core/Number Core/Function Core/Object Core/Event Core/Browser Core/Class Core/Class.Extras Core/Slick.Parser Core/Slick.Finder Core/Element Core/Element.Style Core/Element.Event Core/Element.Dimensions Core/Fx Core/Fx.CSS Core/Fx.Tween Core/Fx.Morph Core/Fx.Transitions Core/Request Core/Request.HTML Core/Request.JSON Core/Cookie Core/JSON Core/DOMReady Core/Swiff

/*
---

name: Core

description: The heart of MooTools.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
  - Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  - Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Core, MooTools, Type, typeOf, instanceOf, Native]

...
*/

(function(){

    // 版本号
this.MooTools = {
	version: '1.3.2',
	build: 'c9f1ff10e9e7facb65e9481049ed1b450959d587'
};

// typeOf, instanceOf
// 进行类型检验
// null
// $family
// element textnode whiespace arguments collection
var typeOf = this.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$family) return item.$family();

	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
        // collection 的判断
		if ('item' in item) return 'collection';
	}

	return typeof item;
};
// $constructor, item.constructor, instanceof
var instanceOf = this.instanceOf = function(item, object){
	if (item == null) return false;
	var constructor = item.$constructor || item.constructor;
    // 采用冒泡形式去检查父类的实例
	while (constructor){
		if (constructor === object) return true;
		constructor = constructor.parent;
	}
	return item instanceof object;
};

// Function overloading

var Function = this.Function;
// 如果浏览器默认不支持一些方法，则设置枚举值为其添加上
var enumerables = true;
for (var i in {toString: 1}) enumerables = null;
if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

// 区分字符串和对象的调用,如果usePlural为true的话，那么就直接进行多值调用
// 返回当前调用的上下文
Function.prototype.overloadSetter = function(usePlural){
	var self = this;// 这个指代extend函数本身
    // 对多个属性进行设值,前提是a值是个对象
	return function(a, b){
		if (a == null) return this;
		if (usePlural || typeof a != 'string'){// 对象的调用
			for (var k in a) self.call(this, k, a[k]);
            // 这句话还真不知道啥意思,估计是如果不存在一些默认的属性的话，给其加上`
			if (enumerables) for (var i = enumerables.length; i--;){
				k = enumerables[i];
				if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
			}
		} else {// 普通的调用
			self.call(this, a, b);
		}
		return this;
	};
};

// 返回一个调用的结果集，KEY为参数
// 返回当前调用的上下文
Function.prototype.overloadGetter = function(usePlural){
	var self = this;
	return function(a){
		var args, result;
        // 如果参数为对象，则args为传进来的参数，否则则为arguments.
		if (usePlural || typeof a != 'string') args = a;
		else if (arguments.length > 1) args = arguments;

		if (args){
			result = {};
			for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
		} else {
			result = self.call(this, a);
		}

		return result;
	};
};
// 对类对象本身进行拓展
Function.prototype.extend = function(key, value){
	this[key] = value;
}.overloadSetter();
// 在原型链上进行拓展
Function.prototype.implement = function(key, value){
	this.prototype[key] = value;
}.overloadSetter();

// From
// 类型转化
var slice = Array.prototype.slice;

Function.from = function(item){
	return (typeOf(item) == 'function') ? item : function(){
		return item;
	};
};

Array.from = function(item){
	if (item == null) return [];
	return (Type.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : slice.call(item) : [item];
};

Number.from = function(item){
	var number = parseFloat(item);
	return isFinite(number) ? number : null;
};

String.from = function(item){
	return item + '';
};

// hide, protect

Function.implement({

	hide: function(){
		this.$hidden = true;
		return this;
	},

	protect: function(){
		this.$protected = true;
		return this;
	}

});

// Type
// 为某一个对象或者类加上TYPE相关的信息
var Type = this.Type = function(name, object){
	if (name){
        // 没有值的时候，主要是在TYPE全局中注册一个typeCheck方法
		var lower = name.toLowerCase();
		var typeCheck = function(item){
			return (typeOf(item) == lower);
		};

		Type['is' + name] = typeCheck;
		if (object != null){
			object.prototype.$family = (function(){
				return lower;
			}).hide();

		}
	}

	if (object == null) return null;

	object.extend(this);//  将对象进行Type的包装
	object.$constructor = Type;// object[$constructor]
	object.prototype.$constructor = object;// real constructor

	return object;
};

var toString = Object.prototype.toString;
//检测是否为数字
Type.isEnumerable = function(item){
	return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
};

// 一个勾子，里面保存着跟当前对象关系紧密的一些函数活对象，如果
//原对象为Type，则用implement对勾子进行拓展，否则，则将当前对象
//作为上下文对勾子函数进行调用
var hooks = {};
// 从勾子中获得相应的对象
var hooksOf = function(object){
	var type = typeOf(object.prototype);// 类的名称，也就是类型
	return hooks[type] || (hooks[type] = []);// 为空就设定一个空数组
};

// 为原型链和类本身做必要的继承,类的继承是包含着一个依赖于一个上下文的对这个方法的调用的闭包
var implement = function(name, method){
    // 通过$hidden 来控制访问权限
	if (method && method.$hidden) return;

    // 取到勾子中的一些对象
	var hooks = hooksOf(this);
	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
        // 类型为type，则直接对钩子里面的对象进行拓展
		if (typeOf(hook) == 'type') implement.call(hook, name, method);
        // 否则对勾子里面的方法进行调用
		else hook.call(this, name, method);
	}

    // 如果之前的那个方法不存在，则直接进行设置,这个是在原型链那边设置的,保护成员不能被替换
	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;

    // 这个是对类本身进行拓展,如果方法是一个函数，这个拓展是返回一个可调用的闭包，里面包含着对方法的调用
	if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item){
		return method.apply(item, slice.call(arguments, 1));
	});
};

// 为本身添加一个属性,之前不存在这样的一个方法
var extend = function(name, method){
	if (method && method.$hidden) return;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
};
//在原型链上添加此接口
Type.implement({
    //implement函数的对接
	implement: implement.overloadSetter(),
    //extend函数的对接
	extend: extend.overloadSetter(),
    // 对现有的方法命个别名
	alias: function(name, existing){
		implement.call(this, name, this.prototype[existing]);
	}.overloadSetter(),
    // 为传入参数制作一个勾子
	mirror: function(hook){
		hooksOf(this).push(hook);
		return this;
	}

});
// Default Types
// 生成一个正在的TYPE类。
new Type('Type', Type);

// 设置保护成员,并且进行Type转化
var force = function(name, object, methods){
	var isType = (object != Object),// 如果不是Object对象本身，则进行框架内的包装
		prototype = object.prototype;
    // 进行框架内部的类型包装
	if (isType) object = new Type(name, object);

	for (var i = 0, l = methods.length; i < l; i++){
		var key = methods[i],// 方法的键的名称
			generic = object[key],//类本身的方法
			proto = prototype[key];//原型链上的方法

		if (generic) generic.protect();//存在类本身的方法，则设置为Protect

		if (isType && proto){// 存在原型链的方法，且为type类，则设置新的方法
			delete prototype[key];
			prototype[key] = proto.protect();
		}
	}
    // 重新设置原型链，因为前面已经重置了
	if (isType) object.implement(prototype);

	return force;
};
//进行保护与类型转换
force('String', String, [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
])('Array', Array, [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
])('Number', Number, [
	'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
])('Function', Function, [
	'apply', 'call', 'bind'
])('RegExp', RegExp, [
	'exec', 'test'
])('Object', Object, [
	'create', 'defineProperty', 'defineProperties', 'keys',
	'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
	'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
])('Date', Date, ['now']);

//在Object中设定一个extend类方法,不过应该已经存在了一个这样的Extend方法，所以这个做法应该是改变闭包中的self
Object.extend = extend.overloadSetter();

Date.extend('now', function(){
	return +(new Date);
});

new Type('Boolean', Boolean);

// fixes NaN returning as Number

Number.prototype.$family = function(){
	return isFinite(this) ? 'number' : 'null';
}.hide();

// Number.random

Number.extend('random', function(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
});

// forEach, each

var hasOwnProperty = Object.prototype.hasOwnProperty;
Object.extend('forEach', function(object, fn, bind){
	for (var key in object){//如果对象拥有这个属性
		if (hasOwnProperty.call(object, key)) fn.call(bind, object[key], key, object);
	}
});

Object.each = Object.forEach;

Array.implement({
    //在BIND上下文中对数组进行调用
	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		}
	},

	each: function(fn, bind){
		Array.forEach(this, fn, bind);
		return this;
	}

});

// Array & Object cloning, Object merging and appending
var cloneOf = function(item){
	switch (typeOf(item)){
		case 'array': return item.clone();
		case 'object': return Object.clone(item);
		default: return item;
	}
};
// 数组的clone方法,主要是复制，防止JavaScript对象本身的引用的特性
Array.implement('clone', function(){
	var i = this.length, clone = new Array(i);
	while (i--) clone[i] = cloneOf(this[i]);// 经过cloneOf调用的自身复制
	return clone;
});
// 合并某个值，如果为对象，则进行合并，为数组，则直接替换
var mergeOne = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};
// 添加一个类方法
Object.extend({
    //如果KEY值为字符串，则直接进行合并。如果为对象，则解析对象进行复制值合并
	merge: function(source, k, v){
		if (typeOf(k) == 'string') return mergeOne(source, k, v);
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			for (var key in object) mergeOne(source, key, object[key]);
		}
		return source;
	},
    //进行自身克隆
	clone: function(object){
		var clone = {};
		for (var key in object) clone[key] = cloneOf(object[key]);// 利用cloneOf进行自身复制
		return clone;
	},
    //进行拓展
	append: function(original){
		for (var i = 1, l = arguments.length; i < l; i++){
			var extended = arguments[i] || {};
			for (var key in extended) original[key] = extended[key];
		}
		return original;
	}

});

// Object-less types
// 为各各对象加上类型检测函数
['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name){
	new Type(name);
});

// Unique ID
// 为字符串类添加一个uniqueID的方法。
var UID = Date.now();

String.extend('uniqueID', function(){
	return (UID++).toString(36);
});



})();