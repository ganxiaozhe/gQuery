// ==================================================
// GXZMarkDownEditor v1.2.5 (GMDE)
// 
// 采用 GPLv3 许可证供开源使用
// 或用于商业用途的 GMDE 商业许可证
// 所有商业应用程序（包括您计划出售的网站，主题和应用程序）
// 都需要具有商业许可证。
//
// Licensed GPLv3 for open source use
// or GMDE Commercial License for commercial use
//
// Copyright 2020 Ganxiaozhe
// https://www.gquery.net/gmde/
//
// ==================================================
;(function($, factory){
	if(!$){return '缺少gQuery！';}
	if(typeof global === 'undefined'){var global;}

	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = window || self, global.geditor = factory());

	console.log('%c GMDE v1.2.5 %c https://www.gquery.net/plugins/gmde/ \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');
}(gQuery, function(){
	'use strict';
	var geditor = function(id,opts){
		return new geditor.fn.init(id,opts);
	};

	var extMgmt = {
		alert: function(opts){
			if(typeof opts !== 'object') {return 'empty object';}
			opts.yes || (opts.yes = function(){});opts.no || (opts.no = function(){});
			opts.yesT || (opts.yesT='确定');opts.noT || (opts.noT='取消');

			this.id ? this.id++ : this.id=1;

			let _this = this;
			let html = "<div class='gl-overlay g-dialog'><div class='ly-block-fixed'><div class='ly-head'>"+opts.title+"</div><div class='ly-body'>"+opts.message+"</div><div class='ly-footer noSelect'><button type='button' class='ly-btn btn-gray dialog-no-"+_this.id+"'><i class='gi icon-cancel' aria-hidden='true'></i>"+opts.noT+"</button><button type='button' class='ly-btn btn-aqua dialog-yes-"+_this.id+"'><i class='gi icon-ok' aria-hidden='true'></i>"+opts.yesT+"</button></div></div></div>";
			$('body').append(html);
			$('.g-dialog').fadeIn(500);
			// 确定按钮
			$('.dialog-yes-'+_this.id).click(function(){
				opts.yes();
				$(this).parent().parent().parent().fadeOut(500,function(){
					$(this).remove();
				});
			});
			// 取消按钮
			$('.dialog-no-'+_this.id).click(function(){
				opts.no();
				$(this).parent().parent().parent().fadeOut(500,function(){
					$(this).remove();
				});
			});
		},
		codeboxParse: function(spl){
			let t = {},i;
			spl || (spl='\n');
			$('.gcode-autoParse:not([data-gpbind])').each(function(){
				let codes = this.innerHTML.toString().split(spl);
				t.lang = $(this).attr('data-lang') || 'Text';
				t.h = "<div class='gtab-box'><div class='code-nav'><div class='codelang'>"+t.lang+"</div><i class='gi icon-edit-1 opt-copy' title='复制'></i></div><table class='code-list'>";
				for (i = 0; i < codes.length; i++) {
					t.ln = i+1;
					t.first = codes[i].substr(0,1);
					if(t.first=='#'){
						codes[i] = "<span class='gc-remark'>"+codes[i]+"</span>";
					}
					t.h += "<tr><td class='num'>"+t.ln+"</td><td class='code'>"+codes[i]+"</td></tr>";
				}
				t.h += "</table></div>";
				this.innerHTML = t.h;
			}).attr('data-gpbind','1');

			$('.gcode-autoParse .opt-copy:not([data-gpbind])').on('click',function(){
				let codes = $(this).parent().parent().find('.code-list .code');
				t.copy = "";
				for (i = 0; i < codes.length; i++) {
					t.c = codes[i].innerText;
					t.first = t.c.substr(0,1);
					if(t.first=='#'){continue;}
					t.copy += (t.copy=="" ? t.c : "\n"+t.c);
				}
				$.copy(t.copy);
			}).attr('data-gpbind','1');
		}
	};

	geditor.prototype = geditor.fn = {
		init: function(id,opts){
			opts = opts || {};
			if(typeof id === 'object'){this.id = $(id).attr('id');} else {this.id = id;}
			if($('#'+this.id).length<1){return false;}

			if(opts.pushHTML!=0){
				$('#'+this.id).html("<div class='gmde-tool-bar'>"+
					"<div class='toolBtn gedt-bold' title='加粗强调'><i class='gi icon-bold'></i></div>"+
					"<div class='toolBtn gedt-italic' title='斜体'><i class='gi icon-italic'></i></div>"+
					"<div class='toolBtn gedt-noun' title='添加名词、行内代码、或强调'><i class='gi icon-info-1'></i></div>"+
					"<div class='toolBtn gedt-url' title='添加超链接'><i class='gi icon-weibiaoti-'></i></div>"+
					"<div class='toolBtn gedt-img' title='添加图片'><i class='gi icon-pic'></i></div>"+
					"<div class='toolBtn gedt-video' title='添加视频'><i class='gi icon-record'></i></div>"+
					"<div class='toolBtn gedt-code' title='添加代码块'><i class='gi icon-code'></i></div>"+
					"<div class='toolBtn gedt-quote' title='添加引用'><i class='gi icon-angle-double-right'></i></div>"+
					"<div class='toolBtn gedt-save btn-hide' title='保存'><i class='gi icon-history'></i></div>"+
				"</div>"+
				"<div class='gmde-msg-bar'>"+
					"<div class='msg-el'>Ganxiaozhe MarkDown Editor.</div>"+
				"</div>"+
				"<textarea class='gmde-input' maxlength='8000'></textarea>");
			}

			var _this = this,t = {};
			$('#'+this.id).addClass('gmde-container');
			this.input = $('#'+this.id).find('.gmde-input');
			this.msg = $('#'+this.id).find('.gmde-msg-bar');
			this.preview = '';
			this.length = {max:-1,min:0};
			// 默认自动保存
			this.autoSave = {sec:30};
			// 默认关闭上传功能
			this.upload = {
				img:{allow:false,maxLen:20,maxSize:1024*1024,act:'gmde'}
			};
			this.upImgs = [];

			this.oss = {
				accessid:"",accesskey:"",host:"",policyBase64:"",signature:"",
				callbackbody:"",filename:"",key:"",expire:0,now: Date.parse(new Date()) / 1000
			};

			var updateHandle = function(){
				_this.updateHandle();
			}

			this.input.on('input',updateHandle);
			this.updateSecHandle();

			$('.gmde-tool-bar .gedt-bold').click(()=>{
				var selection = _this.getSelection() || '加粗';
				_this.pushSelection('\*\*'+selection+'\*\*');
			});
			$('.gmde-tool-bar .gedt-italic').click(()=>{
				var selection = _this.getSelection() || '斜体';
				_this.pushSelection('\*'+selection+'\*');
			});
			$('.gmde-tool-bar .gedt-noun').click(()=>{
				var selection = _this.getSelection() || '强调';
				_this.pushSelection('`'+selection.replace(/`/g,'')+'`');
			});
			$('.gmde-tool-bar .gedt-code').click(()=>{
				var selection = _this.getSelection() || '代码';
				t.val = _this.input.val();
				var endSel = _this.input[0].selectionEnd;
				endSel = t.val.charAt(endSel-1);

				t.str = ( endSel=='\n' || t.val=='' ? '```Text' : '\n```Text' );

				_this.pushSelection([t.str,selection,'```'].join('\n'));
			});
			$('.gmde-tool-bar .gedt-quote').click(()=>{
				var selection = _this.getSelection() || '引用';
				t.val = _this.input.val();
				var endSel = _this.input[0].selectionEnd;
				endSel = t.val.charAt(endSel-1);

				t.str = ( endSel=='\n' || t.val=='' ? '>>>' : '\n>>>' );

				_this.pushSelection([t.str,selection,'>>>'].join('\n'));
			});
			$('.gmde-tool-bar .gedt-url').click(()=>{
				var selection = _this.getSelection();
				extMgmt.alert({
					title:'添加超链接',message:"<input class='gl-form fluid' id='mgedt-url' value='https://'/><input class='gl-form fluid mt-2' id='mgedt-urlName' placeholder='链接名' value='"+selection+"'/>",
					yes:function(){
						var url = {url:$('#mgedt-url').val(),name:$('#mgedt-urlName').val()};
						if(!url.url){return;}
						url.name || (url.name=url.url);

						_this.pushSelection('['+url.name+']('+url.url+')');
					}
				});
			});
			$('.gmde-tool-bar .gedt-img').click(()=>{
				var selection = _this.getSelection();
				extMgmt.alert({
					title:"<span class='mgedtNav-img' data-type='url'>添加网络图片</span><span class='mgedtNav-img' data-type='upload'>上传本地图片</span>",
					message:"<div id='mgedtExt-imgURL'><input class='gl-form fluid' id='mgedt-img' value='https://'/><input class='gl-form fluid mt-2' id='mgedt-imgAlt' placeholder='图片介绍' value='"+selection+"'/></div>"+
					"<div id='mgedtExt-imgUpload'><div class='ge-fileup'>"+
						"<div class='picup-tip'>"+
							"<i class='gi icon-picfill'></i>"+
							"<div class='mark-file-tip'>将图片拖拽到此，或单击直接上传</div>"+
						"</div>"+
						"<input type='file' id='mgedt-imgUpload' class='btn-fileup' />"+
					"</div><div id='mgedtExt-imgUpPre'>"+
					"</div></div>",
					yes:function(){
						var img = {url:$('#mgedt-img').val(),alt:$('#mgedt-imgAlt').val()};
						if(!img.url){return;}
						img.alt || (img.alt=img.url);

						let tpye = $('.g-dialog .mgedtNav-img.active').attr('data-type');
						if(tpye=='upload'){return false;}

						if(!/\.(gif|jpg|jpeg|png|GIF|JPEG|JPG|PNG)$/.test(img.url)){
							_this.pushSelection("!["+img.alt+"]("+img.url+")");
							_this.pushMsg("该链接看起来不像是图片，请检查它是否能正常加载",'new');return false;
						}

						if(typeof $.fn.gazeimg==='function'){
							mgedtExt.imgAdd(img.url, img.alt);return;
						}

						_this.pushSelection("!["+img.alt+"]("+img.url+")");
						_this.pushMsg("当前并未引入 GazeImg，图片将直接添加",'new');return false;
					}
				});

				$('.g-dialog .mgedtNav-img').click(function(){
					if( $(this).hasClass('active') ){return true;}

					t.type = $(this).attr('data-type');
					$('.g-dialog .mgedtNav-img').removeClass('active');
					$(this).addClass('active');

					if(t.type=='url'){
						$('#mgedtExt-imgUpload').hide();$('#mgedtExt-imgURL').show();
					} else {
						if(!_this.upload.img.allow){
							extMgmt.alert({title:'提示',message:'Sorry，该页面不允许上传本地图片！'});
							$('.g-dialog .mgedtNav-img[data-type="url"]').click();
							return false;
						}
						$('#mgedtExt-imgURL').hide();$('#mgedtExt-imgUpload').show();
					}
				});
				$('.g-dialog .mgedtNav-img[data-type="url"]').click();

				// 图片上传操作
				$('#mgedt-imgUpload').on('change',function(){
					let files = this.files;
					let i,names = [];
					for (i = 0; i < _this.upImgs.length; i++) {
						names.push( _this.upImgs[i].name );
					}
					for (i = 0; i < files.length; i++) {
						if ( jQuery.inArray(files[i].name,names) > -1 ) {
							extMgmt.alert({title:'提示',message:'Oooooops，请不要重复上传相同图片！'});continue;
						}
						if ( !/image\/\w+/.test(files[i].type) ) {
							extMgmt.alert({title:'提示',message:'Oooooops，只接受图片格式文件噢！'});continue;
						}

						mgedtExt.imgHandle(files[i]);
					} // for END
					$('#mgedt-imgUpload').val('');
				});
				// 显示之前上传的图片
				mgedtExt.imgPreview();
			});
			let mgedtExt = {
				imgAdd(url,alt){
					alt || (alt = url);
					let il_ = new Image();
					il_.alt = alt;
					il_.src = url;
					_this.pushMsg("正在解析图片 "+url,'new');

					if(il_.complete){
						_this.pushSelection("!["+il_.alt+"]("+il_.src+" size='"+il_.width+"px,"+il_.height+"px')");
						_this.pushMsg("图片解析成功！已为其自动添加尺寸信息",'new');
					} else {
						il_.onerror = function(){
							_this.pushMsg("图片 "+il_.src+" 资源无法访问，解析失败！",'new');
							il_.onload = null;
						};

						il_.onload = function(){
							_this.pushSelection("!["+il_.alt+"]("+il_.src+" size='"+il_.width+"px,"+il_.height+"px')");
							_this.pushMsg("图片解析成功！已为其自动添加尺寸信息",'new');
						}
					} // 获取图片尺寸 - END
				},
				imgHandle(file){
					if(!_this.upload.img.allow){
						extMgmt.alert({title:'提示',message:'Sorry，该页面不允许上传本地图片！'});return false;
					}
					if((_this.upImgs.length+1) > _this.upload.img.max){
						extMgmt.alert({title:'提示',message:'Sorry，你上传的图片数量已超过该页面的最大限制！'});return false;
					}

					if(typeof file != 'object') {return false;}
					let fr = new FileReader();
					fr.readAsDataURL(file);
					fr.onload = function(e) {
						if(file.size > 1572864 && file.type=="image/gif"){
							extMgmt.alert({title:'添加失败',message:'该 gif 大于 1.5MB ，请换图重试！'});return;
						}
						// 若为 gif 且小于 1.5M 直接上传
						if(file.size <= 1572864 && file.type=="image/gif") {
							mgedtExt.imgPreUpload(file);return;
						}

						mgedtExt.dealImage(this.result, { quality: 0.7 }, function(base) {
							var blob = mgedtExt.dataURLtoBlob(base);
							var nfile = new File([blob], file.name, { type: file.type });

							if(nfile.size > _this.upload.img.maxSize ){
								var nsize = {};
								nsize.kb = (nfile.size / 1024).toFixed(2);
								nsize.okb = (_this.upload.img.maxSize / 1024).toFixed(2);
								extMgmt.alert({title:'添加失败',message:'该图片压缩后 '+nsize.kb+'KB 依然大于 '+nsize.okb+'KB ，请换图重试！'});return;
							}

							mgedtExt.imgPreUpload(nfile);
						});
					} // fileReader END
				},
				imgPreUpload(file){
					let fi = {};fi.idx = _this.upImgs.length;
					// 显示loading
					$('#mgedtExt-imgUpPre').prepend("<div class='gep-preview loading' data-loadid='"+fi.idx+"'><div class='gep-img'></div><div class='gep-detail'><div class='gep-size'><span>图片上传中...</span></div><div class='gep-name'><span>"+file.name+"</span></div><div class='gep-opts'><i class='gi icon-cw ga-spin'></i></div></div></div>");

					// 上传图片
					_this.oss_uploadFile('img',file,function(status,url){
						$('#mgedtExt-imgUpPre .gep-preview[data-loadid='+fi.idx+']').remove();
						if(status!='success'){
							extMgmt.alert({title:'提示',message:"图片"+file.name+"上传失败！"});return false;
						}

						file.URL = 'https://mcadmin-img.oss-cn-hangzhou.aliyuncs.com/'+url;
						mgedtExt.imgAdd(file.URL,file.name);
						_this.upImgs.push( file );
						mgedtExt.imgPreview( _this.upImgs.length - 1 );
					});
				},
				imgPreview(snum){
					let t = {},i,fr,files = [];
					if( typeof snum == 'number' ){
						files.push( _this.upImgs[snum] );
					} else {
						files = _this.upImgs;
						$('#mgedtExt-imgUpPre .gep-preview').remove();
					}

					for (i = 0; i < files.length; i++) {
						typeof snum == 'number' ? t.sn = snum : t.sn = i;
						fr = new FileReader();
						fr.readAsDataURL(files[i]);
						fr.onload = (function(sn) {
							return function(e){
								let fi = {},file = _this.upImgs[sn];
								fi.kb = (file.size / 1024).toFixed(2);
								t.h = "<div class='gep-preview' data-id='"+sn+"'><div class='gep-img'><img src='"+this.result+"'></div><div class='gep-detail'><div class='gep-size'><span>"+fi.kb+" KB</span></div><div class='gep-name'><span>"+file.name+"</span></div><div class='gep-opts'><i class='gi icon-indent-right opt-add' title='添加'></i> <i class='gi icon-delete' title='删除'></i></div></div></div>";
								$('#mgedtExt-imgUpPre').prepend(t.h);

								mgedtExt.imgOptsBind();
							}
						})(t.sn); //传入序号
					}
				},
				imgOptsBind(){
					$('#mgedtExt-imgUpPre .gep-preview .gep-opts > .opt-add:not([data-bind="yes"])').click(function(){
						t.prt = $(this).parent().parent().parent();
						t.id = t.prt.attr('data-id');
						
						mgedtExt.imgAdd(_this.upImgs[t.id].URL,_this.upImgs[t.id].name);
					}).attr("data-bind","yes");
					$('#mgedtExt-imgUpPre .gep-preview .gep-opts > .icon-delete:not([data-bind="yes"])').click(function(){
						t.prt = $(this).parent().parent().parent();
						t.id = t.prt.attr('data-id');
						_this.upImgs.splice(t.id, 1);
						mgedtExt.imgPreview();
					}).attr("data-bind","yes");
				},
				dealImage(path, obj, callback){
					let img = new Image();
					img.src = path;
					img.onload = function() {
						var that = this;
						// 默认按比例压缩
						var w = that.width,h = that.height,scale = w / h;
						w = obj.width || w;
						h = obj.height || (w / scale);
						var quality = obj.quality || 0.7; // 默认图片质量为0.7

						//生成canvas
						var canvas = document.createElement('canvas');
						var ctx = canvas.getContext('2d');
						// 创建属性节点
						var anw = document.createAttribute("width");
						anw.nodeValue = w;
						var anh = document.createAttribute("height");
						anh.nodeValue = h;
						canvas.setAttributeNode(anw);
						canvas.setAttributeNode(anh);
						ctx.drawImage(that, 0, 0, w, h);

						// 图像质量
						if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
							quality = obj.quality;
						}
						// quality值越小，所绘制出的图像越模糊
						var base64 = canvas.toDataURL('image/jpeg', quality);
						// 回调函数返回base64的值
						callback(base64);
					}
				},
				dataURLtoBlob(dataurl){
					var arr = dataurl.split(','),
					mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]),
					n = bstr.length,
					u8arr = new Uint8Array(n);
					while (n--) {
					u8arr[n] = bstr.charCodeAt(n);
					}
					return new Blob([u8arr], { type: mime });
				}
			};

			$('.gmde-tool-bar .gedt-video').click(()=>{
				var selection = _this.getSelection();
				t.val = _this.input.val();
				var endSel = _this.input[0].selectionEnd;
				endSel = t.val.charAt(endSel-1);

				t.str = ( endSel=='\n' || t.val=='' ? '[bilibili]' : '\n[bilibili]' );
				extMgmt.alert({
					title:'添加视频',message:"<select class='gl-form fluid'><option value='bilibili'>bilibili</option></select><input class='gl-form fluid mt-2' id='mgedt-videoUrl' placeholder='iframe src 链接' value='"+selection+"'/>",
					yes:function(){
						var url = $('#mgedt-videoUrl').val();
						if(!url){return;}
						if(url.indexOf('player.bilibili.com')<0){
							extMgmt.alert({title:'提示',message:"<p>请输入正确的视频 iframe 链接！</p><br/><p>bilibili 视频嵌入链接请在三连旁的分享中找到<b>嵌入代码</b>，复制 iframe src 中的链接。</p>"});return false;
						}

						_this.pushSelection(t.str+url+'[/bilibili]');
					}
				});
			});

			$('.gmde-tool-bar .gedt-save').click(()=>{
				this.autoSave.sec = 1;
			});

			return this;
		},
		set: function(opts){
			opts = opts || {};
			var _this = this;let temp;
			if($('#'+this.id).length<1){return false;}

			if(opts.preview){
				this.preview = ( typeof opts.preview === 'object' ? opts.preview : $(opts.preview) );
				this.preview.addClass('gmde-vHTML');
			}
			opts.maxlength && (this.length.max = parseInt(opts.maxlength));
			this.length.min = parseInt(opts.minlength) || 10;
			if(this.length.max > 0){
				this.input.attr('maxlength',this.length.max);
			} else {this.input.removeAttr('maxlength');}

			if(typeof opts.autoSave === 'object'){
				this.autoSave.name = (opts.autoSave.name ? opts.autoSave.name : 'gxzMarkDownEditor' );
				typeof opts.autoSave.load !== 'number' && (opts.autoSave.load = 1);
				if(opts.autoSave.name){
					var lastSave = $.storage.get(opts.autoSave.name);
					if(opts.autoSave.load==1 && lastSave){
						this.input.val(lastSave);
						this.pushMsg('上次数据加载成功','new');
						if(typeof this.preview === 'object') {this.previewHandle();}
					}

					$('.gmde-tool-bar .gedt-save').removeClass('btn-hide');
				}
				this.autoSave.time = (opts.autoSave.time ? opts.autoSave.time : 30 );
				opts.autoSave.time && (this.autoSave.sec = opts.autoSave.time);
			}

			if(typeof opts.upload === 'object'){
				if(typeof opts.upload.img === 'object'){
					temp = opts.upload.img;
					typeof temp.allow === 'undefined' || (this.upload.img.allow = temp.allow);
					typeof temp.maxLen === 'undefined' || (this.upload.img.maxLen = temp.maxLen);
					typeof temp.maxSize === 'undefined' || (this.upload.img.maxSize = temp.maxSize);
					typeof temp.url === 'undefined' || (this.upload.img.url = temp.url);
					typeof temp.act === 'undefined' || (this.upload.img.act = temp.act);
				}
			}

			return this;
		},
		updateSecHandle: function(){
			let _this = this;
			if(this.autoSave.time){
				this.autoSave.sec--;

				if(this.autoSave.sec<=0 && this.input.val().length>0){
					$.storage.set(this.autoSave.name,this.input.val());
					this.autoSave.sec = this.autoSave.time;
					this.pushMsg('已为你自动保存 - '+new Date().toLocaleTimeString(),'new');
				}
			}

			setTimeout(()=>{
				_this.updateSecHandle();
			},1000);
		},
		updateHandle: function(){
			let _ge = {},_this = this;
			_ge.txt = this.input.val();
			_ge.tlen = this.input.val().length;

			if(_ge.tlen>10000) {
				clearTimeout(_this.updateTimeout);
				_this.updateTimeout = setTimeout(()=>{
					_this.previewHandle();
				},350);
			} else {_this.previewHandle();}

			_ge.minComp = this.length.min - _ge.tlen;
			_ge.maxComp = this.length.max - _ge.tlen;
			if( _ge.minComp>0 ){
				this.pushMsg('至少还需要输入 '+_ge.minComp+' 字');
			} else if(_ge.maxComp>=0) {
				this.pushMsg('最多还可输入 '+_ge.maxComp+' 字');
			} else if(_ge.minComp==-1){
				this.pushMsg('Ganxiaozhe MarkDown Editor.');
			}
		},
		pushMsg: function(str,mtype){
			var _this = this;
			mtype || (mtype='set');

			if(mtype=='set'){
				_this.msg.html('<div class="msg-el">'+str+'</div>');return _this;
			}

			_this.msg.addClass('gmdea-bg');
			_this.msg.find('.msg-el').css({'opacity':0}).html(str);
			setTimeout(()=>{
				_this.msg.find('.msg-el').css({'opacity':1});
				_this.msg.removeClass('gmdea-bg');
			},400);
			return _this;
		},
		previewHandle: function(opts){
			var _this = this,i,t = {};
			if(typeof opts === 'object'){
				_this.input = opts.input;
				_this.preview = opts.preview;
			} else {
				if(typeof this.preview !== 'object'){return false;}
			}

			t.txt = _this.input.val().replace(/</g,'&lt;').replace(/>/g,'&gt;');
			if(opts && opts.act=='inline'){
				_this.preview.html( _this.toHtmlHandle(t.txt,'inline') );return;
			}

			let cells = t.txt.split('\n');
			let mat = {
				code:0,codeArr:[],
				quote:0,quoteArr:[],
				list:0,olist:0
			};
			let matToHtml = function(str){
				// 行内样式
				let inStr = _this.toHtmlHandle(str,'inline');
				// 所有
				str = _this.toHtmlHandle(str);

				if(str.length<1){str = '<br>';} else if(str==inStr){
					str = '<p>'+str+'</p>';
				}
				return str;
			}
			for (i = 0; i < cells.length; i++) {
				// 代码块
				if(mat.code==1){
					if(cells[i] == '```'){
						cells[i] = '</pre>';mat.code = 0;
					} else {cells[i]+='<br>';}
					continue;
				}
				t.mCode = cells[i].match(/^(?:```.*?)/);
				if(t.mCode !== null){
					t.codeLang = cells[i].replace(/```/,'');
					cells[i] = '<pre class="gcode-autoParse '+t.codeLang+'" data-lang="'+t.codeLang+'">';
					mat.code = 1;continue;
				}

				// 引用
				if(mat.quote==1){
					if(cells[i] == '&gt;&gt;&gt;'){
						cells[i] = '<div class="quote-box">'+mat.quoteArr.join('')+'</div>';mat.quote = 0;
					} else {
						t.temp = matToHtml(cells[i]);mat.quoteArr.push(t.temp);cells[i]='';
					}
					continue;
				}
				if(cells[i] == '&gt;&gt;&gt;'){mat.quoteArr=[];mat.quote = 1;cells[i]='';continue;}

				// 列表 *
				t.mList = cells[i].match(/^(?: {0,8}\* .*?)/);
				if(mat.list==1){
					if(cells[i].length<1){continue;}

					if(t.mList !== null ){
						t.mList = cells[i].match(/^(?: {2,}\* .*?)/);
						cells[i] = _this.toHtmlHandle( cells[i].replace('* ',''),'inline' );
						if(t.mList !== null ){
							cells[i] = '<li class="child">'+cells[i]+'</li>';
						} else {
							cells[i] = '<li>'+cells[i]+'</li>';
						}
					} else {
						cells[i-1] += '</ul>';mat.list = 0;cells[i] = matToHtml(cells[i]);
					}
					continue;
				}
				if(t.mList !== null){
					cells[i] = '<ul><li>'+_this.toHtmlHandle( cells[i].replace('* ',''),'inline' )+'</li>';
					mat.list = 1;continue;
				}

				// 列表 -
				t.mList = cells[i].match(/^(?: {0,8}\- .*?)/);
				if(mat.olist==1){
					if(cells[i].length<1){continue;}

					if(t.mList !== null ){
						t.mList = cells[i].match(/^(?: {2,}\- .*?)/);
						cells[i] = _this.toHtmlHandle( cells[i].replace('- ',''),'inline' );
						if(t.mList !== null ){
							cells[i] = '<li class="child">'+cells[i]+'</li>';
						} else {
							cells[i] = '<li>'+cells[i]+'</li>';
						}
					} else {
						cells[i-1] += '</ol>';mat.olist = 0;cells[i] = matToHtml(cells[i]);
					}
					continue;
				}
				if(t.mList !== null){
					cells[i] = '<ol><li>'+_this.toHtmlHandle( cells[i].replace('- ',''),'inline' )+'</li>';
					mat.olist = 1;continue;
				}

				cells[i] = matToHtml(cells[i]);
			}

			_this.preview.html( cells.join("").replace(/<br><\/pre>/g,'</pre>') );

			if(typeof hljs==='object' && 'highlight' in hljs){
				_this.preview[0].querySelectorAll('.gcode-autoParse').forEach((block) => {hljs.highlightBlock(block);});
			}
			extMgmt.codeboxParse('<br>');

			if(typeof $.fn.gazeimg === 'function'){
				$('img[data-gisrc]').gazeimg();
			}
		},
		toHtmlHandle(str,act){
			act || (act='');
			var _pre = {
				h1: new RegExp("^#{1} (.*)$"),
				h2: new RegExp("^#{2} (.*)$"),
				h3: new RegExp("^#{3} (.*)$"),
				h4: new RegExp("^#{4} (.*)$"),
				h5: new RegExp("^#{5} (.*)$"),
				hr: new RegExp("^-{4,}$"),
				bold: new RegExp("\\*{2}([^*].*?)\\*{2}",'g'),
				italic: new RegExp("\\*{1}([^*].*?)\\*{1}",'g'),
				noun: new RegExp("`{1,2}([^`].*?)`{1,2}",'g'),
				img: new RegExp("!\\[([^'\"]*?)\\]\\((.*?)\\)",'g'),
				url_img: new RegExp("\\[(<img.*?)\\]\\((.*?)\\)",'g'),
				url: new RegExp("\\[([^\\n]*?)\\]\\((.*?)\\)",'g'),
				card: new RegExp("^\\[{3}(.*?)\\|{3}(.*?)\\|{2}(.*?)\\]{3}",'g'),
				bilibili: new RegExp("^\\[bilibili\\](.*?)\\[\/bilibili\\]$"),
			},_t = {};

			_pre.rp_img = (typeof $.fn.gazeimg==='function' ? '<img alt="$1" data-gisrc="$2" data-gishow="GMDE">' : '<img alt="$1" src="$2">');

			if(act=='inline'){
				str = str.replace(_pre.bold, '<strong>$1</strong>')
					.replace(_pre.italic, '<em>$1</em>')
					.replace(_pre.noun, '<span class="code-text">$1</span>')
					.replace(_pre.img, _pre.rp_img)
					.replace(_pre.url_img, '<a href="$2" target="_blank">$1</a>')
					.replace(_pre.url, '<a href="$2" target="_blank"><i class="gi icon-weibiaoti-"></i>$1</a>');
				return str;
			}

			str = str.replace(_pre.h5, '<h5>$1</h5>')
				.replace(_pre.h4, '<h4>$1</h4>')
				.replace(_pre.h3, '<h3>$1</h3>')
				.replace(_pre.h2, '<h2>$1</h2>')
				.replace(_pre.h1, '<h1>$1</h1>')
				.replace(_pre.hr, '<div class="gmd-hr"></div>')
				.replace(_pre.bold, '<strong>$1</strong>')
				.replace(_pre.italic, '<em>$1</em>')
				.replace(_pre.noun, '<span class="code-text">$1</span>')
				.replace(_pre.img, _pre.rp_img)
				.replace(_pre.url_img, '<a href="$2" target="_blank">$1</a>')
				.replace(_pre.url, '<a href="$2" target="_blank"><i class="gi icon-weibiaoti-"></i>$1</a>')
				.replace(_pre.card, '<div class="card"><div class="head">$1</div><div class="body"><h5 class="mt-0 mb-2">$2</h5><div class="glt-wrap">$3</div></div></div>');

			_t.preW = this.preview.width();
			_t.videoW = (_t.preW>1024 ? 1024 : _t.preW);_t.videoH = Math.floor(_t.videoW/1.48);
			str = str.replace(_pre.bilibili,'<iframe src="$1" class="gmd-video" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="'+_t.videoW+'" height="'+_t.videoH+'"> </iframe>');
			return str;
		},
		getSelection: function(str){
			var obj = this.input[0];

			if(window.getSelection) {
				if(obj.selectionStart != undefined && obj.selectionEnd != undefined) {
					return obj.value.substring(obj.selectionStart, obj.selectionEnd);
				} else {
					return "";
				}
			} else {
				return document.selection.createRange().text;
			}
		},
		pushSelection: function(str){
			var _this = this;
			var obj = this.input[0];

			if (document.selection) {
				var sel = document.selection.createRange();
				sel.text = str;
			} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
				var startPos = obj.selectionStart;
				var endPos = obj.selectionEnd;
				var cursorPos = startPos;
				var tmpStr = obj.value;
				obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
				cursorPos += str.length;
				obj.selectionStart = obj.selectionEnd = cursorPos;
			} else {obj.value += str;}

			_this.updateHandle();

			return this;
		},
		oss_uploadFile: function(type,file,callback){
			if(!(file instanceof File)){return 'notFile';}
			var _this = this,oss = this.oss;
			_this.oss_getSignature(_this.upload[type].act);
			if(oss.status=='fail') {return false;}

			let request = new FormData(),t = {};
			request.append("key", oss.key + '${filename}'); // 路径
			request.append("policy", oss.policyBase64); // policy规定了请求的表单域的合法性
			request.append("OSSAccessKeyId", oss.accessid);
			request.append("success_action_status", '200'); // 让服务端返回200,不然，默认会返回204
			request.append("callback", oss.callbackbody);
			request.append("signature", oss.signature); // OSS验证该签名信息从而验证该Post请求的合法性

			request.append('file', file);
			fetch(oss.host,{
				body:request,method:'POST'
			}).then(res => res.json()).then(function(resp){
				t.url = oss.key+file.name;
				callback('success',t.url);
				//callback('failure');
			});
		},
		oss_getSignature: function(act,force){
			var _this = this;let oss = _this.oss;
			act || (act = _this.upload.img.act);
			if(arguments.length < 2){force = false;}
			oss.now = Date.parse(new Date()) / 1000; 
			if (oss.expire < oss.now + 3 || force==true) {
				let body = _this.send_request(act);
				let obj;
				try{obj = JSON.parse(body);} catch(err){
					extMgmt.alert({title:'出错啦！',message:body});return false;
				}
				if( obj.status && obj.status!='success' ){
					oss.status = obj['status'];_this.oss = oss;
					extMgmt.alert({title:'错误代码: '+oss.status,message:obj.reason});return false;
				}
				oss.status = 'success';
				oss.host = obj['host'],
				oss.policyBase64 = obj['policy'],
				oss.accessid = obj['accessid'],
				oss.signature = obj['signature'],
				oss.expire = parseInt(obj['expire']),
				oss.callbackbody = obj['callback'],
				oss.key = obj['dir'];
				_this.oss = oss;
				return true;
			}
			return false;
		},
		send_request(act){
			let xmlhttp = null;
			if (window.XMLHttpRequest){xmlhttp=new XMLHttpRequest();} else if (window.ActiveXObject){
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			if (xmlhttp!=null){
				let serverUrl = this.upload.img.url+act;
				xmlhttp.open( "GET", serverUrl, false );
				xmlhttp.send( null );
				return xmlhttp.responseText;
			} else {alert("你的浏览器不支持 XMLHTTP.");}
		}
	};
	geditor.fn.init.prototype = geditor.fn;

	return geditor;
}));