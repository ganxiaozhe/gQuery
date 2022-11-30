# gQuery
The brand new JavaScript function library, and killed IE
- Only 10.0kB minified and gzipped. Can also be included as an AMD module
- Supports CSS3 selectors to find elements as well as in style property manipulation
- Use native animation API. Support all major browsers


# Why gQuery
众所周知 jQuery 是一个非常健壮的 JavaScript 库，它提供的 API 易于使用且兼容众多浏览器（例如令开发者头痛的 Internet Explorer）。

毫无疑问它曾改变了前端代码书写的模式，并且延续至今。

不过随着现代浏览器不断迭代的 API，在家庭电脑中几乎已无法见到 IE 的影子，而 Windows 默认浏览器也早已换成 Edge（并已放弃 EDGEHTML 而使用 Chromium）。

如今现代浏览器中，jQuery 难免显得有些臃肿，且绝大多数开发者并未完全使用其函数。各大平台（Github ...）和框架（Bootstrap 5 ...）也都和 jQuery 逐渐告别。

在这一境况下，我决定在新项目中也不再引入 jQuery 库，而转头重写了 gQuery 这更为精小的函数库。在继承 jQuery 中的常用函数同时，拓展了许多我平时常用的操作函数。其代码大小在压缩后仅有 14kB，并完全在 MIT 下开源。

另外，大多数 jQuery 插件仅需小量修改即可适用于 gQuery。

如果不考虑兼容 IE，同时喜欢极简自由的开发，强烈建议使用 gQuery 以获得更好的体验。

gQuery 及 GQUI 良好兼容 Electron 及 NW.js，并已开发过成熟商业软件。


# Docs
https://gquery.cn/docs/



# Let's try gQuery
gQuery: 取值操作
```JavaScript
let val = $('#exGetValues').text();
$('#exPutValues li:nth-child(1)').text( val );

// .text([]) 将返回有序数组
val = $('#exGetValues li').text([]);
$('#exPutValues li:nth-child(2)').text( val.join('，')+'。' );

$('#exPutValues li:nth-child(3)').html('<i>—— 张爱玲</i>');
```

gQuery: 事件委派
```JavaScript
$('#todoList').on('click', 'li', function(){
    $(this).remove();
});

$('#todoList').on({
    mousedown: function(e){
        console.log(this, e);
    },
    mouseup: function(e){
        console.log(this, e);
    }
}, 'li');
```

gQuery: fade 操作
```JavaScript
$('.exFadeShow').html("It's").append('<i class="gi icon-arrows-cw ga-spin ml-2">');

// wait 实现更优雅的 setTimeout
$('.exFadeShow').wait(500).fadeToggle(800,function(){
    $(this).html('gQuery').fadeIn(800);
});
```

gQuery: slide 操作
```JavaScript
$('.exSlideShow > .header > .bullets > .bg-red,.exSlideShow > .header > .bullets > .bg-green').off('click').on('click',function(){
	let body = $(this).parent().parent().next();
	if( $(this).hasClass('bg-red') ){
		body.slideUp(300);
	} else {
		body.slideDown(300);
	}
});
```

### gQuery: array{}
```JavaScript
let CHAT_RECORD = [
    {id:0,name:'甘大蔗',msg:'为什么会有人把大花被穿身上啊？'},
    {id:1,name:'甘小蔗',msg:'小燕子穿花衣'},
    {id:2,name:'甘小蔗',msg:'年年春天来这里'},
    {id:3,name:'甘小蔗',msg:'我问燕子你为啥来'},
    {id:4,name:'甘大蔗',msg:'呃呃'},
    {id:5,name:'甘小蔗',msg:'燕子说'},
    {id:6,name:'甘小蔗',msg:'“先他妈管好你自己”'},
    {id:7,name:'甘大蔗',msg:'乌鱼子'},
];

let newArr = $.array.finder(CHAT_RECORD, {name:'甘大蔗'}, {limit:2});

$('#ex-array-finder').text( JSON.stringify(newArr) );
```

### gQuery: cookie{}
```
$.cookie.get(key:String [, json:Boolean])
$.cookie.set(key:String, value:Mixed [, options:Object])
$.cookie.remove(key:String)
```

### gQuery: storage{}
```JavaScript
var storageEx = [];
$.storage.remove('exampleData');
storageEx.push( JSON.stringify( $.storage.local() ) );
 
$.storage.set('exampleData',storageEx);
storageEx.push( $.storage.get('exampleData') );
 
$.storage.set('exampleData','gQuery');
storageEx.push( $.storage.get('exampleData') );
 
$.storage.push('exampleData','is');
$.storage.push('exampleData','a');
$.storage.push('exampleData','Smaller and faster modern JavaScript function library');
storageEx.push( $.storage.get('exampleData') );
 
storageEx.push( $.storage.get('exampleData','array').join(' ') );
 
$('#exStorageData').html( storageEx.join('\n\n') );
```
Result: storageEx
```javascript
{"theme":"light","indexInit":"1"}

["{\"theme\":\"light\",\"indexInit\":\"1\"}"]

gQuery

["gQuery","is","a","Smaller and faster modern JavaScript function library"]

gQuery is a Smaller and faster modern JavaScript function library
```

### gQuery: get{}
```javascript
$.get.queryParam(name:String)
$.get.browserSpec()
$.get.json(url:String, data:Object)
```

### gQuery: fetch 操作
`$.fetch(url:String:Object [, data:Object, bodyMethod:String])`
```javascript
$.fetch('/lib/js/gquery.ui.js', 'text').then(data => {
    console.log(data);
});

$.fetch('/lib/json/enneagram.json', 'json').then(data=>{
    console.log(data);
})

$.fetch('/lib/php/user/info.php', {
    id: 168,
    token: 'a6440a91c528dadfc7d5323dc626686a'
}, 'json').then(data => {
    console.log(data);
});
```

### gQuery: Date 操作
```javascript
let $date = $('#exDate > li');

$date.eq(0).text( $.date().format() );

$date.eq(1).text( $.date(1630862585909).format('本世纪第yy年的m月d日 hh:ii:ss') );

$date.eq(2).text( $.date('2002-2-14 2:30:00').format() );

$date.eq(3).text( $.date('-3d').calc('+4 hours').calc('-2h').format() );

$date.eq(4).text( $.date().diff('-3d').ago() );

// console.log( $.date() )
```

......
