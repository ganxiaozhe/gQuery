'use strict';
let __docs = {
    init:{}, fn:{}, data:{}
};
__docs.data.nav = [
    {href:'/docs/',name:'什么是 gQuery'},
    {name:'基础', section:true},
    {href:'/docs/selector/',name:'选择器'},
    {href:'/docs/dom/',name:'DOM 操作'},
    {name:'进阶入门', section:true},
    {href:'/docs/effects/',name:'特效'},
    {href:'/docs/event/',name:'事件'},
    {href:'/docs/extend/',name:'拓展方法'},
    {href:'/docs/request/',name:'网络请求'},
    {name:'其他', section:true},
    {href:'/docs/donate/',name:'项目捐赠'},
];



__docs.init.genNav = function(){
    let list = __docs.data.nav, listHTML = '';
    list.map((li)=>{
        if(li.section){
            listHTML += `<div class='docsNav__item is-section'>${li.name}</div>`;
            return;
        }

        let extClass = '';
        window.location.pathname===li.href && (extClass = ' is-active');
        listHTML += `<a href='${li.href}' class='docsNav__item${extClass}'>${li.name}</a>`;
    });

    $('#docsNav').html(listHTML).after(`<button id='docsNav-switcher' class='btn btn-icon warning'><i class='ti ti-map'></i></button>`);


    // event
    $('#docsNav-switcher').on('click', function(){
        $('#docsNav').toggleClass('expand');
    });
}



__docs.init.h2Mark = function(){
    $('#docsInner h2').each(function(){
        let $h2 = $(this);
        let title = $h2.text();

        $h2.ohtml(`<h2 id='${title}'><a href='#${title}'>${title}</a></h2>`);
    });
};


/** ------------------------------------
 * @gxz $init.function
 * ------------------------------------- */
$(function(){
    for(let fn in __docs.init){
        typeof __docs.init[fn] === 'function' && __docs.init[fn]();
    };
});



/** ------------------------------------
 * @gquery codeAutoParse
 * ------------------------------------- */
$.codeAutoParse = function(lang, spl){
    let t = {tax:0};
    spl || (spl='\n');lang || (lang='Text');
    $('.code-autoParse:not([data-gqui])').each(function(){
        t.tax++;
        let codes = this.innerHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
        this.innerText = codes;
        if(typeof hljs==='object' && 'highlight' in hljs){
            hljs.highlightBlock(this);
        }
        codes = this.innerHTML.replace(/<br>/g,'\n').split(spl);

        t.lang = $(this).attr('data-lang') || lang;
        t.h = `<div class='of-wrapper'><div class='code-nav flex-bt'>`+
            `<div class='lang'>${t.lang}</div>`+
            `<div class='opt opt-copy'>复制</div>`+`</div><table class='code-list'><tbody>`;

        t.h = codes.reduce((pre, cur, i)=>{
            t.ln = i+1;
            t.first = cur.substr(0,1);
            cur = cur.replace(/^\\#/,'#');
            if(t.first=='#'){
                cur = `<span class='remark'>${cur}</span>`;
            }
            return `${pre}<tr><td class='num nsel'>${t.ln}</td><td class='code'>${cur}</td></tr>`;
        }, t.h);

        t.h += "</tbody></table></div>";
        this.innerHTML = t.h;
    }).attr('data-gqui','1');

    $('.code-autoParse .opt-copy:not([data-gqui])').on('click',function(){
        let codes = $(this).parent().parent().find('.code-list .code');
        t.this = $(this);
        t.copy = "";
        for (let i = 0; i < codes.length; i++) {
            t.c = codes[i].innerText;
            t.first = t.c.substr(0,1);
            if(t.first=='#'){continue;}
            t.copy += (t.copy=="" ? t.c : "\n"+t.c);
        }
        $.copy(t.copy);

        t.this.text('复制成功');
        setTimeout(()=>{t.this.text('复制');},1000);
    }).attr('data-gqui','1');

    return t.tax;
};
$(function(){$.codeAutoParse();});