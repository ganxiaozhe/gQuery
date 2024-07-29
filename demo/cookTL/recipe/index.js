'use strict';
let __page = {
    config:{appId:''},
    init:{}, data:{},
    do:{}, bind:{},
    api:{
        config:{
            host: location.host.indexOf('gquery.cn')>-1 ? 'https://gquery.cn/pyApi/' : 'http://127.0.0.1:8000/api/',
            token: ''
        },
        send:function(url, data, bodyMH){
            let conf = this.config;

            if(typeof url === 'object'){
                url.url = conf.host+url.url;
            } else {
                url = {url:conf.host+url};
            }

            if(conf.token){
                url.headers = {token:conf.token};
            }
            return $.fetch(url, data, bodyMH);
        }
    }
};
__page.do.isWeiXin = function(){
    let ua = window.navigator.userAgent.toLowerCase();
    if( ua.match(/MicroMessenger/i)=='micromessenger' ){
        return true;
    }
    return false;
};
let __cd = {}, __tips = [];



__page.init.data = function(){
    __page.isWeixin = __page.do.isWeiXin();
    let pata = __page.data;
    pata.id = $.get.queryParam('id') || 17874;
    pata.token = $.get.queryParam('token') || 'visitor_user';

    $.fetch(`https://acp.53iq.com/cookbook/?cookbook_id=${pata.id}&token=${pata.token}`, 'json').then(rsp=>{
        if(rsp.code!==0){
            return $.ui.dialog(`数据获取失败 #${rsp.code}`, rsp.message);
        }

        __cd = rsp.data;
        __tips = __cd.steps;
        __page.do.gotData();
    });
};
__page.init.queryParams = function(){
    let pata = __page.data;
    pata.play = $.get.queryParam('play') || 0;
    pata.play = parseInt(pata.play);
    pata.play_type = $.get.queryParam('play_type') || 'preview';
    pata.step = $.get.queryParam('step') || 0;
    pata.playCurrentStep = pata.step;
};


/** ------------------------------------
 * @do 获取数据后
 * ------------------------------------- */
__page.do.gotData = function(){
    let pata = __page.data;

    let __json = {title:{
        background: {url: __cd.albums},
        text: {
            headline: `<div style='font-size:0.5em;opacity:0.7'>制作:</div> ${__cd.title}`
        }
    }, events:[]};
    //let __sec = $.date().diff($.date().format('yyyy-mm-dd 00:00:00'))._df._s;
    let __sec = 0;
    let __year = $.date().format('yyyy');
    __tips.map((li, idx)=>{
        __json.events.push({
            media: {url:li.image},
            start_date: {
                year: __year, second: __sec,
                display_date: `第 ${idx+1} 步`
            },
            text: {
                "headline": `第 ${idx+1} 步`,
                "text": li.desc||'暂无描述'
            }
        });
        __sec += 60;
    });
    pata.json = __json;
    pata.images = __tips.map(li=>li.image);

    __page.do.timeline();
    $('body').loader(false);

    // 菜谱标题
    $('#cookCard-title').text(__cd.title);
    $('#app_title').text(`菜谱: ${__cd.title}`);
    pata.shareInfo = {
        title:'菜谱: '+__cd.title,
        desc:'快来看看这个菜谱！拜托，超级美味的！',
        link:window.location.href.replace(/#.*/g, ''), // 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
        imgUrl:__cd.albums
    }

    // 微信校验
    //if(!__page.isWeixin){return;}
    __page.api.send('wechat/getJSConfig', {
        url:window.location.href.replace(/#.*/g, '')
    }, 'json').then(rsp=>{
        if(rsp.code!==200){
            console.error(rsp);
            return $.ui.alert('[WECHAT] JS-SDK 签名失败');
        }

        let rata = rsp.data;
        wx.config({
            debug: false, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
            appId: rata.appId, // 必填，公众号的唯一标识
            timestamp: rata.timestamp, // 必填，生成签名的时间戳
            nonceStr: rata.nonceStr, // 必填，生成签名的随机串
            signature: rata.signature,// 必填，签名
            jsApiList: [
                'updateAppMessageShareData', 'updateTimelineShareData',
                'onMenuShareAppMessage', 'onMenuShareTimeline'
            ] // 必填，需要使用的 JS 接口列表
        });
        wx.ready(function(){
            let sd = __page.data.shareInfo;
            wx.updateAppMessageShareData({ 
                title: sd.title, desc: sd.desc,
                link: sd.link, imgUrl: sd.imgUrl,
                success: function(res){}
            });
        });
    });
};



/** ------------------------------------
 * @do 生成 timeline
 * ------------------------------------- */
__page.do.timeline = function(){
    $('#timeline-embed').height( window.innerHeight );
    let tl = window.timeline = new TL.Timeline('timeline-embed', __page.data.json, {
        hash_bookmark:false,
        language:'zh-cn',
        // 防止在移动端显示残缺
        timenav_mobile_height_percentage:0,
        // 高度
        timenav_height_percentage:25,
        timenav_mobile_height_percentage:20,
        timenav_height_min:120
    });

    tl.on('loaded', function(){
        __page.do.timelineDone();
    });
    tl.on('change', function(rd){
        let id = rd.unique_id,
            pata = __page.data;
        let idx = $.array.finder(pata.idList, id).index;
        pata.playCurrentStep = idx;

        __page.do.markerChange();
        if(idx>=pata.tlMax){__page.do.playDone();}

        if(!pata.playReady){return;}
        if(pata.play && !pata.playByAuto){
            $.ui.alert('[自动播放] 检测到手动切换，自动播放已取消');
            pata.play = 0;
            clearTimeout(pata._playDelay);
            $('#icon-normalPlay').removeClass('ti-player-pause').addClass('ti-player-play');
        }
    });

    $(window).on('resize.timeline', function(){
        $('#timeline-embed').height( window.innerHeight );
        window.timeline.updateDisplay();
    });
};
__page.do.timelineDone = function(){
    let that = this,
        pata = __page.data;

    // 获取 TimelineID 序列
    pata.idList = $('.tl-slider-item-container .tl-slide').attr('id');
    pata.tlMax = pata.idList.length-1;

    __page.bind.images();
    __page.bind.intfOperate();

    // 播放
    if(pata.step){
        setTimeout(()=>{
            timeline.goTo(pata.step);
            pata.playReady = true;
        }, 10);
    } else {
        setTimeout(()=>{pata.playReady = true;}, 10);
    }
    pata.play&&that.timelinePlay();


    // 是否是首次打开 cookTimeline
    // let skey = 'CTL-1Visit-'+pata.token;
    // if($.storage.get(skey)){
    //     $('.tl-message-full').hide();
    // } else {
    //     $.storage.set(skey, new Date().getTime());
    // }


    // share
    $('.tl-text-content-container .tl-headline').append(`<i class='ti ti-dots'></i>`);
    $('.tl-slide-titleslide .tl-headline .ti-dots').remove();
    $('.tl-headline .ti-dots').click(function(){
        $.ui.actionsheet({menu:[
            {title:'分享此步骤', func:function(){
                __page.do.share();
            }},
            {title:'从该步骤预览播放', func:function(){
                pata.play = 1;
                pata.play_type = 'preview';
                pata.playByAuto = 1;
                __page.do.markerChange();
                __page.do.timelinePlay();
            }},
            {title:'从该步骤正式播放', func:function(){
                pata.play = 1;
                pata.play_type = 'normal';
                pata.playByAuto = 1;
                __page.do.markerChange();
                __page.do.timelinePlay();
            }}
        ]});
    });
    // userThumb
    $('.tl-slide.tl-slide-titleslide').append(`<div id='user-thumb' class='user-thumb'>
        <div class='user-thumb-avatar gqui-avatar rad'><img src='${__cd.user_image}'></div>
        <div class='user-thumb-item'>
            <i class='user-thumb__icon ti ti-star'></i>
            <div class='user-thumb__text'>${__cd.collect}</div>
        </div>
        <div class='user-thumb-item' data-opt='share'>
            <i class='user-thumb__icon ti ti-share'></i>
            <div class='user-thumb__text'>860</div>
        </div>
    </div>`);
    $('#user-thumb').on('click', '.user-thumb-item[data-opt]', function(){
        let $item = $(this);
        let opt = $item.attr('data-opt'),
            pata = __page.data;

        switch(opt){
            case 'share':
                __page.do.share();
                break;
            default:$.ui.alert('[未知操作] '+opt);
        }
    });
    // icon
    $('.tl-timenav-item-container').append(`<div id='tlProgMarker'></div><div id='tlIconMarker' class='img-wrap'>
        <img src='${__cd.user_image}' />
    /div>`);

    // 显示序号
    $('.tl-timeaxis-minor').hide(); // 隐藏时间
    $('.tl-timeaxis-major span').css('opacity', 0);
    $('.tl-timemarker-timespan').each(function(idx){
        $(this).append(`<div class='tl-timemarker-line-indexer'>${idx+1}</div>`)
    });

    // 隐藏 0 点以前的时间
    // $('.tl-timeaxis-minor .tl-timeaxis-tick').each(function(){
    //     let left = parseInt($(this).css('left'));
    //     if(left<0){this.style.display = 'none';}
    // });

    console.log('timeline done');
    setTimeout(()=>{$(window).trigger('resize');}, 1200);
};
__page.do.timelinePlay = function(){
    let pata = __page.data, delayMs = 3000;
    // if(pata.play_type=='normal'){
    //     let tip = __tips[pata.playCurrentStep-1],
    //         ntip = __tips[pata.playCurrentStep];
    //     if(tip){
    //         delayMs = (ntip.time-tip.time)*1000*60;
    //     }
    //     delayMs==0 && (delayMs=3000);
    // }

    pata._playDelay = setTimeout(()=>{
        if(!pata.play){return;}
        pata.playCurrentStep++;
        pata.playByAuto = 1;
        timeline.goTo(pata.playCurrentStep);
        setTimeout(()=>{pata.playByAuto = 0;}, 10);

        if(pata.playCurrentStep>=pata.tlMax){
            __page.do.autoPlayDone();
            return;
        }
        __page.do.timelinePlay();
    }, delayMs);
};
// 移动的 icon
__page.do.markerChange = function(){
    let pata = __page.data;
    let idx = pata.playCurrentStep;

    let item = false;
    // iconMarker
    let markCss = {left:'0px', opacity:0},
        porgCss = {width:'0px'};
    if(idx>0){
        let $timeMarker = $('.tl-timenav-item-container .tl-timemarker').eq(idx-1);
        markCss.left = $timeMarker.css('left');
        markCss.opacity = 1;
        porgCss.width = markCss.left;

        item = __tips[idx-1];
    }
    $('#tlIconMarker').stop().css(markCss);
    $('#tlProgMarker').stop().css(porgCss);
    if(item && pata.play && pata.playByAuto){
        let $nextMarker = $('.tl-timenav-item-container .tl-timemarker').eq(idx);
        let nextLeft = $nextMarker.css('left');
        let timing = 3000;
        // if(pata.play_type==='normal'){
        //     let next = __tips[idx];
        //     let timeDiff = next ? next.time-item.time : item.time;
        //     timing = timeDiff*1000*60;
        // }
        // timing==0 && (timing=3000);

        $('#tlIconMarker').animate({left:nextLeft}, timing);
        $('#tlProgMarker').animate({width:nextLeft}, timing);
    }
};
// 自动播放结束
__page.do.autoPlayDone = function(){
    __page.do.playDone();
};
__page.do.playDone = function(){
    $('#intfOperate').fadeIn();
};


/** ------------------------------------
 * @bind 生成 timeline 后绑定交互
 * ------------------------------------- */
__page.bind.images = function(){
    $('.tl-slider-item-container').on('click', '.tl-media-image', function(e){
        e.preventDefault();
        let $img = $(this);
        let src = $img.attr('src');

        let srcArray = __page.data.images;
        let finder = $.array.finder(srcArray, src);
        $.gazeimg.show(srcArray, finder.index);
    });

    $('.tl-timemarker-media-container .tl-icon-image').each(function(idx){
        let isrc = __page.data.images[idx];
        $(this).parent().css('height','auto');
        $(this).ohtml(`<img src='${isrc}' />`);
    });
    $('.tl-timemarker-content').each(function(idx){
        if(__tips[idx].type!=1){return;}

        let $cont = $(this);
        $cont.append(`<i class='tl-icon-background ti ti-alarm'></i>`);
    });
};

/** ------------------------------------
 * @bind 操作界面
 * ------------------------------------- */
__page.bind.intfOperate = function(){
    $('#intfOperate').on('click', '[data-opt]', function(){
        let $btn = $(this);
        let opt = $btn.attr('data-opt'),
            pata = __page.data;

        switch(opt){
            case 'shareSingle':
                __page.do.shareSingle();
                break;
            case 'shareAll':
                __page.do.shareAll();
                break;
            case 'previewPlay':case 'normalPlay':
                //$('#intfOperate').fadeOut();
                let $icon = $btn.find('.icon');
                if(pata.play==1){
                    // 停止播放
                    pata.play = 0;
                    clearTimeout(pata._playDelay);
                    __page.do.markerChange();
                    $icon.removeClass('ti-player-pause').addClass('ti-player-play');
                    return;
                }
                // 开始播放
                pata.play_type = opt.replace(/Play/, '');
                pata.play = 1;pata.playByAuto = 1;
                setTimeout(()=>{pata.playByAuto = 0;}, 10);

                $icon.removeClass('ti-player-play').addClass('ti-player-pause');
                pata.playCurrentStep>=pata.tlMax && timeline.goTo(0);
                __page.do.markerChange();
                __page.do.timelinePlay();
                break;
            default:$.ui.alert('[未知操作] '+opt);
        }
    });
};

/** ------------------------------------
 * @share 分享选择
 * ------------------------------------- */
__page.do.share = function(){
    let pata = __page.data;
    let hrefPrev = window.location.href.replace(/\?.*/g, ''),
        hrefLast = window.location.href.replace(/.*?[?/]/g, ''),
        shareURL = window.location.href.replace(/#.*/g, '');
    if(hrefLast){
        if(hrefLast.indexOf('step=')>-1){
            shareURL = shareURL.replace(/step=\d/, `step=${pata.playCurrentStep}`);
        } else {
            shareURL += `&step=${pata.playCurrentStep}`;
        }
    } else {
        shareURL += `?step=${pata.playCurrentStep}`;
    }
    pata.shareURL = shareURL;
    // 提前生成二维码
    __page.do.qrcode();

    $.ui.actionsheet({menu:[
        {title:'分享至微信', func:function(){
            // if(!__page.isWeixin){
            //     $.ui.dialog('分享失败', '请在微信中打开进行分享。');
            //     return;
            // }
            let sd = __page.data.shareInfo;
            sd.link = shareURL;
            if(typeof jsapi==='object' && typeof jsapi.shareWechat==='function'){
                jsapi.shareWechat(sd.title, sd.desc, sd.imgUrl, sd.link);
                return;
            }

            $.ui.dialog('提示', '请点击右上角分享至微信好友、朋友圈或 QQ 好友');
            wx.updateAppMessageShareData({ 
                title: sd.title, desc: sd.desc,
                link: sd.link, imgUrl: sd.imgUrl,
                success: function(res){
                    // 设置成功
                    console.log(res);
                }
            });
            // 兼容
            // wx.onMenuShareAppMessage({
            //     title: sd.title, desc: sd.desc,
            //     link: sd.link, imgUrl: sd.imgUrl,
            //     type: 'link', // 分享类型,music、video或link，不填默认为link
            //     dataUrl: '', // 如果 type 是music或video，则要提供数据链接，默认为空
            // }, function(res){
            //     // 用户点击了分享后执行的回调函数
            //     console.log(res);
            // }, function(err){
            //     console.log(err);
            // });
        }},
        {title:'复制链接', func:function(){
            $.copy(shareURL);
            $.ui.alert('链接复制成功，快去分享吧！');
        }},
        {title:'保存图片', func:function(){
            $('#cookCardImg').empty();
            $('#cookCard').show();
            pata.playCurrentStep==0 ? __page.do.shareAll() : __page.do.shareSingle();
        }}
    ]});
};




/** ------------------------------------
 * @share 所有节点分享
 * ------------------------------------- */
__page.do.shareAll = function(){
    let that = this, pata = __page.data;
    let listHTML = '';

    listHTML += __page.do.genTLItemAll('开始');
    __tips.map((li, idx)=>{
        listHTML += __page.do.genTLItemAll(li, idx+1);
    });
    listHTML += __page.do.genTLItemAll('结束');

    $('#cookCard-timeline').html(listHTML);
    $('#intfExport').fadeIn(400);
    setTimeout(()=>{
        __page.do.genShareImg();
    }, 400);
};
__page.do.genTLItemAll = function(li, step){
    if(typeof li==='string'){
        return `<div class='gqui-timeline-item timeline-item-minor'>
            <div class='gqui-timeline-label'></div>
            <div class='gqui-timeline-badge'></div>
            <div class='gqui-timeline-content'><h4>${li}</h4></div>
        </div>`;
    }

    let mins = Math.round(li.time/60);
    let minText = mins>0 ? `${mins} 分钟` : '——';

    return `<div class='gqui-timeline-item timeline-item-simple'>
        <div class='gqui-timeline-label'>${step}</div>
        <div class='gqui-timeline-badge'></div>
        <div class='gqui-timeline-content'>
            <div>
                <h4>${li.content}</h4>
                <h5 class='item-date'>${minText}</h5>
            </div>
            <div class='img-wrap'><img src='${li.path}'></div>
        </div>
    </div>`;
};


/** ------------------------------------
 * @share 单个节点分享
 * ------------------------------------- */
__page.do.shareSingle = function(){
    let that = this, pata = __page.data;
    let step = pata.playCurrentStep;
    if(step===0){
        return $.ui.alert('当前节点不是有效步骤。');
    }

    // 生成 gqTimeline 结构
    let listHTML = '', std = {
        pprev:__tips[step-3], 
        prev:__tips[step-2], curr:__tips[step-1], next:__tips[step],
        nnext:__tips[step+1]
    };
    if(std.pprev){
        listHTML += __page.do.genTLItem(0,0,'more');
        if(!std.next){
            listHTML += __page.do.genTLItem(std.pprev, step-2);
        }
    }
    if(std.prev){
        listHTML += __page.do.genTLItem(std.prev, step-1);
    }
    listHTML += __page.do.genTLItem(std.curr, step, 'main');
    if(std.next){
        listHTML += __page.do.genTLItem(std.next, step+1);
    }
    if(std.nnext){
        if(!std.prev){
            listHTML += __page.do.genTLItem(std.nnext, step+2);
        }
        listHTML += __page.do.genTLItem(0,0,'more');
    }

    $('#cookCard-timeline').html(listHTML);
    $('#intfExport').fadeIn(400);
    setTimeout(()=>{
        __page.do.genShareImg();
    }, 400);
};
__page.do.genTLItem = function(li, step, level){
    if(level==='more'){
        return `<div class='gqui-timeline-item timeline-item-more'>
            <div class='gqui-timeline-label'></div>
            <div class='gqui-timeline-content'>
                <h4>······</h4>
            </div>
        </div>`;
    }
    level||(level = 'minor');
    let mins = Math.round(li.time/60);


    if(level==='minor'){
        return `<div class='gqui-timeline-item timeline-item-minor'>
            <div class='gqui-timeline-label'>${step}</div>
            <div class='gqui-timeline-badge'></div>
            <div class='gqui-timeline-content'>
                <h4 class='flex-bt'>
                    <span>${li.content}</span>
                    <span class='item-date'>${mins} 分钟</span>
                </h4>
            </div>
        </div>`;
    }

    return `<div class='gqui-timeline-item timeline-item-main'>
        <div class='gqui-timeline-label'>${step}</div>
        <div class='gqui-timeline-badge'></div>
        <div class='gqui-timeline-content'>
            <h3 class='flex-bt'>
                <span>${li.content}</span>
                <span class='item-date'>${mins} 分钟</span>
            </h3>
            <div class='img-wrap my-3'><img src='${li.path}'></div>
            <p>步骤的描述文字步骤的描述文字步骤的描述文字，步骤的描述文字步骤的描述文字步骤的描述文字步骤的描述文字，步骤的描述文字步骤的描述文字步骤的描述文字。</p>
        </div>
    </div>`
};


__page.do.genShareImg = function(){
    html2canvas($('#cookCard')[0], {
        allowTaint: true, useCORS: true
    }).then(function(canvas){
        $('#cookCardImg').html(`<div class='img-wrap'><img src='${canvas.toDataURL()}'></div>`);
        $('#cookCard').hide();
    });
};
__page.init.export = function(){
    $('#exportLayer').on('click', '.btn', function(){
        let $btn = $(this);
        if($btn.hasClass('cancel')){
            $('#intfExport').fadeOut(400);return;
        }

        let anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.download = "菜谱标题名称.jpg";
        anchorTag.href = $('#cookCardImg img').attr('src');
        anchorTag.target = '_blank';
        anchorTag.click();

        $.ui.dialog('保存成功', '若图片没有被自动下载，请长按图片手动保存。');
    });
};
__page.do.qrcode = function(){
    let pata = __page.data;
    let $qrCode = $('#cookCard-qrCode').empty();
    if($qrCode.length<1){return;}

    let payCode = new QRCode($qrCode[0], {
        text: pata.shareURL,
        width: 72, height: 72,
        colorDark : "#F35019",
        colorLight : "#fff",
        correctLevel : QRCode.CorrectLevel.H
    });
};



/** ------------------------------------
 * @gxz $init.function
 * ------------------------------------- */
$(function(){
    for(let fn in __page.init){
        typeof __page.init[fn] === 'function' && __page.init[fn]();
    };
});