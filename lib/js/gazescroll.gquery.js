// =================================================
//
// GazeScroll.gQuery.js v0.1.3
// (c) 2020, JU Chengren (Ganxiaozhe)
// Released under the MIT License.
// gquery.cn/plugins/gazescroll
//
// =================================================
;(function(){
    'use strict';
    if(!$ || !gQuery){throw new Error('GazeScroll.js need gQuery: https://gquery.cn/');}
    console.log('%c GazeScroll 0.1.3 %c gquery.cn/plugins/gazescroll \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');


    let __gs = {
        init: function(opts){
            if(typeof opts!=='object' || !opts){return 'empty object';}
            //
            // sel - 选择器
            // calc - 计算类操作
            // show - 出现时
            // hide - 隐藏时
            //
            if(typeof opts.sel !== 'string'){return '!{sel:String}';}
            if(opts.calc && typeof opts.calc !== 'function'){return '!{calc:Function}';}
            if(opts.show && typeof opts.show !== 'function'){return '!{show:Function}';}
            if(opts.hide && typeof opts.hide !== 'function'){return '!{hide:Function}';}

            return this.list.push(opts);
        },
        remove: function(val){
            if(val===undefined){
                let li = this.list;
                this.list = [];
                return li;
            }

            return $.array.finder(this.list, {sel:val}, {limit:0, array:1}).reduce((acc, cur, idx)=>{
                acc.push( this.list.splice(cur.index-idx, 1) );
                return acc;
            }, []);
        },
        scroll: function(e){
            let _s = {top: document.body.scrollTop==0 ? document.documentElement.scrollTop : document.body.scrollTop};
            _s.wh = window.innerHeight;
            _s.view = _s.top + _s.wh;

            _s.len = this.list.length;
            for(let i=0; i<_s.len; i++){
                let it = this.list[i];
                let $el = $(it.sel);

                $el.each(function(idx){
                    let $it = $(this), is = {};
                    is.h = $it.height();
                    is.pos = $it.offset();
                    is.pos.bottom = is.pos.top + is.h;

                    // 距离计算
                    is.dist = {top: _s.view - is.pos.top};
                    is.realDist = {top: is.dist.top-is.h};
                    if(is.pos.top<=_s.view+10 && is.realDist.top<=_s.wh+10){
                        // 出现时
                        if(!it[`show${idx}`]){
                            it.show && it.show.call(this, is);
                            // Direction 从下向上 ? 从上向下
                            it[`dir${idx}`] = is.dist.top > _s.wh/2 ? 0 : 1;
                        }

                        // 百分比 Percentage
                        is.pp = parseFloat((is.dist.top/_s.wh).toFixed(5));
                        is.pp<0 && (is.pp=0);

                        // 完全百分比 Fully percentage
                        is.fpp = parseFloat((is.dist.top/(_s.wh+is.h)).toFixed(5));
                        is.fpp<0 && (is.fpp=0);
                        is.fpp>1 && (is.fpp=1);

                        // 底部百分比 Percentage bottom
                        is.pp_b = _s.view>=is.pos.bottom ? 
                        parseFloat((is.realDist.top/_s.wh).toFixed(5)) : 0;
                        is.pp_b>1 && (is.pp_b=1);

                        is.rppMax = is.pp;
                        is.pp>1 && (is.pp=1);
                        is.rpp = is.pp;
                        // 从上至下 : 从下至上
                        is.pp = it[`dir${idx}`] ? is.pp : 1-is.pp;

                        it.calc && it.calc.call(this, is);
                        it[`show${idx}`] = 1;
                    } else {
                        it[`show${idx}`] && it.hide && it.hide.call(this, is);
                        it[`show${idx}`] = 0;
                    }
                });
            }
        },
        list: []
    };

    $.extend({
        gazescroll: function(opts){
            return __gs.init(opts);
        },
        removeGazescroll: function(val){
            return __gs.remove(val);
        }
    });

    $(window).on('scroll.gazescroll', function(){
        return __gs.scroll();
    }, {passive:true});

})();