/*
---

name: Class

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires: [Array, String, Function, Number]

provides: Class

...
*/

(function(){
//调用type进行新建对象
//$constructor, parent
var Class = this.Class = new Type('Class', function(params){
    //如果传入的参数为函数，则将其设为initialize函数
	if (instanceOf(params, Function)) params = {initialize: params};
    //暂时保存的新的类
    //1.复制原来对象
    //2.检测$prototypng
    //3.设置$caller
    //4.调用initialize
    //5.重新设置$caller
    //6.返回被包装后的结果
    //7.继承Type类方法，继承原型链方法
	var newClass = function(){
		reset(this);
        //如果是用来构造父类的情况则直接返回实例
		if (newClass.$prototyping) return this;

		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;

		return value;
	}.extend(this).implement(params);//extend(this)指代的是获取Class基类的属性对类本省进行扩充

	newClass.$constructor = Class;//构造器
	newClass.prototype.$constructor = newClass;//构造器
	newClass.prototype.parent = parent;//父亲的指向,指的是基类的Class

	return newClass;
});

//调用父亲构造器,并且获得结果
var parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');

	var name = this.$caller.$name,//保存名字
		parent = this.$caller.$owner.parent,//父亲的指向
		previous = (parent) ? parent.prototype[name] : null;//原先对象的指引

	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

//主要是克隆某个对象，目的是为了包装，如果目标参数是个对象，
//则将其转化为函数，遇到数组就调用克隆，其他的直接返回
var reset = function(object){
    //遍历对象
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
            //如果是个对象，则用一个函数进行包装
			case 'object':
				var F = function(){};
				F.prototype = value;
				object[key] = reset(new F);
			break;
            //如果是个数组，则进行克隆
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

//就是对方法进行封装，返回的一个是调用的闭包，
//caller,$owner, $origin, $caller, $name
var wrap = function(self, key, method){
    //如果存在$origin这个属性，则将method对应到$origin的值
	if (method.$origin) method = method.$origin;

	var wrapper = function(){
        //如果方法是保护类型，或者$caller不存在，则抛出异常
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');

        //this.caller设置为this.$caller,this.caller设置为当前的wrapper
		var caller = this.caller, current = this.$caller;
		this.caller = current;
        this.$caller = wrapper;

        //调用method方法，获得返回值
		var result = method.apply(this, arguments);

        //重新还原caller和$caller
		this.$caller = current;
        this.caller = caller;

		return result;
	}.extend({$owner: self, $origin: method, $name: key});//重新包装Wrapper,$owner,$origin,$name

	return wrapper;
};

//如果增量对象里含有改属性，则对其进行调用，如果有返回值，则执行下面操作
//如果返回值是个函数，则从新设置，否则则将结果直接合并到原型链中
var implement = function(key, value, retain){
    //如果增量对象里含有改属性，则对其进行调用，如果有返回值，则执行下面操作
    //extends,implements 的情况
	if (Class.Mutators.hasOwnProperty(key)){
		value = Class.Mutators[key].call(this, value);
		if (value == null) return this;
	}
    //如果返回值是个函数，则从新设置，否则则将结果直接合并到原型链中
	if (typeOf(value) == 'function'){
		if (value.$hidden) return this;
        //在这里调用wrap函数
		this.prototype[key] = (retain) ? value : wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}
	return this;
};

//生成某个类实例，利用$prototyping进行调用
var getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};
//原型链设置方法
Class.implement('implement', implement.overloadSetter());

//Class里面的增量方法对象,用于内部使用
Class.Mutators = {
    //内置继承的实现，设置parant,并且复制父亲类的实例到原型链中
    //Mutators,parent,getinstance
	Extends: function(parent){
		this.parent = parent;
		this.prototype = getInstance(parent);//重新设置原型链，也就是复制父类的原型链
	},
    //向mutator里面添加方法
	Implements: function(items){
        // this指代Mutator
		Array.from(items).each(function(item){
            //创建某个Item的实例
			var instance = new item;
            //遍历传进来的实例，并且利用this对其进行拓展
			for (var key in instance) implement.call(this, key, instance[key], true);
		}, this);
	}
};


})();