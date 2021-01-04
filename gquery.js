// =================================================
//
// gQuery.js v1.4.6
// (c) 2020-present, JU Chengren (Ganxiaozhe)
// Released under the MIT License.
// gquery.net/about/license
//
// [fn]
// init,each,find,eq,parent,remove,empty
// text,html,ohtml,val,width,height,offset
// prepend,append,before,after
// attr,removeAttr,data,removeData
// hasClass,addClass,removeClass,toggleClass
// css,show,hide,fadeIn,fadeOut,fadeToggle
// slideUp,slideDown,slideToggle,on,off,trigger
// click,select,load
//
// [extend fn]
// isPlainObject,isWindow,isNode,strToNode,copy,fetch
// [extend array]
// unique,finder
// [extend event]
// add,remove
// [extend get]
// browserSpec,queryParam,json
// [extend parse]
// json
// [extend cookie]
// set,get,remove
// [extend storage]
// local,set,get,remove,clear,push
// [extend sessionStorage]
// local,set,get,remove,clear,push
//
// =================================================
;(function(global, factory){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = window || self, global.gQuery = global.$ = factory());

	if(!!window.ActiveXObject || "ActiveXObject" in window){
		window.location.href = 'https://www.gquery.net/kill-ie?back='+(window.location.href);
	}

	console.log('%c gQuery 1.4.6 %c www.gquery.net \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');
}(window, function(){
	'use strict';
	let gQuery = function(selector, context){
		return new gQuery.fn.init(selector, context);
	};

	gQuery.fn = gQuery.prototype = {
		constructor: gQuery,
		gquery: '1.4.6',
		init: function(sel, opts){
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
		each: function(arr, callback){
			callback || (callback = arr,arr = this);
			for(let i = 0,len = arr.length; i < len; i++){
				if(callback.call(arr[i], i, arr[i-1]) == false){break;}
			}
			return this;
		},
		find: function(sel){
			let finder = gQuery.extend({},this),fArr = [],i;
			this.each(function(idx){
				let elems = this.querySelectorAll(sel);
				for (i = 0; i < elems.length; i++) {fArr.push(elems[i]);}
				delete finder[idx];
			});

			fArr = $.array.unique(fArr);
			finder.length = fArr.length;
			for (i = fArr.length - 1; i >= 0; i--) {finder[i] = fArr[i];}
			return finder;
		},
		eq: function(idx){return $(this[idx]);},
		parent: function(){
			let _this = this;
			return this.each(function(idx){_this[idx] = this.parentNode;});
		},
		next: function(sel){
			let _this = this,_idx = 0;
			this.each(function(idx){
				if(this.nextElementSibling === null){
					delete _this[idx];
				} else {_this[_idx] = this.nextElementSibling, _idx++;}
			});

			for (let i = _idx,len = _this.length; i < len; i++) {
				delete _this[i];_this.length--;
			}
			return _this;
		},
		remove: function(sel){
			let rthis = ( sel === undefined ? this : this.find(sel) );
			return rthis.each(function(){this.parentNode.removeChild(this);});
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
		offset: function(typ){
			let rect = this[0].getBoundingClientRect(), spos = {
				top: document.body.scrollTop==0?document.documentElement.scrollTop:document.body.scrollTop,
				left: document.body.scrollLeft==0?document.documentElement.scrollLeft:document.body.scrollLeft
			};
			typ && (spos.top=0, spos.left=0);
			
			return {
				top: rect.top + spos.top, left: rect.left + spos.left
			}
		},
		append: function(elem){
			return this.each(function(){this.appendChild( $.strToNode(elem) );});
		},
		prepend: function(elem){
			return this.each(function(){this.prepend( $.strToNode(elem) );});
		},
		before: function(elem){
			return this.each(function(){this.before( $.strToNode(elem) );});
		},
		after: function(elem){
			return this.each(function(){this.after( $.strToNode(elem) );});
		},
		attr: function(attrs,val){
			if(val === undefined && typeof attrs === 'string') {
				let resArr = [],attr;this.each(function(){
					attr = this.getAttribute(attrs);attr===null&&(attr=undefined);
					resArr.push( attr );
				});
				return (resArr.length>1 ? resArr : resArr[0]);
			}

			if(typeof attrs === 'object'){
				return this.each(function(){
					for(let idx in attrs){this.setAttribute(idx, attrs[idx]);}
				});
			}
			return this.each(function(){this.setAttribute(attrs, val);});
		},
		removeAttr: function(attr){
			return this.each(function(){this.removeAttribute(attr);});
		},
		data: function(keys,val){
			if(typeof keys !== 'object' && val === undefined) {
				let resArr = [];this.each(function(){
					this.gQueryData===undefined&&(this.gQueryData={});
					typeof keys === 'string' ? resArr.push( this.gQueryData[keys] ) : resArr.push( this.gQueryData );
				});
				return (resArr.length>1 ? resArr : resArr[0]);
			}

			return this.each(function(){
				this.gQueryData===undefined&&(this.gQueryData={});
				if(typeof keys === 'object'){
					for(let idx in keys){this.gQueryData[idx] = keys[idx];}
				} else {this.gQueryData[keys] = val;}
			});
		},
		removeData: function(key){
			return this.each(function(){
				this.gQueryData===undefined&&(this.gQueryData={});
				delete this.gQueryData[key];
			});
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
				let _css, force = styles.substr(0,1)==='!' ? 1 : 0;
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
				this.style.display='';
				window.getComputedStyle(this).display=='none' && (this.style.display='block');
				typeof this.animate==='function' && this.animate([{opacity:0},{opacity:1}],dur);
				let cthis = this;setTimeout(()=>{callback.call(cthis);},dur);
			});
		},
		fadeOut: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				let copa = this.style.opacity || 1;
				typeof this.animate==='function' && this.animate([{opacity:copa},{opacity:0}],dur);

				let cthis = this;
				setTimeout(()=>{cthis.style.display = 'none';},dur-1);
				setTimeout(()=>{callback.call(cthis);},dur);
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

			setTimeout(()=>{callback.call(this);},dur);
			return this.each(function(){
				typeof this.animate==='function' && this.animate([{height:this.offsetHeight+'px'},{height:'0px'}],dur);

				let gthis = $(this);
				setTimeout(()=>{gthis.css({display:'none', height:'0px'});},dur-1);
			});
		},
		slideDown: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});
			let elH;setTimeout(()=>{callback.call(this);},dur);

			return this.each(function(){
				if( window.getComputedStyle(this).height!=='0px' ){return;}

				this.style.display = '';this.style.height = '';
				elH = this.offsetHeight+'px';
				typeof this.animate==='function' && this.animate([{height:'0px'},{height:elH}],dur);
			});
		},
		slideToggle: function(dur,callback){
			dur || (dur=500);typeof callback === 'function' || (callback=function(){});

			return this.each(function(){
				this.style.display=='none' ? $(this).slideDown(dur,callback) : $(this).slideUp(dur,callback);
			});
		},
		on: function(evtName, selector, fn, opts){
			(arguments.length==3 && typeof fn !== 'function') && (opts = fn,fn = selector,selector = false);
			if(arguments.length==2){
				if(typeof selector === 'function'){
					fn = selector,selector = false;
				} else if(typeof selector === 'object'){opts = selector,selector = false;}
			}

			// 处理事件委托
			let appoint = function(inFn){
				return selector ? function(e){
					let nodes = this.querySelectorAll(selector),
						contain = false,tgtNode,i;

					for (i = nodes.length - 1; i >= 0; i--) {
						nodes[i].contains(e.target) && (tgtNode = nodes[i],contain = true);
					}
					contain && ( inFn.call(tgtNode) );
				} : inFn;
			},cfn;

			if(typeof fn === 'function'){
				cfn = appoint(fn);
				return this.each(function(){gQuery.event.add(this, evtName, cfn, opts);});
			}

			return this.each(function(){
				for(let evt in evtName){
					cfn = appoint(evtName[evt]);
					gQuery.event.add(this, evt, cfn, opts);
				}
			});
		},
		off: function(evtName,opts){
			opts===undefined && (opts = false);
			return this.each(function(){gQuery.event.remove(this, evtName, opts);});
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
			switch( this[0].tagName.toLowerCase() ){
				case 'input':case 'textarea':
					this[0].select();break;
				default:window.getSelection().selectAllChildren(this[0]);
			}
			return this;
		},
		load: function(url, data, func){
			let _this = this;
			typeof data === 'function' && (func=data, data=false);

			$.fetch(url, data, 'text').then(function(resp){
				_this.html( resp );
				typeof func === 'function' && func.call( _this );
			});
		}
	};
	gQuery.fn.init.prototype = gQuery.fn;



	gQuery.fn.extend = function(obj){for(let idx in obj){this[idx] = obj[idx];}return this;};
	gQuery.fn.extend({
		handle: {
			thvEach: function(prop, val){
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



	gQuery.extend = function(obj){
		if(arguments.length==1){
			for(let idx in obj){this[idx] = obj[idx];}return this;
		}

		let deep = false, length = arguments.length, i = 1,
			name, options, src, copy, clone, copyIsArray,
			target = arguments[0] || {};
		if (typeof target == 'boolean') {
			deep = target;target = arguments[i] || {};i++;
		}
		if (typeof target !== "object") {target = {};}

		for (; i < length; i++) {
			options = arguments[i];
			if(options == null){continue;}

			for (name in options) {
				src = target[name];
				copy = options[name];

				// 解决循环引用
				if (target === copy) {continue;}
				// 要递归的对象必须是 plainObject 或者数组
				if ( deep && copy && (gQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy))) ) {
					// 要复制的对象属性值类型需要与目标属性值相同
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && gQuery.isPlainObject(src) ? src : {};
					}
					target[name] = gQuery.extend(deep, clone, copy);
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
	    }
	    return target;
	};
	gQuery.extend({
		copy: function(str){
			if(typeof str==='object'){str = $(str).text();}

			$('body').append("<textarea id='gQuery-copyTemp'>"+str+"</textarea>");
			$('#gQuery-copyTemp').select();document.execCommand("Copy");
			$('#gQuery-copyTemp').remove();
		},
		fetch: function(url, data, bodyMH){
			let _mh = {method: 'GET'};
			typeof url === 'object' && (_mh = $.extend(_mh, url),url = url.url);

			if(typeof data === 'object'){
				_mh.method = 'POST';_mh.body = new FormData();
				for(let nm in data){
					_mh.body.append(nm, data[nm]);
				}
			} if(typeof data === 'string'){bodyMH = data;}

			if(!bodyMH){return fetch(url, _mh);}
			return fetch(url, _mh).then(res => {
				if(res.ok){return res[bodyMH]();}
				throw new Error('Network response was not ok.');
			}).catch(err => {throw new Error(err);});
		},
		global: (typeof window !== 'undefined' ? window : global),
		isWindow: function(obj){
			return Object.prototype.toString.call(obj)==='[object Window]';
		},
		isNode: function(obj){
			let str = Object.prototype.toString.call(obj);
			return (str.indexOf('HTML')>-1 && str.indexOf('Element')>-1) ? true : false;
		},
		isPlainObject: function(obj){
			let prototype;

			return Object.prototype.toString.call(obj) === '[object Object]' 
				&& (prototype = Object.getPrototypeOf(obj), prototype === null || 
				prototype == Object.getPrototypeOf({}));
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
		ui: "缺少 UI 组件，请前往 https://www.gquery.net/ui/ 下载"
	});



	gQuery.array = {
		unique: function(arr, typ){
			let j = {};
			if( typ=='node' || $.isNode(arr[0]) ){
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
		finder: function(arr, finder, opts){
			typeof opts === 'object' || (opts = {});
			opts.limit === undefined && (opts.limit=1);

			let isObj = (typeof finder === 'object'),resame,resArr = [];
			for (let i = 0; i < arr.length; i++) {
				if(isObj){
					resame = true;
					for(let obj in finder){arr[i][obj]==finder[obj] || (resame = false);}
					resame && resArr.push( {index:i,array:arr[i]} );

					if(opts.limit>0 && resArr.length>=opts.limit){break;}
				} else {
					arr[i]==finder && resArr.push( {index:i,array:arr[i]} );
					if(opts.limit>0 && resArr.length>=opts.limit){break;}
				}
			}

			if(opts.array){return resArr;}
			return resArr.length>1 ? resArr : resArr[0];
		}
	};

	gQuery.cookie = {
		get: function(key, json){
			let jar = {}, i = 0,
				cookies = document.cookie ? document.cookie.split('; ') : [];
			function decode(s){return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);}

			for (; i < cookies.length; i++) {
				let parts = cookies[i].split('=');
				let cookie = parts.slice(1).join('=');
				if (!json && cookie.charAt(0) === '"') {cookie = cookie.slice(1, -1);}

				try {
					let name = decode(parts[0]);cookie = decode(cookie);

					if(json){try {cookie = JSON.parse(cookie);} catch(e){}}
					jar[name] = cookie;

					if(key === name){break;}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		},
		set: function(key, value, attributes){
			attributes = $.extend({path: '/'}, attributes);
			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			let stringifiedAttrs = '';
			for (let attrName in attributes) {
				if (!attributes[attrName]) {continue;}
				stringifiedAttrs += '; ' + attrName;

				if (attributes[attrName] === true) {continue;}
				stringifiedAttrs += '=' + String(attributes[attrName]).split(';')[0];
			}

			typeof value==='object' && (value = JSON.stringify(value));
			return (document.cookie = key + '=' + value + stringifiedAttrs);
		},
		remove: function(key, attributes){
			$.cookie.set(key, '', $.extend(attributes, {expires: -1}));
		}
	};

	gQuery.event = {
		add: function(obj, evtName, fn, opts){
			typeof opts === 'object' || (opts={});
			opts.capture === undefined && (opts.capture=true);

			let events = obj.gQueryEvents, evtObj = {fn:fn,opts:opts};

			if(events===undefined){
				events = {[evtName]:[ evtObj ]};
			} else {
				if(typeof events[evtName] !== 'object'){
					events[evtName] = [evtObj];
				} else {
					events[evtName].push(evtObj);
				}
			}

			obj.gQueryEvents = events;
			let event = events[evtName][ events[evtName].length-1 ];
			obj.addEventListener(evtName, event.fn, event.opts);
		},
		remove: function(obj, evtName, opts){
			let events = obj.gQueryEvents,i;
			if(events===undefined || typeof events[evtName]!=='object'){return;}

			let fns = events[evtName],ropts;
			for (i = fns.length - 1; i >= 0; i--) {
				ropts = opts ? opts : {};
				ropts.capture === undefined && (ropts.capture=true);
				if( JSON.stringify(ropts) != JSON.stringify(fns[i].opts) ){continue;}

				obj.removeEventListener(evtName, fns[i].fn, ropts);
			}
			delete events[evtName];
		}
	};

	gQuery.get = {
		browserSpec: function(){
			let ua = navigator.userAgent, tem,
				M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

			if(/trident/i.test(M[1])){
				tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
				return {name:'IE',version:(tem[1] || '')};
			}
			if(M[1]=== 'Chrome'){
				tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
				if(tem != null) return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};
			}
			M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];

			if((tem = ua.match(/version\/(\d+)/i))!= null){M.splice(1, 1, tem[1]);}
			return {
				name: M[0], version: M[1],
				isMobile: /Mobi/i.test(ua),
				touchPoints: (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement || 0)
			};
		},
		queryParam: function(name){
			let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
				res = window.location.search.substr(1).match(reg);
			if(res != null){return decodeURI(res[2]);}
			return null;
		},
		json: function(url, data){
			return $.fetch(url, data, 'text').then(data => {
				return $.parse.json(data);
			});
		}
	};

	gQuery.parse = {
		json: function(str){
			let json;
			try{json = JSON.parse(str);} catch(err){}
			try{
				if(!json){json = Function('"use strict";return (' + str + ')')();}
			} catch(err){console.error(err);json = str;}

			return json;
		}
	};

	gQuery.storage = {
		local: function(){return $.global.localStorage},
		set: function(key, data){
			(typeof data=='object') && (data = JSON.stringify(data));
			this.local().setItem(key,data);
		},
		get: function(key, typ){
			if(!typ){return this.local().getItem(key);}

			let keyData = this.local().getItem(key);
			if(typ=='array' || typ=='object'){
				try{keyData = JSON.parse(keyData);} catch(err){throw new Error("Parsing!");}
			}
			return keyData;
		},
		remove: function(key){this.local().removeItem(key);},
		clear: function(){this.local().clear();},
		push: function(key, data, ext){
			let kd = this.get(key);
			if(!kd){
				data = '['+JSON.stringify(data)+']';this.set(key,data);
				return this.get(key);
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
				if(ext=='unique'){kd = $.array.unique(kd);}
				this.set(key,JSON.stringify(kd));
				return this.get(key,'array');
			}
		}
	};
	gQuery.sessionStorage = gQuery.extend({}, gQuery.storage);
	gQuery.sessionStorage.local = function(){return $.global.sessionStorage};

	return gQuery;
}));