# gQuery
The brand new JavaScript function library, and killed IE
- Only 4kB minified and gzipped. Can also be included as an AMD module
- Supports CSS3 selectors to find elements as well as in style property manipulation
- Use native animation API. Support all major browsers

# Why gQuery
众所周知 jQuery 是一个非常健壮的 JavaScript 库，它提供的 API 易于使用且兼容众多浏览器（例如令开发者头痛的 Internet Explorer）。

毫无疑问它曾改变了前端代码书写的模式，并且延续至今。

不过随着现代浏览器不断迭代的 API，在家庭电脑中几乎已无法见到 IE 的影子，而 Windows 默认浏览器也早已换成 Edge（并已放弃 EDGEHTML 而使用 Chromium）。

如今现代浏览器中，jQuery 难免显得有些臃肿，且绝大多数开发者并未完全使用其函数。各大平台（Github ...）和框架（Bootstrap 5 ...）也都和 jQuery 逐渐告别。

在这一境况下，我决定在新项目中也不再引入 jQuery 库，而转头重写了 gQuery 这更为精小的函数库。在继承 jQuery 中的常用函数同时，拓展了许多我平时常用的操作函数。其代码大小在压缩后仅有 9kB，并完全在 MIT 下开源。

另外，大多数 jQuery 插件仅需小量修改即可适用于 gQuery。

如果不考虑兼容 IE，同时喜欢极简自由的开发，强烈建议使用 gQuery 以获得更好的体验。

# Docs
https://www.gquery.net/docs/



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

gQuery: CSS强制查询
```JavaScript
$('p').css('line-height');
// [undefined,undefined,undefined,...]
$('p').css('!line-height');
// ["15.6px","25.6px","25.6px",...]
```

gQuery: 事件委派
```JavaScript
$('#todoList').on('click','li',function(){
  $(this).remove();
});
```
gQuery: fade 操作
```JavaScript
l$('.exFadeShow').html("It's").append('<i class="gi icon-arrows-cw ga-spin ml-2">');
setTimeout(()=>{
	$('.exFadeShow').fadeToggle(800,function(){
		$(this).html('gQuery').fadeIn(800);
	});
},500);
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
### gQuery: storage 操作
```JavaScript
var storageEx = [];
$.storage.remove('exampleData');
storageEx.push( JSON.stringify( $.storage.local() ) );
 
$.storage.write('exampleData',storageEx);
storageEx.push( $.storage.read('exampleData') );
 
$.storage.write('exampleData','gQuery');
storageEx.push( $.storage.read('exampleData') );
 
$.storage.push('exampleData','is');
$.storage.push('exampleData','a');
$.storage.push('exampleData','Smaller and faster modern JavaScript function library');
storageEx.push( $.storage.read('exampleData') );
 
storageEx.push( $.storage.read('exampleData','array').join(' ') );
 
$('#exStorageData').html( storageEx.join('\n\n') );
```
Result: storageEx
```
{"theme":"light","indexInit":"1"}

["{\"theme\":\"light\",\"indexInit\":\"1\"}"]

gQuery

["gQuery","is","a","Smaller and faster modern JavaScript function library"]

gQuery is a Smaller and faster modern JavaScript function library
```


......
