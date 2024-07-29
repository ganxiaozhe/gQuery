# CookTimeline

食谱制作时间线，基于以下开源框架：

| 框架                                                         | 说明                                              |
| ------------------------------------------------------------ | ------------------------------------------------- |
| [TimelineJS3.js](https://github.com/NUKnightLab/TimelineJS3) | MPL v2 License，JavaScript 构建的故事时间线       |
| [gQuery](https://gquery.cn)                                  | MIT License，JavaScript 函数库，CSS 组件库        |
| GazeImg                                                      | GPL v3 License，基于 gQuery，图片懒加载，图片灯箱 |
| [qrcode.js](https://github.com/davidshimjs/qrcodejs)         | MIT License，JavaScript 生成二维码                |
| [html2canvas.js](https://github.com/niklasvh/html2canvas)    | MIT License，JavaScript 对 DOM 进行“截图”         |
| jweixin 1.6.0                                                | 微信的 JS SDK（非必要）                           |

以上框架皆已封装好，无需更改。时间线的文件目录有：

| 路径       | 说明                     |
| ---------- | ------------------------ |
| ./css      | 开源框架的样式表目录     |
| ./iconfont | 字体目录（tabler-icons） |
| ./js       | 开源框架的 JS 脚本目录   |
| ./timeline | Timeline 核心框架目录    |
| index.html | 食谱时间线 HTML          |
| index.css  | 食谱时间线样式表         |
| index.js   | 食谱时间线 JS 脚本       |

另外，还有一个后端服务被写在 webuplaoder（python django），API 路径为`/api/wechat/getJSConfig`，用于获取微信签名。（非必要）



## 部署

前端文件已打包成以相对路径的文件包，可直接在本地浏览器运行`index.html`查看效果。

配置皆在`index.js`文件中完成：

```javascript
let __page = {
    config:{appId:''},
    init:{}, data:{},
    do:{}, bind:{},
    api:{
        config:{
            host: 'https://gquery.cn/pyApi/',
            token: ''
        },
        send:function(url, data, bodyMH){/*...*/}
    }
};
```

其中`host`即为后端服务的 api 路径，此 api 目前仅用于获取微信签名，所以也并非是运行所需。关键是在`__page.init.data`函数之后，在这里获取食谱 JSON 数据。



## 说明

所有的数据及方法皆封装在了`__page`变量中，其中`config`为配置，`init`为 DOM 被加载后需要立即运行的函数集合，`data`为数据信息。

运行的先后顺序可以从`index.js`从上至下阅览，其中`init`初始运行函数方法有：

`__page.init.data`：获取 URL 参数中的 id 及 token 字段，以通过 fetch 获取食谱数据。

`__page.init.queryParams`：处理 URL 中的其他参数，如自动播放等。

`__page.init.export`：导出层 exportLayer 的事件绑定。

在这三种方法中，`__page.init.data`为主入口，在获取到数据后，会接着运行`__page.do.gotData`函数，这一步主要是将原始数据处理为时间线的可读取数据。

在这一步完成后，将运行`__page.do.timeline`以生成时间线，在时间线生成并完成加载后，将运行`__page.do.timelineDone`，这一步将对时间线进行定制化，以实现特定需求。