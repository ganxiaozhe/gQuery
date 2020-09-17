// =================================================
//
// gQuery v1.3.2 | (c) Ganxiaozhe
// gquery.net/about/license
//
// [fn]
// seletor,each,find,parent,remove,empty,text,html,ohtml
// val,width,height,offset,prepend,append,before,after
// attr,removeAttr,hasClass,addClass,removeClass,toggleClass
// css,show,hide,fadeIn,fadeOut,fadeToggle
// slideUp,slideDown,slideToggle,on,off,trigger,click,select
//
// [extend fn]
// isWindow,isNode,strToNode,copy,deepClone
// [extend array]
// unique,finder
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
		gquery: '1.3.2',
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

			fArr = $.array.unique(fArr);
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
		remove: function(sel){
			let rthis = ( sel === undefined ? this : this.find(sel) );
			rthis.each(function(){this.parentNode.removeChild(this);});
		},
		empty: function(sel){
			let rthis = ( sel === undefined ? this : this.find(sel) );
			return rthis.each(function(){
				while(this.firstChild){this.removeChild(this.firstChild);}
			});
		},
		text: function(val){
			return this.handle.thvEach.call(this,'innerText',val);
		},
		html: function(val){
			return this.handle.thvEach.call(this,'innerHTML',val);
		},
		val: function(val){
			return this.handle.thvEach.call(this,'value',val);
		},
		ohtml: function(val){
			return this.handle.thvEach.call(this,'outerHTML',val);
		},
		width: function(val){
			if(val!==undefined){
				isNaN(val) || (val += 'px');
				return this.each(function(){this.style.width = val;});
			}

			let totalWidth = [];this.each(function(){totalWidth.push(this.offsetWidth);});
			return (totalWidth.length>1 ? totalWidth : totalWidth[0]);
		},
		height: function(val){
			if(val!==undefined){
				isNaN(val) || (val += 'px');
				return this.each(function(){this.style.height = val;});
			}

			let totalHeight = [];this.each(function(){totalHeight.push(this.offsetHeight);});
			return (totalHeight.length>1 ? totalHeight : totalHeight[0]);
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
			if(val === undefined && typeof attrs === 'string') {
				let resArr = [];this.each(function(){
					resArr.push( this.getAttribute(attrs) );
				});
				return (resArr.length>1 ? resArr : resArr[0]);
			} else {
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
			if(val !== undefined){
				return this.each(function(){this.style[styles] = val;});
			}
			if(typeof styles === 'string'){
				let _css,force = styles.substr(0,1)==='!' ? 1 : 0;
				styles = styles.replace(/^!/,'');
				let resArr = [];this.each(function(){
					_css = this.style[styles] || undefined;
					(_css===undefined && force) && (_css = window.getComputedStyle(this)[styles]);
					resArr.push( _css );
				});
				return (resArr.length>1 ? resArr : resArr[0]);
			}

			return this.each(function(){
				for(let style in styles){this.style[style] = styles[style];}
			});
		},
		show: function(disp){
			return this.each(function(){
				disp || (disp = this.style.display=='none' ? '' : 'block');
				this.style.display = disp;
			});
		},
		hide: function(){
			return this.each(function(){this.style.display='none'});
		},
		fadeIn: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				if(window.getComputedStyle(this).display!='none'){return true;}

				this.style.display='';
				window.getComputedStyle(this).display=='none' && (this.style.display='block');
				this.animate([{opacity:0},{opacity:1}],dur);
				let cthis = this;setTimeout(()=>{callback.call(cthis);},dur);
			});
		},
		fadeOut: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});
			let cthis,copa;

			return this.each(function(){
				copa = this.style.opacity || 1;
				this.animate([{opacity:copa},{opacity:0}],dur);

				cthis = this;setTimeout(()=>{cthis.style.display = 'none';callback.call(cthis);},dur);
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
		on: function(evtName,selector,fn){
			(arguments.length==2 && selector instanceof Function) && (fn = selector,selector = false);
			let appoint = function(inFn){
				return selector ? function(e){
					let nodes = this.querySelectorAll(selector),
						contain = false,tgtNode,i;

					for (i = nodes.length - 1; i >= 0; i--) {
						nodes[i].contains(e.target) && (tgtNode = nodes[i],contain = true);
					}
					contain && ( inFn.call(tgtNode) );
				} : inFn;
			};

			if(typeof fn === 'function'){
				let newfn = appoint(fn);
				return this.each(function(){gQuery.event.add(this,evtName,newfn);});
			}

			return this.each(function(){
				for(let evt in evtName){
					let newfn = appoint(evtName[evt]);
					gQuery.event.add(this,evt,newfn);
				}
			});
		},
		off: function(evtName){
			return this.each(function(){gQuery.event.remove(this,evtName);});
		},
		trigger: function(evtName,params){
			params || (params={});
			let ctmEvent = new CustomEvent(evtName, {detail: params});

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
	gQuery.fn.extend({
		handle: {
			thvEach: function(prop,val){
				let isArr = Array.isArray(val);

				if(val === undefined || (isArr && val.length==0) ) {
					let resArr = [];this.each(function(){resArr.push(this[prop]);});
					return (isArr ? resArr : resArr.join(''));
				}
				return isArr ? this.each(function(idx){this[prop] = val[idx];}) :
				 this.each(function(){this[prop] = val;});
			}
		}
	});
	gQuery.extend({
		global: (typeof window !== 'undefined' ? window : global),
		isWindow: function(obj){
			return Object.prototype.toString.call(obj)==='[object Window]';
		},
		isNode: function(obj){
			let str = Object.prototype.toString.call(obj);
			return (str.indexOf('HTML')>-1 && str.indexOf('Element')>-1) ? true : false;
		},
		array: {
			unique: function(arr,typ){
				let j = {},isNode = $.isNode(arr[0]);
				if(typ=='node' || isNode){
					return arr.filter(function(item, index, arr) {
						return arr.indexOf(item, 0) === index;
					});
				}

				arr.forEach(function(v){
					let vtyp = typeof v,vv=v;
					if(vtyp==='object'){v = JSON.stringify(v);}
					j[v + '::' + vtyp] = vv;
				});
				return Object.keys(j).map(function(v){return j[v];});
			},
			finder: function(arr,finder){
				let isObj = (typeof finder === 'object'),resame;
				for (let i = 0; i < arr.length; i++) {
					if(isObj){
						resame = true;
						for(let obj in finder){arr[i][obj]==finder[obj] || (resame = false);}
						if(resame){return {index:i,array:arr[i]};}
					} else {
						if(arr[i]==finder){return {index:i,array:arr[i]};}
					}
				}
				return null;
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