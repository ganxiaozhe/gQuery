// =================================================
//
// Cabbage.gQuery.js v0.2.2
// (c) 2020, JU Chengren (Ganxiaozhe)
// Released under the MIT License.
// gquery.net/plugins/cabbage
//
// =================================================
;(function(){
	'use strict';
	if(!$ || !gQuery){throw new Error('Cabbage.js need gQuery: https://gquery.net/');}

	let cabbage = {
		menus: [],
		i: {},
		// 将 Data json array 转为 Html
		dataToHtml: function(data){
			let t = {sel: window.getSelection().toString() || ''};
			cabbage.i.selText = t.sel;
			t.html = data.reduce((tax,cur,idx)=>{
				if(cur.break){return tax + "<li class='break'></li>";}

				// selection 与 [:sel]
				if(cur.selection && !t.sel){return tax+'';}
				t.text = cur.text.replace(/\[\:sel\]/g, t.sel).substr(0, 32);

				if(cur.disable){return tax + "<li class='disable'>"+t.text+"</li>";}

				t.cls = ['i'];
				typeof cur.data=='object' && (t.cls.push('extra'));

				return tax + "<li class='"+t.cls.join(' ')+"' data-i='"+idx+"'>"+t.text+"</li>";
			},'');
			return t.html;
		},
		posHandle: function(_obj, _e){
			let pos = {
				winW: window.innerWidth, winH: window.innerHeight,
				menuW: _obj.offsetWidth, menuH: _obj.offsetHeight,
				eX: _e.pageX, eY: _e.pageY,
				margin: 10
			}, _pos = {top: 0, left: 0};
			pos.winH += document.body.scrollTop==0?document.documentElement.scrollTop:document.body.scrollTop;
			pos.x = pos.menuW + pos.eX + pos.margin;
			pos.y = pos.menuH + pos.eY + pos.margin;

			_pos.top = pos.eY + pos.margin, _pos.left = pos.eX + pos.margin;
			if(pos.x >= pos.winW && pos.y >= pos.winH){
				_pos.top = pos.eY - pos.menuH - pos.margin;
				_pos.left = pos.eX - pos.menuW - pos.margin;
			} else if(pos.x >= pos.winW){
				_pos.left = pos.eX - pos.menuW - pos.margin;
			} else if(pos.y >= pos.winH){
				_pos.top = pos.eY - pos.menuH - pos.margin;
			}
			return _pos;
		},
		liHandle: function(_obj){
			let cabb = {
				menu: $(_obj).parent().parent(), trigger: $('.cabbage-active'),
				idx: $(_obj).attr('data-i')
			};
			// 子菜单栏目
			if(cabb.menu.attr('id')!='cabbageMenu'){
				cabb.data = cabb.menu.data('cabbageMenu');
			} else {cabb.data = cabb.trigger.data('cabbageMenu');}

			return cabb;
		},
		extraMenuClear: function(){
			clearTimeout(cabbage.i.emDelay);clearTimeout(cabbage.i.emClear);

			cabbage.i.emClear = setTimeout(()=>{	
				let menus = cabbage.menus, i, $obj, len = cabbage.i.thisMI ? cabbage.i.thisMI : 0;

				for (i = menus.length - 1; i >= len; i--) {
					$obj = $('#'+menus[i].idText);
					if($obj.length>0){
						$obj.remove();
					}
				}
			},200);
		}
	};


	$.fn.extend({cabbage: function(data){
		if(typeof data === 'object' && Array.isArray(data)){
			this.data({cabbageMenu:data});
		}

		this.on('contextmenu', function(e){
			e.preventDefault();e.stopPropagation();
			this.classList.add('cabbage-active');

			let menu = {obj: $(this), html: ''};
			menu.data = menu.obj.data('cabbageMenu');
			if(!menu.data){return false;}

			menu.html = "<div id='cabbageMenu' class='cabbageMenu'><ul>"+cabbage.dataToHtml(menu.data)+"</ul></div>";

			$('.cabbageMenu').remove();
			if(menu.data.length<1){return;}

			$('body').append(menu.html);
			menu.pos = cabbage.posHandle($('#cabbageMenu')[0], e);
			$('#cabbageMenu').css({top: menu.pos.top+'px', left: menu.pos.left+'px'});
			// 禁止右键后滚动页面
			$('body').on('mousewheel.cabbageJs', function(e){e.preventDefault();}, {passive: false});

			function reCabbage(){
				$('.cabbage-active').removeClass('cabbage-active');
				$('.cabbageMenu').remove();cabbage.menus = [];
				$('body').off('mousewheel.cabbageJs');
			}

			$(document).off('click.cabbageMenu').off('contextmenu.cabbageMenu').on({
				'click.cabbageMenu': reCabbage,
				'contextmenu.cabbageMenu': reCabbage
			});
		});
	}});

	/*!
	 * 点击菜单子栏目处理
	 */
	$(document).on('click.Always', '.cabbageMenu ul li', function(){
		let cabb = cabbage.liHandle(this);
		if(cabb.idx===undefined){return false;}

		cabb.func = cabb.data[cabb.idx].func;
		cabb.opts = {selText: cabbage.i.selText};
		if(typeof cabb.func === 'function'){cabb.func.call(cabb.trigger[0], cabb.opts);}
	});

	/*!
	 * .extra 拓展子菜单处理
	 */
	$(document).on({
		mouseover: function(){
			if(!$(this).hasClass('i')){return;}

			let mid = $(this).data('menuId'), em, _this = this;
			if(mid===undefined){
				mid = cabbage.menus.length+1;
				em = {id: mid, idText: 'cabbageMenu'+mid, obj: $(this)};
				cabbage.menus.push(em);
				$(this).data('menuId', mid);
			} else {
				em = $.array.finder(cabbage.menus, {id: mid}).array;
			}

			if( $('#'+em.idText).length>0 ){
				clearTimeout(cabbage.i.emClear);return;
			}

			cabbage.i.emDelay = setTimeout(()=>{
				let menu = cabbage.liHandle(em.obj);
				if(!menu.data){console.log('[Cabbage.js] empty menu data.');return;}
				menu.extra = menu.data[menu.idx].data;

				menu.html = "<div id='"+em.idText+"' class='cabbageMenu extra'><ul>"+
					cabbage.dataToHtml(menu.extra)+
				"</ul></div>";
				menu.pos = em.obj.offset();
				menu.pos.top -= 8;
				menu.pos.left += em.obj.width()+1;

				$('body').append(menu.html);
				$('#'+em.idText).css({top: menu.pos.top+'px', left: menu.pos.left+'px'}).on({
					mouseover: function(){
						cabbage.i.thisMI = parseInt( $(this).attr('id').replace('cabbageMenu','') );
					},
					mouseleave: function(){
						cabbage.i.thisMI = 0;
						cabbage.extraMenuClear();
					}
				}).data('cabbageMenu', menu.extra);
			},500);
		},
		mouseleave: function(){
			cabbage.extraMenuClear();
		}
	}, '.cabbageMenu ul li.extra');
})();