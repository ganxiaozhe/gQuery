// =================================================
//
// gQuery v1.3.0 under MIT
//
// Licensed MIT for open source use
// or gQuery Commercial License for commercial use
//
// Copyright 2020 gQuery, by Ganxiaozhe
//
// [fn]
// seletor,each,find,parent,remove,empty,text,html
// val,width,height,offset,prepend,append,before,after
// attr,removeAttr,hasClass,addClass,removeClass,toggleClass
// css,show,hide,fadeIn,fadeOut,fadeToggle
// slideUp,slideDown,slideToggle,on,off,trigger,click,select
//
// [extend fn]
// isWindow,strToNode,copy,deepClone
// [extend array]
// unique
// [extend event]
// list,add,remove
// [extend get]
// queryParam
// [extend storage]
// read,write,remove,clear,push
//
// =================================================
;(function(global,factory){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = window || self, global.gQuery = global.$ = factory());

	if(!!window.ActiveXObject || "ActiveXObject" in window){
		window.location.href = 'https://gquery.net/kill-ie?back='+(window.location.href);
	}

	console.log('%c gQuery %c https://gquery.net \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');
}(window,function(){
	'use strict';
	var gQuery = function( selector, context ) {
		return new gQuery.fn.init( selector, context );
	}

	gQuery.fn = gQuery.prototype = {
		constructor: gQuery,
		gquery: '1.3.0',
		init: function(sel,opts){
			let to = typeof sel,elems = [];
			switch(to){
				case 'function':
					if (document.readyState != 'loading'){sel();} else {
						document.addEventListener('DOMContentLoaded', sel);
					}
					return;
				case 'object':
					sel.length===undefined ? elems.push(sel) : elems = sel;
					gQuery.isWindow(sel) && (elems = [window]);
					break;
				case 'string':elems = document.querySelectorAll(sel);break;
			}

			this.length = elems.length;
			for (let i = elems.length - 1; i >= 0; i--) {this[i] = elems[i];}
			return this;
		},
		each: function(arr,callback){
			callback || (callback = arr,arr = this);
			for(let i = 0; i < arr.length; i++){
				if(callback.call(arr[i], i, arr[i-1]) == false){break;}
			}
			return this;
		},
		find: function(sel){
			let finder = gQuery.deepClone(this),fArr = [];
			this.each(function(idx){
				let elems = this.querySelectorAll(sel);
				for (let i = elems.length - 1; i >= 0; i--) {fArr.push(elems[i]);}
			});

			fArr = gQuery.array.unique(fArr);
			finder.length = fArr.length;let ii = 0;
			for (let i = fArr.length - 1; i >= 0; i--) {finder[i] = fArr[ii];ii++;}
			return finder;
		},
		parent: function(){
			let _this = this;
			return this.each(function(idx){_this[idx] = this.parentNode;});
		},
		next: function(sel){
			let _this = this;
			return this.each(function(idx){_this[idx] = this.nextElementSibling;});
		},
		remove: function(){
			this.each(function(){this.parentNode.removeChild(this);});
		},
		empty: function(){
			return this.each(function(){
				while(this.firstChild){this.removeChild(this.firstChild);}
			});
		},
		text: function(val){
			if(val === undefined) {
				let resArr = [];this.each(function(){resArr.push(this.innerText);});
				return (resArr.length>1 ? resArr : resArr[0]);
			} else {
				return this.each(function(){this.innerText = val;});
			}
		},
		html: function(val){
			if(val === undefined) {
				let resArr = [];this.each(function(){resArr.push(this.innerHTML);});
				return (resArr.length>1 ? resArr : resArr[0]);
			} else {
				return this.each(function(){this.innerHTML = val;});
			}
		},
		val: function(val){
			if(val === undefined) {
				let resArr = [];this.each(function(){
					this.value===undefined || resArr.push(this.value);
				});
				return (resArr.length>1 ? resArr : resArr[0]);
			} else {
				return this.each(function(){this.value = val;});
			}
		},
		width: function(val){
			let totalWidth = 0;
			this.each(function(){
				val===undefined ? (totalWidth += this.offsetWidth) : (this.style.width = val);
			});
			if(val===undefined){return totalWidth/this.length;} else {return this;}
		},
		height: function(val){
			let totalHeight = 0;
			this.each(function(){
				val===undefined ? (totalHeight += this.offsetHeight) : (this.style.height = val);
			});
			if(val===undefined){return totalHeight/this.length;} else {return this;}
		},
		offset: function(){
			var rect = this[0].getBoundingClientRect();
			return {
				top: rect.top + document.body.scrollTop,
				left: rect.left + document.body.scrollLeft
			}
		},
		append: function(elem){
			return this.each(function(){this.appendChild( gQuery.strToNode(elem) );});
		},
		prepend: function(elem){
			return this.each(function(){this.prepend( gQuery.strToNode(elem) );});
		},
		before: function(elem){
			return this.each(function(){this.before( gQuery.strToNode(elem) );});
		},
		after: function(elem){
			return this.each(function(){this.after( gQuery.strToNode(elem) );});
		},
		attr: function(attrs,val){
			if(val === undefined && typeof attrs === 'string') {return this[0].getAttribute(attrs);} else {
				if(typeof attrs === 'object'){
					return this.each(function(){
						for(let idx in attrs){this.setAttribute(idx, attrs[idx]);}
					});
				}
				return this.each(function(){this.setAttribute(attrs, val);});
			}
		},
		removeAttr: function(attr){
			return this.each(function(){this.removeAttribute(attr);});
		},
		hasClass: function(cls){
			let res = false;
			this.each(function(){
				if( this.classList.contains(cls) ){res = true;}
			});
			return res;
		},
		addClass: function(cls){
			return this.each(function(){this.classList.add(cls);});
		},
		removeClass: function(cls){
			return this.each(function(){this.classList.remove(cls);});
		},
		toggleClass: function(cls){
			return this.each(function(){this.classList.toggle(cls);});
		},
		css: function(styles,val){
			if(val){
				return this.each(function(){this.style[styles] = val;});
			}
			if(typeof styles === 'string'){return this[0].style[styles];}

			return this.each(function(){
				for(let style in styles){this.style[style] = styles[style];}
			});
		},
		show: function(disp){
			disp || (disp='block');
			return this.each(function(){this.style.display=disp});
		},
		hide: function(){
			return this.each(function(){this.style.display='none'});
		},
		fadeIn: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				if(this.style.display!='' && this.style.display!='none'){return true;}

				this.style.display='block';this.animate([{opacity:0},{opacity:1}],dur);
				let cthis = this;setTimeout(()=>{callback.call(cthis);},dur);
			});
		},
		fadeOut: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				this.animate([{opacity:0}],dur);

				let cthis = this;setTimeout(()=>{cthis.style.display = 'none';callback.call(cthis);},dur);
			});
		},
		fadeToggle: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				this.style.display=='none' ? $(this).fadeIn(dur,callback) : $(this).fadeOut(dur,callback);
			});
		},
		slideUp: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				this.animate([{height:this.offsetHeight+'px'},{height:'0px'}],dur);

				let cthis = this;setTimeout(()=>{cthis.style.display = 'none';callback.call(cthis);},dur);
			});
		},
		slideDown: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				this.style.display = '';let elH = this.offsetHeight+'px';
				this.animate([{height:'0px'},{height:elH}],dur);

				let cthis = this;setTimeout(()=>{callback.call(cthis);},dur);
			});
		},
		slideToggle: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				this.style.display=='none' ? $(this).slideDown(dur,callback) : $(this).slideUp(dur,callback);
			});
		},
		on: function(evtName,fn){
			return this.each(function(){gQuery.event.add(this,evtName,fn);});
		},
		off: function(evtName){
			return this.each(function(){gQuery.event.remove(this,evtName);});
		},
		trigger: function(evtName,params){
			params || (params={});let ctmEvent;

			if (window.CustomEvent) {
				ctmEvent = new CustomEvent(evtName, {detail: params});
			} else {
				ctmEvent = document.createEvent('CustomEvent');
				ctmEvent.initCustomEvent(evtName, true, true, params);
			}

			return this.each(function(){this.dispatchEvent(ctmEvent);});
		},
		click: function(fn){
			if(typeof fn === 'function'){
				return this.each(function(){gQuery.event.add(this,'click',fn);});
			} else {
				return this.trigger('click');
			}
		},
		select: function(){
			switch(this[0].tagName){
				case 'INPUT':case 'TEXTAREA':this[0].select();break;
				default:window.getSelection().selectAllChildren(this[0]);
			}
			return this;
		}
	};
	gQuery.fn.init.prototype = gQuery.fn;

	gQuery.extend = gQuery.fn.extend = function(obj){for(let idx in obj){this[idx] = obj[idx];}return this;};
	gQuery.extend({
		global: (typeof window !== 'undefined' ? window : global),
		isWindow: function(obj){
			return Object.prototype.toString.call(obj)==='[object Window]';
		},
		array: {
			unique: function(arr){
				let j = {};
				arr.forEach(function(v){
					let typ = typeof v,vv=v;
					if(typ==='object'){
						(v.tagName) ? (typ='node',v = v.innerHTML) : v = JSON.stringify(v);
					}
					j[v + '::' + typ] = vv;
				});
				return Object.keys(j).map(function(v){return j[v];});
			}
		},
		event: {
			list: [],
			add: function(obj,evtName,fn){
				let objEl = obj instanceof Element,
					eid = objEl ? obj.getAttribute('gq-evt-id') : obj.gqEvtId,list;

				if(eid===null || eid===undefined){
					eid = this.list.length;
					objEl ? obj.setAttribute('gq-evt-id',eid) : obj.gqEvtId=eid;

					this.list.push({ id: eid,functions: {[evtName]:[fn]} });
				} else {
					list = this.list[eid];
					if(typeof list.functions[evtName] !== 'object'){
						list.functions[evtName] = [fn];
					} else {
						list.functions[evtName].push(fn);
					}
				}

				list = this.list[eid].functions[evtName];
				obj.addEventListener(evtName,list[ list.length-1 ],true);
			},
			remove: function(obj,evtName){
				let objEl = obj instanceof Element,
					eid = objEl ? obj.getAttribute('gq-evt-id') : obj.gqEvtId,i;
				if(eid===null || typeof this.list[eid].functions[evtName]!=='object'){return;}

				let fns = this.list[eid].functions[evtName];
				for (i = fns.length - 1; i >= 0; i--) {
					obj.removeEventListener(evtName,fns[i],true);
				}
				delete this.list[eid].functions[evtName];
			}
		},
		strToNode: function(str){
			if(typeof str === 'string'){
				let temp = document.createElement('div');
				temp.innerHTML = str;
				str = document.createDocumentFragment();
				while (temp.firstChild) {str.appendChild(temp.firstChild);}
			}
			return str;
		},
		copy: function(str){
			if(typeof str==='object'){str = $(str).text();}

			$('body').append("<textarea id='gQuery-copyTemp'>"+str+"</textarea>");
			$('#gQuery-copyTemp').select();document.execCommand("Copy");
			$('#gQuery-copyTemp').remove();
		},
		deepClone: function(obj){
			let copy = Object.create(Object.getPrototypeOf(obj)),
			propNames = Object.getOwnPropertyNames(obj);

			propNames.forEach(function(name) {
				let desc = Object.getOwnPropertyDescriptor(obj, name);
				Object.defineProperty(copy, name, desc);
			});
			return copy;
		},
		get: {
			queryParam: function(name) {
				let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
					res = window.location.search.substr(1).match(reg);
				if(res != null){return decodeURI(res[2]);}
				return null;
			}
		},
		storage: {
			local: function(){return $.global.localStorage},
			read: function(key,typ){
				if(!typ){return this.local().getItem(key);}

				let keyData = this.local().getItem(key);
				if(typ=='array' || typ=='object'){
					try{keyData = JSON.parse(keyData);} catch(err){throw new Error("Parsing!");}
				}
				return keyData;
			},
			write: function(key,data){
				(typeof data=='object') && (data = JSON.stringify(data));
				this.local().setItem(key,data);
			},
			remove: function(key){this.local().removeItem(key);},
			clear: function(){this.local().clear();},
			push: function(key,data,ext){
				let kd = this.read(key);
				if(!kd){
					data = '['+JSON.stringify(data)+']';this.write(key,data);
					return this.read(key);
				} else {
					try{
						let tkd = JSON.parse(kd);
						if( Array.isArray(tkd) ){tkd.push(data);kd = tkd;} else {
							kd = JSON.parse('['+kd+']');kd.push(data);
						}
					} catch(err){
						kd = '['+JSON.stringify(kd)+']';kd = JSON.parse(kd);
						kd.push(data);
					}
					if(ext=='unique'){kd = gQuery.array.unique(kd);}
					this.write(key,JSON.stringify(kd));
					return this.read(key,'array');
				}
			}
		}
	});
	return gQuery;
}));