'use strict';
let __page = {
    init:{}, data:{}, fn:{},
    inner:{}, innerInit:{}, do:{},
    sign:{}, pdf:{},

    api:{
        config:{
            host:'https://zhfy.crmeeting.cn:8087/'
        },
        send:function(url, data, bodyMH){
            let conf = this.config;

            if(typeof url === 'object'){
                url.url = conf.host+url.url;
            } else {
                url = {url:conf.host+url};
            }

            return $.fetch(url, data, bodyMH);
        }
    }
};


/** ------------------------------------
 * @init 入口
 * ------------------------------------- */
__page.init.entry = function(){
    let params = ['userInfo', 'hostInfo', 'roomInfo', 'fileInfo'];
    params.map(p=>{
        let str = $.get.queryParam(p);
        try{
            __page.data[p] = JSON.parse(str);
        } catch(err){
            console.error(err);
            $.ui.dialog('解析错误 #'+p, `<div class='article'><pre>${str}</pre></div>`);
        };
    });

    let todo = $.get.queryParam('do') || 'verify';
    switch(todo){
        case 'signature':
            __page.do.goExplain();break;
        default:__page.inner.switch('entry');
    }

    $('#btn-close').click(function(){
        window.close();
    });
};


/** ------------------------------------
 * @inner switcher
 * ------------------------------------- */
__page.inner.titles = {
    entry:'信息录入',
    explain:'签名',
    sign:'签名页',
    end:'完成页'
};
__page.inner.switch = function(tab){
    let that = this;
    if(__page.data.innerRunning){
        window.clearTimeout(__page.data.innerDelay);
        __page.data.innerDelay = setTimeout(()=>{
            __page.inner.switch(tab);
        }, 100);
        return;
    }
    let inner = __page.data.inner;
    if(inner==tab){return false;} else {
        __page.data.inner = tab;
        __page.data.innerRunning = true;
    }
    let $inner = $('#inner-'+tab), $tmpl = $('#tmpl-'+tab),
        $title = $('#header h2');

    $inner.html($tmpl.html());
    __page.innerInit[tab] && __page.innerInit[tab]();

    // do
    $('#stage>.inner').fadeOut(400);
    $inner.wait(500).fadeIn(400);
    $title.addClass('is-blur').wait(500).html(that.titles[tab]).removeClass('is-blur');

    setTimeout(()=>{
        __page.data.innerRunning = false;
    }, 1000);
    setTimeout(()=>{
        __page.innerInit[tab+'_show'] && __page.innerInit[tab+'_show']();
    }, 600);
};

/** ------------------------------------
 * @innerInit entry
 * ------------------------------------- */
__page.innerInit.entry = function(){
    __page.init.upload();

    $('#do-verify').click(function(){
        __page.do.verify();
    });
};
/** ------------------------------------
 * @do verify
 * ------------------------------------- */
__page.do.verify = function(){
    $.ui.alert('发起校验');
};



__page.do.goExplain = function(){
    let _pd = __page.data;
    if(!_pd.fileInfo || !_pd.roomInfo || !_pd.hostInfo){
        $.ui.dialog('提示', '缺少参数！');
        return;
    }

    __page.inner.switch('explain');
};
/** ------------------------------------
 * @innerInit explain
 * ------------------------------------- */
__page.innerInit.explain = function(){
    $('#do-goSign').click(function(){__page.do.goSign();});

    // loader
    $('.explain-loader').show();
    $('#do-goSign').attr('disabled','disabled');

    let _pd = __page.data;
    let _fi = _pd.fileInfo;
    // 获取文件
    __page.api.send('meeting/graph/fileAutoGraph/getFile', {
        temporaryCode:_fi.temporaryCode,
        province:_fi.province,
        token:_fi.token,
        serverCode:_fi.serverCode,
        createTime:_pd.roomInfo.createTime,
        roomUserName:_pd.userInfo.roomUserName,
        meetingTopic:_pd.roomInfo.meetingTopic
    }, 'json').then(rsp=>{
        console.log(rsp);
        $('.explain-loader').hide();
        if(rsp.code===300){
            __page.data.pdfBase64 = rsp.data;
            __page.inner.switch('end');
            return $.ui.alert('您已经完成签名！');
        }
        if(rsp.code!==200){
            return $.ui.dialog('出错了 #'+rsp.code, rsp.message);
        }

        let list = rsp.data.reverse(), imgsHTML = '';
        list.map((li, idx)=>{
            imgsHTML += `<img src='${li.url}' alt='${li.name}' />`;
        });
        $('#explain-article').append(imgsHTML);
        $('#do-goSign').removeAttr('disabled');
    });
};
/** ------------------------------------
 * @do goSign
 * ------------------------------------- */
__page.do.goSign = function(){
    __page.inner.switch('sign');
};



/** ------------------------------------
 * @innerInit sign
 * ------------------------------------- */
__page.innerInit.sign = function(){
    $('#do-unSign').click(function(){__page.sign.resize();});
    $('#do-sign').click(function(){
        if(__page.sign.pad.isEmpty()){
            return $.ui.alert('请先完成签名');
        }
        __page.do.sign();
    });

    __page.sign.pad = new SignaturePad($('#sign-canvas')[0]);
};
__page.innerInit.sign_show = function(){
    __page.sign.resize();
};
__page.sign.resize = function(){
    if(!this.pad){return;}
    let canvas = this.pad.canvas;

    const ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    this.pad.clear();
}
$(window).on('resize', function(){
    __page.sign.resize();
});

/** ------------------------------------
 * @do sign
 * ------------------------------------- */
__page.do.sign = function(){
    let jpeg = __page.sign.pad.toDataURL();
    let _pd = __page.data;
    let _fi = _pd.fileInfo;
    $('body').loader('签名上传中');

    __page.api.send('meeting/graph/fileAutoGraph/doAutoGraph', {
        temporaryCode:_fi.temporaryCode,
        province:_fi.province,
        token:_fi.token,
        serverCode:_fi.serverCode,
        createTime:_pd.roomInfo.createTime,
        roomUserName:_pd.userInfo.roomUserName,
        meetingTopic:_pd.roomInfo.meetingTopic,
        file:__page.fn.dataURLtoFile(jpeg, 'image1.png')
    }, 'json').then(rsp=>{
        $('body').loader(false);
        console.log(rsp);
        if(rsp.code!==200){
            return $.ui.dialog('出错了 #'+rsp.code, rsp.message);
        }

        __page.inner.switch('end');
    });
};




__page.innerInit.end_show = function(){
    let pb64 = __page.data.pdfBase64;
    if(!pb64){return;}
    let pfile = "data:application/pdf;base64,"+pb64;

    $('#section-end').hide();
    $('#inner-end').css({padding:0});
    $('#stage').css('background','var(--bg-main)');

    $.fetch(pfile, 'arrayBuffer').then(buffer=>{
        // pdfjsLib.cMapUrl = 'https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/';
        // pdfjsLib.cMapPacked = true;
        pdfjsLib.getDocument(buffer).promise.then(pdf=>{
            __page.pdf.numPages = pdf.numPages;
            __page.pdf.openPage(pdf, 1);
        });
    });
};
__page.pdf.openPage = function(pdfFile, pageNumber, callback){
    let that = this;
    let canvasId = 'pdf-'+pageNumber;
    $('#inner-end').append(`<canvas id='${canvasId}'></canvas>`);
    let canvas = $('#'+canvasId)[0];

    try {
        let scale = 2;
        pdfFile.getPage(pageNumber).then(function(page){
            let viewport = page.getViewport({
                scale: scale
            });

            let context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            // 记录当前canvas的width，height
            window.wi = canvas.width;
            window.he = canvas.height;
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            let renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext).promise.then(function(){
                if (that.numPages > pageNumber) {
                    that.openPage(pdfFile, pageNumber + 1);
                } else if (that.numPages == pageNumber) {
                    console.info("pdf 加载完成！");
                }
            });
        });
    } catch (e) {
        console.info(e);
    }
};





/**
* DataUrl to File
* @param {String} dataUrl - dataUrl地址
* @param {String} fileName - file文件名
*/
__page.fn.dataURLtoFile = function(dataUrl, fileName){
    var arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, {type:mime});
}

// 图片上传
__page.init.upload = function(){
    $('.img-uploads:not([data-bound]) input.img-upload-input').on('change', function(){
        let file = this.files[0], $this = $(this);
        let $wrap = $this.parent().parent().parent();
        if(!file.type.startsWith('image')){
            $.ui.dialog('提示', '只能上传图片类型文件！');
            this.value = '';
            return;
        }

        let maxLen = $wrap.attr('data-max') || 1;
        maxLen = parseInt(maxLen);
        let imgLen = $wrap.find('.img-wrap').length;
        if(imgLen>=maxLen){
            this.value = '';
            return $.ui.alert('当前上传数量超过限制啦！');
        }

        $wrap.loader();
        lrz(file, {quality:0.8}).then(rst=>{
            $this.val('');
            $wrap.loader(false);

            let size = rst.file.size/1000;
            if(size>2048){
                return $.ui.alert('暂不支持压缩后大小依然超过 <b>2MB</b> 的图片。');
            }

            $wrap.append(`<li class='img-wrap'><img src='${rst.base64}' data-gishow='img-uploads' data-title='${file.name}'>
            <div class='img-delete'><i class='ti ti-x'></i></div>
            <div class='img-footer'>
                <h4 class='t-line-1'>${file.name}</h4>
                <div class='labels'>${size.toFixed(2)}KB</div>
            </div></li>`);

            $wrap.find('.img-wrap:last-of-type img').data({
                file: rst.file
            });
            $.gazeimg.showBind();
            __page.fn.imgUpdate($wrap);
        });
    });


    $('.img-uploads:not([data-bound])').on('click', '.img-delete', function(){
        let $imgWrap = $(this).parent();
        let $wrap = $imgWrap.parent();
        $imgWrap.remove();
        __page.fn.imgUpdate($wrap);
    }).attr('data-bound', 'true');
};
__page.fn.imgUpdate = function($wrap){
    let maxLen = $wrap.attr('data-max') || 1;
    maxLen = parseInt(maxLen);
    let imgLen = $wrap.find('.img-wrap').length;

    let $h5 = $wrap.find('.img-upload h5'),
        $upload = $wrap.find('input.img-upload-input');

    $h5.text(`${imgLen} / ${maxLen}`);
    if(imgLen>=maxLen){
        $upload.attr('disabled','disabled');
    } else {
        $upload.removeAttr('disabled');
    }
};


/** ------------------------------------
 * @gxz $init.function
 * ------------------------------------- */
$(function(){
    for(let fn in __page.init){
        typeof __page.init[fn] === 'function' && __page.init[fn]();
    };
});