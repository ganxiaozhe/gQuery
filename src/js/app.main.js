'use strict';
/** ------------------------------------
 * @app stract
 * ------------------------------------- */
let __app = {
    init:{}, i18n:{
        lang:'', scope:'', debug:window.location.host.indexOf('gquery.cn')<0
    },
    nav:{}, theme:{
        val:$.storage.get('gqui-theme')||'light'
    }
};


/** ------------------------------------
 * @app Nav
 * ------------------------------------- */
__app.init.nav = function(){
    let dnav = $(':root').attr('data-nav') || 'true';
    if(dnav=='false'){return;}

    $('#header').html(`<section class='l'>
        <a id='headerTitle' href='/'>gQuery</a>
    </section>
    <section class='r'>
        <input type='checkbox' id='nav-btn' />

        <nav id='nav'>
            <ul>
                <a href='/'><li class='i18n-global-navHome'>主页</li></a>
                <a href='/docs/'><li class='i18n-global-navDocs'>文档</li></a>
                <a href='/plugins/'><li class='i18n-global-navPlugin'>插件</li></a>
                <a href='https://github.com/ganxiaozhe/gQuery' target='_blank'><li class='i18n-global-navDownload'>下载</li></a>
            </ul>
        </nav>

        <div class='gqui-mark-themeToggle gqui-toggle mr-4'>
            <div class='gqui-toggle-l'><span>🌛</span></div>
            <div class='gqui-toggle-r'><span>🌞</span></div>
            <div class='gqui-toggle-btn'></div>
        </div>
        <button id='lang-btn' class='i18n-global-lang btn sm'>Language</button>

        <label for='nav-btn' class='btn-menu'></label>
    </section>

    <ul id='lang-list' class='hide'>
        <li data-lang='zh-cn'>简体中文</li>
        <li data-lang='en-us'>English</li>
    </ul>`).before(`<div id='headerMark'></div>`);


    __app.theme.bind();
};


/** ------------------------------------
 * @app Footer
 * ------------------------------------- */
__app.init.footer = function(){
    $('#footer').html(`<div class='container grid' style='--gap:var(--x1);'>
        <section class='col-6 sm-ta-c'>${new Date().getFullYear()} © gQuery<span class='mr-1 hide-sm opacity-50'> ,</span><a id='footer-icp' class='sm-block' href='http://beian.miit.gov.cn/' target='_blank'>渝ICP备20007909号-12</a></section>
        <section class='col-6 ta-r sm-ta-c'>Made with <b style='color:var(--red);'>❤</b> by <a href='https://gxzv.com/?from=gquery' target='_blank' class='fw-b'>Ganxiaozhe</a></section>
    </div>`);
    

    // setTimeout(()=>{
    //     $('#footer-icp').text('渝 ICP 备 20007909 号');
    // }, 1000);
};


/** ------------------------------------
 * @app Init
 * ------------------------------------- */
__app.init.theme = function(){
    let theme = __app.theme.val;
    if(theme=='dark'){
        __app.theme.switch(__app.theme.val);
    }
};


/** ------------------------------------
 * @app Theme
 * ------------------------------------- */
__app.theme.bind = function(){
    let $marks = $('.gqui-mark-themeToggle:not([gqui-marked])');

    $marks.click(function(){
        __app.theme.switch();
    }).attr('gqui-marked', '');
};

__app.theme.switch = function(val){
    if(val===undefined){
        val = (this.val == 'light' ? 'dark' : 'light');
    }
    this.val = val;

    $(':root').attr('gqui-theme', val);
    $.storage.set('gqui-theme', val);

    let $marks = $('.gqui-mark-themeToggle');
    val=='dark' ? $marks.addClass('gqui-toggle--checked') : $marks.removeClass('gqui-toggle--checked');
};



/** ------------------------------------
 * @app i18n Language
 * ------------------------------------- */
__app.init.i18n = function(){
    __app.i18n.set();

    $('#lang-btn').click(function(){
        $('#lang-list').removeClass('hide');
        __app.i18n.tempDelay = setTimeout(()=>{
            $('#lang-list').addClass('hide');
        }, 8000);
    });
    $('#lang-list').on('click', 'li', function(){
        let $lang = $(this), lang = $(this).attr('data-lang');
        // 防止重复请求
        if(lang===__app.i18n.lang || __app.i18n.loading){return;}
        __app.i18n.loading = true;

        $lang.addClass('loading').prepend("<i class='ti ti-cloud-download mr-2'></i>");
        __app.i18n.set(lang, function(){
            $lang.removeClass('loading').remove('i');
            $('#lang-list').addClass('hide');
            __app.i18n.loading = false;
        });

        clearTimeout(__app.i18n.tempDelay);
    });
};

/**
 * 设置语言
 */
__app.i18n.set = function(lang, callback){
    let attrs = this.getAttrs();
    if(lang===undefined){
        lang = $.storage.get('lang') || 'zh-cn';
    } else {
        $.storage.set('lang', lang);
    }

    attrs.prefix && (lang+='-'+attrs.prefix);
    this.lang = lang;

    let url = '/lib/lang/'+lang+'.js';
    this.debug && (url+='?'+Math.random());

    $.fetch(url, 'text').then(rsp=>{
        typeof callback==='function' && callback();

        let lang = $.parse.json(rsp), obj = lang.global;
        if(typeof obj==='object'){
            for(let k in obj){
                $(`.i18n-global-${k}`).html(obj[k]);
            }
        }

        obj = attrs.scope=='unknown' ? lang : lang[attrs.scope];
        for(let k in obj){
            $(`.i18n-${k}`).html(obj[k]);
        }
    });
};
/**
 * 根据页面路径获取语言文件
 */
__app.i18n.getAttrs = function(){
    let attrs = {scope:'', prefix:''}, 
        pwd = window.location.pathname.replace(/^\//,'');

    switch(pwd){
        case '':case 'index.html':
            attrs.scope = 'index';
            break;
        default:attrs.scope = 'unknown';
    };
    return attrs;
};



/** ------------------------------------
 * @app $init.function
 * ------------------------------------- */
$(function(){
    for(let fn in __app.init){
        typeof __app.init[fn] === 'function' && __app.init[fn]();
    };
});


var _hmt = _hmt || [];
__app.init.tj_baidu = function(){
    if(window.location.host.indexOf('gquery.cn')<0 || !window.navigator.cookieEnabled){return;}
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?9bb6fc82ab5837c59b4e03e039fe4735";
    var s = document.getElementsByTagName("script")[0]; 
    s.parentNode.insertBefore(hm, s);
};
