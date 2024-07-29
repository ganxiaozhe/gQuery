/** -------------------------------------
 *
 * gQuery UI v2.0.0 [PREVIEW]
 * (c) 2021-present, JU Chengren (Ganxiaozhe)
 * 
 * [T] Pre-released under the GPLv3 License.
 * gquery.cn/license
 * 
 * THE PREVIEW VERSION IS NOT PERFECT
 * AND IS NOT RECOMMENDED FOR USE IN
 * A PRODUCTION ENVIRONMENT, SO IT IS
 * RELEASED UNDER THE GPLv3 LICENSE
 *
 * ------------------------------------- */
;(function(global, factory){
    if(!global.gQuery || !global.gQuery.fn.gquery){
        throw new Error("请先引入 gQuery v1.5.5 以上版本!");
    }

    gQuery.extend({ui:factory()});
    console.log('%c gQueryUI v2.0.0 [PREVIEW] %c ui.gquery.cn \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');
}(window, function(){
    'use strict';
    let ui = {
        // 对话弹出框
        dialog(){},
        // 信息提示框
        alert(){},
        // 操作弹出框
        actionsheet(){},
        // 加载遮罩
        loader(){},
        // 弹幕
        barrage(){},
        // 分页器
        pagination(){},
        // 水印
        watermark(){}
    }, fnExtend = {};
    // 免初始化
    $(function(){
        ui.tiper();
        ui.select();
        ui.slider();
    });



    /** -------------------------------------
     * Dialog 对话弹出框
     * ------------------------------------- */
    ui.dialog = function(){
        let opts=getDialogParam(arguments), that=this, t={},
            conf = ui.dialog.prototype.config;
        
        // 按钮组
        t.abtns = Array.isArray(opts.buttons) ? opts.buttons : [];
        if(opts.yes || opts.yes_btn){
            t.btn = {
                val: opts.yes_btn || '确定',
                func: opts.yes,
                class: conf.yesClass
            };
            t.abtns.push(t.btn);
        }
        if(opts.no || opts.no_btn){
            t.btn = {
                val: opts.no_btn || '取消',
                func: opts.no,
                class: 'cancel'
            };
            t.abtns.push(t.btn);
        }
        t.abtns.length<1 && opts.buttons!==false && t.abtns.push({val:'确定', class:conf.yesClass});
        t.btns = getButtonList(t.abtns);

        // CSS 样式
        t.style = getStyles(opts.style);
        t.bodyStyle = getStyles(opts.bodyStyle);

        // DOM 输出
        that.id ? that.id++ : that.id=1;
        t.html = `<div class='gqui-dialog-wrap' gqui-dialog='${that.id}' style='display:none'>`+
            `<div class='gqui-dialog'${t.style}>`+
                `<div class='gqui-dialog-header'>${opts.title}</div>`+
                `<div class='gqui-dialog-body'${t.bodyStyle}>${opts.message}</div>`+
                `<div class='gqui-dialog-footer'>${t.btns}</div>`+
            `</div>`+
        `</div>`;
        $('body').append(t.html);

        t.$alert = $(`.gqui-dialog-wrap[gqui-dialog='${that.id}']`);
        t.$alert.show('flex').fadeIn(300)
        .on('click', '.gqui-dialog-footer .btn', function(){
            let $btn = $(this).attr('disabled','disabled');
            let bid = $btn.attr('data-btnId'), btn = t.abtns[bid];
            if(typeof btn.func === 'function'){
                if(btn.func()===false){
                    $btn.removeAttr('disabled');return;
                }
            }

            $btn.parent().find('.btn').attr('disabled', 'disabled');
            $btn.parent().parent().parent().fadeOut(500, function(){
                $(this).remove();
            });
        });
        return t.$alert;
    };
    ui.dialog.prototype.config = {
        yesClass:'primary'
    };
    /** -------------------------------------
     * 弹出框传参预处理
     * ------------------------------------- */
    function getDialogParam(args){
        let len=args.length, array=[];
        for (let i = 0; i < len; i++) {array.push(args[i]);}

        if(!Array.isArray(array)) {return 'empty array';}
        let opts = array[0];
        if(typeof opts !== 'object' && array.length<2) {return 'empty array';}
        if(array.length>1){
            opts = {title: array[0], message:array[1]};
            typeof array[2]=='function' && (opts.yes = array[2]);
            typeof array[3]=='function' && (opts.no = array[3]);
            array[4] && (opts.yes_btn = array[4]);
            array[5] && (opts.no_btn = array[5]);
        }
        return opts;
    };
    function getButtonList(list, defaultClass){
        if(!Array.isArray(list)){return '';}

        return list.reduce((pre, cur, idx)=>{
            let btnId = cur.id ? ` id='${cur.id}'` : '',
                btnDisa = cur.disable===true ? " disabled='disabled'" : '';
            cur.class || (cur.class=defaultClass);
            return `<button type='button'${btnId} class='btn ${cur.class}' data-btnId='${idx}'${btnDisa}>${cur.val||cur.title}</button>${pre}`;
        }, '');
    };
    function getStyles(object){
        if(typeof object !== 'object'){return '';}

        let style = [];
        for(let key in object){
            style.push(`${key}:${object[key]}`);
        }
        return " style='"+style.join(';')+"'";
    }


    /** ------------------------------------
     * alert
     * ------------------------------------- */
    ui.alert = function(){
        let args = arguments, autoclose = 5000,
            conf = ui.alert.prototype.config;
        let opts = {
            pos: conf.pos,
            btns: conf.btns,
            // inline \ block
            display: ''
        };
        if(args.length<1){return false;}
        switch(typeof args[1]){
            case 'number':
                autoclose = args[1];break;
            case 'string':
                opts.pos = args[1];break;
            case 'object':
                opts.btns = getButtonList(args[1].buttons, 'link');
                opts.btns!='' && (opts.btns = `<div class='buttons'>${opts.btns}</div>`);
                opts.display = args[1].display || 'inline';
                args[1].pos && (opts.pos = args[1].pos);
                break;
        }
        typeof args[2]==='number' && (autoclose = args[2]);

        // gqui-alert-wrap
        let $wrap = $('.gqui-alert-wrap.'+opts.pos);
        if($wrap.length<1){
            $('body').append(`<div class='gqui-alert-wrap ${opts.pos}'></div>`);
            $wrap = $('.gqui-alert-wrap.'+opts.pos);
        }

        // gqui-alert
        $wrap.prepend(`<div class='gqui-alert ${opts.display}'>`+
            `<div class='content'>${args[0]}</div>${opts.btns}`+
        `</div>`);
        let $alert = $wrap.find('.gqui-alert:first-of-type');
        $alert.on('click', '.btn', function(){
            let $btn = $(this).attr('disabled','disabled');
            let bid = $btn.attr('data-btnId'), btn = args[1].buttons[bid];

            if(typeof btn.func==='function'){
                if(btn.func()===false){
                    $btn.removeAttr('disabled');return;
                }
            }

            $btn.parent().parent().removeClass('show').wait(400).remove();
        });
        let height = $alert.height();
        height<52 && (height=52);
        $alert.css({
            transition: 'opacity 0.4s ease, transform 0.3s ease, height 0.3s linear',
            '--height': height+'px',
            height: '0px'
        });
        $alert.wait(10).addClass('show');

        // 如果自动关闭时间小于1ms，则不关闭
        if(autoclose<1){return $alert;}
        setTimeout(()=>{
            $alert.removeClass('show').wait(400).remove();
        }, autoclose+10);
        return $alert;
    };
    ui.alert.prototype.config = {
        pos:'bottom-left', btns:''
    };



    /** -------------------------------------
     * Actionsheet 操作弹出框
     * ------------------------------------- */
    ui.actionsheet = function(opts){
        Array.isArray(opts) && (opts = {menu:opts});
        opts||(opts = {});

        let args = arguments, that=this,
            conf = ui.actionsheet.prototype.config;
        let menu = opts.menu, action = opts.action;
        Array.isArray(menu)||(menu = []);
        Array.isArray(action)||(action = []);
        action.length<1 && (action = conf.action);

        let menuHTML = '', actionHTML = '';
        menu.map((li, idx)=>{
            menuHTML += `<div class='gqui-actionsheet__cell' data-index='${idx}'>${li.title}</div>`;
        });
        action.map((li, idx)=>{
            actionHTML += `<div class='gqui-actionsheet__cell is-action' data-index='${idx}'>${li.title}</div>`;
        });

        let acHTML = `<div class='gqui-actionsheet-wrap is-wait-bind'><div class='gqui-actionsheet'>
            <div class='gqui-actionsheet__menu'>${menuHTML}</div>
            <div class='gqui-actionsheet__action'>${actionHTML}</div>
        </div></div>`;
        $('body').append(acHTML);
        // binding
        $('.gqui-actionsheet-wrap.is-wait-bind').on('click', '.gqui-actionsheet__cell', function(e){
            e.stopPropagation();
            let $cell = $(this);
            let $wrap = $cell.parent().parent().parent();
            let isAction = $cell.hasClass('is-action'),
                index = parseInt( $cell.attr('data-index') );

            let list = isAction ? action : menu;
            let item = list[index];
            typeof item.func==='function' && item.func();

            $wrap.removeClass('is-in').off().wait(400).remove();
        }).on('click', function(){
            $(this).removeClass('is-in').off().wait(400).remove();
        }).removeClass('is-wait-bind').wait(50).addClass('is-in');
    };
    ui.actionsheet.prototype.config = {
        action:[{title:'取消'}]
    };



    /** ------------------------------------
     * Tiper
     * ------------------------------------- */
    ui.tiperZindex = 20020214;
    ui.tiper = new $.chain({
        gquery:true,
        tipImpl:{
            $elem:false,
            $tiper:false,
            isTrack:false,
            isFocus:false,
            showDelay:null,
            mouseEvent:'',
            closeDelay:false
        },
        zindex:20020214,
        init:function(){
            let that = this;

            $('[data-tiper]').each(function(){
                let $tip = $(this), cont = $tip.attr('data-tiper');
                $tip.attr('data-tiper-content', cont).removeAttr('data-tiper');
            }).on({
                mouseenter:function(e){
                    let $this = $(this), _this = this;
                    let _tip = $this.data('gqui-tiper') || that.tipImpl;
                    if(_tip.isFocus === true){return;}
                    if(_tip.$tiper){return that.focus($this);}
                    if($this.is('[data-tiper-track]')){
                        return _show();
                    }
                    
                    _tip.showDelay = setTimeout(()=>{_show();}, 150);
                    function _show(){
                        _tip.showDelay = false;
                        that.gen(_this, e);
                    }
                },
                mouseleave:function(e){
                    let $this = $(this);
                    let _tip = $this.data('gqui-tiper') || that.tipImpl;
                    if(_tip.isTrack){return that.close($this);}
                    if(_tip.showDelay){return clearTimeout(_tip.showDelay);}

                    that.blur($this);
                },
                click:function(e){
                    let $this = $(this);
                    let _tip = $this.data('gqui-tiper') || that.tipImpl;
                    if(_tip.isFocus === true){return;}
                    if(_tip.$tiper){
                        return that.offset(e, $this);
                    }

                    that.gen(this, e);
                },
                'tiper-update':function(e){
                    that.gen(this, e);
                }
            });
        },
        gen:function(elem, event){
            let that = this, $this = $(elem);
            let _tip = $this.data('gqui-tiper') || $.extend({}, that.tipImpl);
            _tip.$elem = $this;
            let cont = this.getCont($this);
            _tip.isTrack = $this.is('[data-tiper-track]');
            if(cont==false){return;}
            event||(event = _tip.mouseEvent);

            if(_tip.$tiper){
                _tip.$tiper.html(cont);
            } else {
                $('body').append(`<div class='gqui-tiper is-new'>${cont}</div>`);
                _tip.$tiper = $('.gqui-tiper.is-new').eq(0).removeClass('is-new');
                _tip.$tiper.wait(10).addClass('show').css('z-index', ui.tiperZindex);
            }
            $this.data('gqui-tiper', _tip);

            this.offset(event, $this);
            _tip.isTrack && $this.on('mousemove.gqui-tiper', function(e){
                that.offset(e, $this);
            });

            if(_tip.isTrack){return;}
            _tip.$tiper.on({
                mouseenter:function(){
                    that.focus($this);
                },
                mouseleave:function(){
                    that.blur($this);
                }
            });
        },
        offset:function(event, $elem){
            let os = {pos:'fixed'};
            let _tip = $elem.data('gqui-tiper');

            if(_tip.isTrack){
                os.top = event.clientY+document.body.scrollTop;
                os.left = event.clientX;

                os.top -= (_tip.$tiper.height()+20);
            } else {
                let offset = _tip.$elem.offset();
                os.top = offset.top-_tip.$tiper.height()-16;
                os.left = offset.left+_tip.$elem.width()/2;
                os.pos = 'absolute';
            }
            
            _tip.$tiper.css({
                top: os.top+'px',
                left: os.left+'px',
                position: os.pos
            });
        },
        getCont:function($elem){
            let cont = $elem.attr('data-tiper-content'), match = false;
            if(!cont){return false;}

            match = cont.match(/^{[A-Za-z0-9_\.()\$]*?}$/);
            if(match){
                let val = match[0].replace(/[{}]/g,'');
                cont = Function('"use strict";return ' + val)();
            }
            return cont;
        },

        focus:function($elem){
            let _tip = $elem.data('gqui-tiper');
            if(!_tip && $elem.hasClass('gqui-tiper')){
                return $elem.off().removeClass('show').wait(300).remove();
            }

            _tip.isFocus = true;
            clearTimeout(_tip.closeDelay);
            ui.tiperZindex>=Number.MAX_SAFE_INTEGER && (ui.tiperZindex=20020214)

            if(!_tip.$tiper.css('z-index', ++ui.tiperZindex).hasClass('show')){
                _tip.$tiper.addClass('show');
            }
        },
        blur:function($elem){
            let _tip = $elem.data('gqui-tiper');
            if(!_tip){return;}
            let that = this;

            _tip.isFocus = false;
            _tip.closeDelay = setTimeout(()=>{
                that.close($elem);
            }, 300);
        },
        close:function($elem){
            let _tip = $elem.data('gqui-tiper');
            if(_tip.$elem===false){return;}
            _tip.$elem.off('mousemove.gqui-tiper');

            if(_tip.isTrack){
                _tip.$tiper.remove();
                _tip.$tiper = false;
                _tip.$elem = false;
                _tip.isFocus = false;
                return;
            }

            _tip.$tiper.removeClass('show');
            _tip.closeDelay = setTimeout(()=>{
                _tip.$tiper && _tip.$tiper.remove();
                _tip.$tiper = false;
                _tip.$elem = false;
            }, 300);
        }
    });



    /** ------------------------------------
     * btnRipples
     * ------------------------------------- */
    $('body').on('click', '.btn', function(e){
        let $btn = $(this);
        if($btn.hasClass('is-disabled')){return;}

        let offset = $btn.offset(true),
            dist = $btn.width();
        let btnH = $btn.height();
        dist<btnH && (dist = btnH);
        dist*=2;

        let x = e.clientX - offset.left,
            y = e.clientY - offset.top;
        let ripples = `<span class='btn-ripples' style='top:${y}px;left:${x}px;--rip-dist:${dist}px'></span>`;
        let $rip = $btn.prepend(ripples).find('.btn-ripples').eq(0);
        setTimeout(()=>{$rip.remove();}, 700);
    });

    /** ------------------------------------
     * inputTiper
     * ------------------------------------- */
    $('body').on('click', '.input-tiper', function(){
        $(this).parent().find('.input')[0].focus();
    });

    $('body').on('blur', '.input', function(){
        let $inp = $(this), val = this.value;
        let $wrap = $inp.parent();
        if(!$wrap.is('.input-wrap')){return;}

        let $tip = $wrap.find('.input-tiper');
        if(val){
            $tip.addClass('is-active');
        } else {
            $tip.removeClass('is-active');
        }
    });


    /** ------------------------------------
     * select
     * ------------------------------------- */
    ui.select = new $.chain({gquery:true, init:function(){
        $('select.gqui-select').each(function(){
            let $sel = $(this);
            let $opts = $sel.find('option');
            let valueArray = $opts.attr('value') || [],
                textArray = $opts.text([]);
            let isTiper = $sel.hasClass('tiper');
            textArray.length>0 && valueArray.length<1 && (
                valueArray = [undefined]
            );


            let optsHTML = '', tip = '请选择';
            valueArray.map((val, idx)=>{
                if(val===undefined){
                    tip = textArray[idx];
                    return;
                }

                optsHTML += `<li data-value='${val}'>${textArray[idx]}</li>`;
            });
            if(optsHTML===''){
                optsHTML += `<li class='gqui-disabled'>暂无选项</li>`;
            }

            let inpClsArray = ['fluid', 'sm', 'lg', 'rad', 'line'],
                inpCls = [];
            inpClsArray.map(cls=>{
                $sel.hasClass(cls) && inpCls.push(cls);
            });
            inpCls = inpCls.length>0 ? ` ${inpCls.join(' ')}` : '';
            $sel.removeClass('gqui-select tiper rad line');
            
            let cls = $sel[0].className, inpId = $sel[0].id,
                comp = '';
            if(isTiper){
                comp = `<div class='input-tiper' aria-hidden='true'>${tip}</div>`;
                tip = '';
            }
            if(inpId){inpId = ` id='${inpId}'`;}


            $sel.ohtml(`<div class='input-wrap gqui-select-wrap ${cls}'>
                <input${inpId} type='hidden' class='gqui-select-value' />
                <input type='text' class='input gqui-select-input${inpCls}' readonly='true' placeholder='${tip}'>
                ${comp}
                <div class='gqui-select-arrow'></div>

                <ul class='gqui-select-list'>${optsHTML}</ul>
                <svg class='gqui-select-popper' viewBox='0 0 150 100'><path d='M0 100 L75 0 L150 100'></path></svg>
            </div>`);
        }).removeClass('gqui-select');
    }});

    // 委托 .gqui-select-input
    $('body').on({
        focus:function(){
            let $inp = $(this);
            let $wrap = $inp.parent();
            let $list = $wrap.find('.gqui-select-list'),
                $val = $wrap.find('.gqui-select-value');

            // 计算高度
            let of = $inp.offset(true), addCls = 'is-focus';
            $list.show();
            of.height = $list.height();
            $list.hide();
            of.top_diff = window.innerHeight-of.top-$inp.height();
            if(of.top_diff<of.height){
                addCls += ' is-reverse';
            }

            $list.on('click.select', 'li[data-value]', function(){
                $list.find('li.is-active').removeClass('is-active');
                let $li = $(this).addClass('is-active');
                if($li.hasClass('gqui-disabled')){
                    return false;
                }

                let val = $li.attr('data-value');
                $inp.val($li.text()).trigger('blur');
                $val.val(val).trigger('change');
            });

            $list.width($inp.width()).show();
            $wrap.wait(10).addClass(addCls);
        },
        blur:function(){
            let $inp = $(this);
            let $wrap = $inp.parent();
            let $list = $wrap.find('.gqui-select-list');
            if(!$wrap.hasClass('is-focus')){return;}

            $wrap.removeClass('is-focus').wait(300).removeClass('is-reverse');
            $list.wait(300).off('click.select').hide();
        }
    }, '.gqui-select-input');

    // 委托 .gqui-select-value
    $('body').on({
        clear:function(){
            let $val = $(this);
            let $wrap = $val.parent();
            let $list = $wrap.find('.gqui-select-list'),
                $inp = $wrap.find('.gqui-select-input');

            $inp.val('').trigger('blur');
            $val.val('');
            $list.find('li.is-active').removeClass('is-active');
        },
        // 更新值
        update:function(){
            let $val = $(this), val = this.value;
            let $wrap = $val.parent();
            let $list = $wrap.find('.gqui-select-list'),
                $inp = $wrap.find('.gqui-select-input');

            let $li = $list.find(`li[data-value='${val}']`);
            if($li.length<1){
                return $val.trigger('clear');
            }

            $list.find('li.is-active').removeClass('is-active');
            $li.addClass('is-active');
            $inp.val($li.text()).trigger('blur');
        },
        disable:function(e){
            let $val = $(this);
            let $wrap = $val.parent();
            let $inp = $wrap.find('.gqui-select-input');
            let state = e.detail.state;

            if(state===false){
                $wrap.removeClass('is-disabled');
                $inp.removeAttr('disabled');
                return;
            }

            $wrap.addClass('is-disabled');
            $inp.attr('disabled','disabled');
        },
        /**
         * 更新列表
         * @param:list  String\Array    option 列表
         * @list:key    键名
         * @list:value  键值
         */
        updateList:function(e){
            let $val = $(this), val = this.value;
            let $wrap = $val.parent();
            let $list = $wrap.find('.gqui-select-list');
            let html = '', list = e.detail;

            if(Array.isArray(list)){
                list.map(li=>{
                    html += `<li data-value='${li.value}'>${li.key}</li>`;
                });
            } else {
                html = list.replace(/<option/g, '<li').replace(/value=/g, 'data-value=').replace(/<\/option>/g, '</li>');
            }

            if(html==''){
                html = "<li class='gqui-disabled'>暂无选项</li>";
            }
            $list.html(html);
            $val.trigger('update');
        }
    }, '.gqui-select-value');



    /** ------------------------------------
     * Loader
     * @useage .loader()
     * @useage .loader(false)
     * ------------------------------------- */
    fnExtend.loader = function(action){
        let className = '.gqui-overlay-loader';
        action===undefined && (action=true);
        if(action===false){
            this.find(className, false, true).fadeOut(500, function(){
                $(this).remove();
            });
            return this;
        }

        let optional = '';
        if(typeof action==='string'){
            optional += `<div class='gqui-loader-message mt-3'>${action}</div>`;
        }

        let html = `<div class='gqui-overlay-loader' style='opacity:0'><div class='gqui-loader-inner'>
            <div class='gqui-loader-spin'>
                <svg viewBox='25 25 50 50' class='spinner'>
                    <circle cx='50' cy='50' r='20' fill='none' class='path'></circle>
                </svg>
            </div>
            <div class='gqui-loader-body'>${optional}</div>
        </div></div>`;

        // Main
        return this.each(function(){
            let $this = $(this);
            if($this.css('position')=='static'){
                $this.css('position', 'relative');
            }
            let $old = $this.find(className, false, true);
            if($old.length>0){
                $old.find('.gqui-loader-body').html(optional);
                return;
            }
            $this.append(html);

            let $loader = $this.find(className, false, true);
            $loader.fadeIn(300);
            if($this.is('body')){
                $loader.css({position:'fixed'});
            }
        });
    };

    /** ------------------------------------
     * Barrage
     * @useage .barrage(string, durations)
     * @useage .barrage(object, durations)
     * ------------------------------------- */
    fnExtend.barrage = function(opts, durations){
        if(document.visibilityState!=='visible'){
            return this;
        }
        if(typeof opts==='string'){
            opts = {content: opts};
        }
        durations||(durations = 8000);

        return this.each(function(){
            let $wrap = $(this);
            let _wrap = {
                width:$wrap.width()
            };

            let styles = {top:0, left:_wrap.width+'px'};
            styles = getStyles(styles);
            $wrap.append(`<div class='gqui-barrage is-new'${styles}>${opts.content}</div>`);

            let $barr = $wrap.find('.gqui-barrage.is-new').removeClass('is-new');
            let left = (0-$barr.width())+'px';
            let top = 0;
            if(opts.top){
                top = opts.top;
            } else {
                let topMax = $wrap.height()-$barr.height();
                top = Math.random()*topMax;
                top = top.toFixed(2)+'px';
            }

            $barr.css({
                top:top
            }).animate({
                left:left
            }, durations, function(){
                $(this).remove();
            }).data('gqui-barrage', {
                start:new Date().getTime(),
                durations:durations,
                left:left
            });

            $wrap.is('[gqui-bound]') || $wrap.attr('gqui-bound',1).on({
                mouseenter:function(){
                    let $this = $(this);
                    let data = $this.data('gqui-barrage');
                    let ts = new Date().getTime();
                    data.durations -= ts - data.start;

                    let zindex = parseInt($this.css('z-index'));
                    isNaN(zindex) && (zindex=3);

                    $this.css('z-index', ++zindex).data('gqui-barrage', data).stop();
                },
                mouseleave:function(){
                    let $this = $(this);
                    let data = $this.data('gqui-barrage');
                    data.start = new Date().getTime();

                    let zindex = parseInt($this.css('z-index'));
                    isNaN(zindex) && (zindex=3);

                    $this.css('z-index', --zindex).data('gqui-barrage', data).animate({
                        left:data.left
                    }, data.durations, function(){$(this).remove();});
                }
            }, '.gqui-barrage');
        });
    };



    /** ------------------------------------
     * Slider
     * ------------------------------------- */
    ui.slider = new $.chain({
        gquery:true,
        init:function(){
            $('input.gqui-slider[type="range"]').each(function(){
                this.classList.remove('gqui-slider');
                let className = this.className, inpId = this.id;
                if(inpId){inpId = ` id='${inpId}'`;}

                let total = this.max - this.min,
                    value = this.value;
                let rate = value - this.min;
                let perc = rate/total*100;

                this.outerHTML = `<div class='gqui-slider__wrap ${className}'>
                    <input${inpId} class='gqui-hide' type='range' min='${this.min}' max='${this.max}' value='${value}'>
                    <div class='gqui-progress-bar gqui-slider__bar'>
                        <div class='gqui-progress-inner' style='width:${perc}%'></div>
                    </div>
                    <div class='gqui-slider__button' data-tiper='${parseInt(perc)}%' style='left:${perc}%'></div>
                </div>`;
            });
            $.ui.tiper();
        }
    });
    // button 拖动
    $('body').on({
        mousedown:function(e){
            let $btn = $(this);
            let $wrap = $btn.parent();

            $(document).on({
                'mousemove.gqui_slider': function(e){
                    $wrap.trigger('slider-update', {posX:e.clientX});
                },
                'mouseup.gqui_slider': function(e){
                    $(document).off('mousemove.gqui_slider mouseup.gqui_slider');
                }
            });
        },
        touchstart:function(e){
            let $btn = $(this);
            let $wrap = $btn.parent();

            $(document).on({
                'touchmove.gqui_slider': function(e){
                    $wrap.trigger('slider-update', {posX:e.touches[0].clientX});
                },
                'touchend.gqui_slider': function(e){
                    $(document).off('touchmove.gqui_slider touchend.gqui_slider');
                }
            });
        }
    }, '.gqui-slider__button');
    // bar 点击
    $('body').on({
        click: function(e){
            let $bar = $(this);
            let $wrap = $bar.parent();
            $wrap.trigger('slider-update', {posX:e.clientX});
        }
    }, '.gqui-slider__bar');
    // slider-update
    $('body').on({
        'slider-update': function(e){
            let posX = e.detail.posX;
            let $wrap = $(this);
            let $prog = $wrap.find('.gqui-progress-inner'),
                $btn = $wrap.find('.gqui-slider__button'),
                _inp = $wrap.find('input[type="range"]')[0];

            let wrapWidth = $wrap.width();
            let diffX = $wrap.offset().left;

            // calc
            let vp = (posX - diffX) / wrapWidth;
            vp<0 && (vp=0);
            vp>1 && (vp=1);
            let perc = vp*100;

            $btn.css({left: perc+'%'}).attr('data-tiper-content', parseInt(perc)+'%').trigger('tiper-update');
            $prog.css({width: perc+'%'});

            // input
            let total = _inp.max - _inp.min;
            let range = parseInt(_inp.min) + parseInt(total*vp);
            _inp.value = range;
        }
    }, '.gqui-slider__wrap');




    /** ------------------------------------
     * Pagination
     * ------------------------------------- */
    // let paginationOptsImpl = {
    //     currentPage:1, totalPage:100,
    //     callback: (page)=>{
    //         console.log(page);
    //     },
    //     wrapper: 'selector / element'
    // };
    ui.pagination = new $.chain({
        gquery:true,
        init:function(opts){
            let tp = opts.totalPage, cp = opts.currentPage;
            if(isNaN(tp)){
                throw new Error('[Pagination] params required.');
            }
            cp || (cp=1);
            cp>tp && (cp=tp);

            let cb = opts.callback;
            typeof cb!=='function' && (cb = (page)=>{
                console.log(this, page);
            });

            let $wrap = this.wrapper = $(opts.wrapper);
            if($wrap.length<1){throw new Error('Wrapper required.');}
            $wrap.addClass('gqui-pagination');

            this.initCall = opts.initCall || false;
            this.totalPage = tp;
            this.currentPage = cp;
            this.callback = cb;
            this.emptyTip = opts.emptyTip || '暂无数据';

            this.update(true);
            this._eventBind();

            return this;
        },
        update:function(trigger){
            let tp = this.totalPage, cp = this.currentPage;
            let pages = [cp], tick = 1,
                maxTick = window.innerWidth<520 ? 4 : 6;
            let pageLeft = cp, pageRight = cp;
            if(this.initCall==true && trigger==true){
                this.callback.call(this, cp);
            }
            this.initCall = true;

            while(tick <= maxTick){
                let isLeft = tick%2;
                pageLeft--;pageRight++;

                if(isLeft && pageLeft>0){
                    pages.push(pageLeft);pageRight--;
                } else if(pageRight<tp){
                    pages.push(pageRight);pageLeft++;
                } else if(pageLeft>0){
                    pages.push(pageLeft);pageRight--;
                } else {break;}
                tick++;
            }

            let listHTML = '';
            if(tp<=0){
                listHTML = `<li class='is-disabled'>${this.emptyTip}</li>`;
            } else {
                pages.sort((a, b)=>a-b).map((page, idx)=>{
                    let extraClass = '';
                    cp===page && (extraClass = " class='is-active'");
                    listHTML += `<li${extraClass}>${page}</li>`;
                });
                // 左右两侧是否达最值
                if(pages[0]>2){
                    listHTML = `<li>1</li><li class='is-more left'>···</li>${listHTML}`;
                } else if(pages[0]>1){
                    listHTML = `<li>1</li>${listHTML}`;
                }
                if(pages[pages.length-1]<tp-1){
                    listHTML += `<li class='is-more right'>···</li><li>${tp}</li>`;
                } else if(pages[pages.length-1]<tp){
                    listHTML += `<li>${tp}</li>`;
                }
            }


            let prevCls = '', nextCls = '';
            cp<=1 && (prevCls=' is-disabled');
            cp>=tp && (nextCls=' is-disabled');
            let html = `<button class='btn-prev${prevCls}'><span class='gqui-arrow-left'></span></button>
            <ul class='gqui-pagination__list'>
                ${listHTML}
            </ul>
            <button class='btn-next${nextCls}'><span class='gqui-arrow-right'></span></button>`;
            this.wrapper.html(html);
        },
        _eventBind:function(){
            let that = this;
            that.wrapper.on('click', 'li, button', function(){
                let $li = $(this);
                if($li.hasClass('is-active') || $li.hasClass('is-disabled')){
                    return;
                }

                // 如果为翻页按钮
                if($li.is('button')){
                    if($li.hasClass('btn-prev')){
                        that.currentPage--;
                    } else {
                        that.currentPage++;
                    }
                    return that.update(true);
                }

                // 如果为快翻
                if($li.hasClass('is-more')){
                    if($li.hasClass('left')){
                        let over = that.currentPage;
                        that.currentPage -= parseInt(over/2);
                    } else {
                        let over = that.totalPage - that.currentPage;
                        that.currentPage += parseInt(over/2);
                    }
                    return that.update(true);
                }

                let page = parseInt($li.text());
                that.currentPage = page;
                that.update(true);
            });
        }
    });


    /** ------------------------------------
     * Details
     * ------------------------------------- */
    $('body').on('click', '.gqui-details>summary', function(){
        let $det = $(this).parent();
        let _det = $det[0];

        // HTML5 自己添加的 open 属性在函数运行之后
        if(_det.open==true){return;}
        // 关闭其他所有打开的 details
        $('.gqui-details[open]').removeAttr('open');
        setTimeout(()=>{
            // 强制修改状态（处理浏览器无法处理的情况）
            if($det.attr('open')===undefined){
                $det.attr('open', '');
            }
            _detailsResize($det);
        }, 1);


        $('body').off('click.gqui-details').on('click.gqui-details', function(e){
            if(_det.contains(e.target)){return;}
            
            $det.removeAttr('open');
            $('.gqui-details[open]').length<1 && $('body').off('click.gqui-details');
        });
    });
    // 是否有空余空间展开 list
    function _detailsResize($det){
        let $list = $det.find('details-menu');
        let size = {
            width: $list.width(),
            height: $list.height()
        };

        let os = $det.offset(true);
        // 这里的 isLeft 指是否为向左展开
        let isLeft = $list.hasClass('is-right'),
            isTop = $list.hasClass('is-bottom');
        if(isLeft){
            os.left<size.width && os.right>size.width && $list.removeClass('is-right');
        } else {
            os.right<size.width && os.left>size.width && $list.addClass('is-right');
        }

        if(isTop){
            os.top<size.height && os.bottom>size.height && $list.removeClass('is-bottom');
        } else {
            os.bottom<size.height && os.top>size.height && $list.addClass('is-bottom');
        }
    }


    /** ------------------------------------
     * Watermark
     * 
     * @opts [opacity]  透明度          默认：2%
     * @opts [size]     文字大小         默认：38px
     * @opts [color]    文字颜色 RGB 值  默认：主题文字色
     * @opts [rotate]   旋转角度数值      默认：0
     * @opts [density]  密度            默认：60px
     * @opts [content]  水印内容         默认：gquery.cn
     * ------------------------------------- */
    fnExtend.watermark = function(opts){
        if(typeof opts==='string'){
            opts = {content:opts};
        } else if(typeof opts!=='object'){
            opts = {};
        }
        opts.opacity || (opts.opacity = 0.02);
        opts.size || (opts.size = 38);
        opts.density || (opts.density = 60);
        opts.content || (opts.content = 'gquery.cn');

        let optsCss = {}, prefix = '--gqui-wm-';
        opts.opacity && (optsCss[prefix+'opacity'] = opts.opacity);
        opts.size && (optsCss[prefix+'size'] = opts.size+'px');
        opts.color && (optsCss[prefix+'color'] = opts.color);
        opts.rotate && (optsCss[prefix+'rotate'] = opts.rotate+'deg');
        Object.getOwnPropertyNames(optsCss).length>1 && this.css(optsCss);

        return this.each(function(){
            let $wrap = $(this).remove('.gqui__watermark');
            let size = {
                w: $wrap.width(), h: $wrap.height()
            };

            let contHTML = `<div class='gqui__watermark' style='top:0;left:0;'>${opts.content}</div>`;
            // 先推送至 DOM 获取真实尺寸
            $wrap.append(contHTML);
            let $mark = $wrap.find('.gqui__watermark:last-of-type');
            size.mw = $mark.width()+opts.density;
            size.mh = $mark.height()+opts.density;
            $mark.remove();

            // 计算如何铺满整个容器
            let cols = size.w/(size.mw),
                rows = size.h/(size.mh);
            cols = Math.ceil(cols);
            rows = Math.ceil(rows);

            // 遍历
            let top = 0, left = 0;
            contHTML = '';
            for (let i = 0; i < rows; i++) {
                top = i*size.mh;
                for (let j = 0; j < cols; j++) {
                    left = j*size.mw - opts.density;
                    contHTML += `<div class='gqui__watermark' style='top:${top}px;left:${left}px;'>${opts.content}</div>`;
                }
            }
            $wrap.append(contHTML);
        });
    };


    $.fn.extend(fnExtend);
    return ui;
}));