/** -------------------------------------
 *
 * gQuery FormData v0.1.0 [PREVIEW]
 * (c) 2021-present, JU Chengren (Ganxiaozhe)
 * 
 * Released under the GPLv3 License.
 * gquery.cn/license
 *
 * ------------------------------------- */
 if(!window.gQuery || !window.gQuery.fn.gquery){
    throw new Error("请先引入 gQuery v1.5.2 以上版本!");
}
console.log('%c gQueryFormData v0.1.0 %c www.gquery.cn \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');

$.formdata = new $.chain({
    gquery:true,
    LINE_BREAK:'\r\n',

    init: function(){
        this.getBoundary();
        this.data = {};
    },
    getBoundary: function(){
        return this.boundary ? this.boundary : this._generateBoundary();
    },
    _generateBoundary: function(){
        this.boundary = '----gQueryFormBoundary'+this._getRandomString(16);
        return this.boundary;
    },
    _getRandomString: function(min, max){
        let returnStr = '',
            range = (max ? Math.round(Math.random() * (max-min)) + min : min),
            charStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for(let i=0; i<range; i++){
            let index = Math.round(Math.random() * (charStr.length-1));
            returnStr += charStr.substring(index, index+1);
        }
        return returnStr;
    },

    append: function(key, val){
        this._append(key, this._convertValue(val));
        return this;
    },
    set: function(key, val){
        this.data[key] = [this._convertValue(val)];
        return this;
    },
    _append: function(key, val){
        if(this.data[key]){
            this.data[key].push(val);
        } else {
            this.data[key] = [val];
        }
    },
    _toBuffer: async function(file){
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
    },
    _convertValue: function(val){
        if(typeof val!=='object'){return val;}
        
        let valProto = Object.prototype.toString.call(val);
        switch(valProto){
            case '[object Object]':
            case '[object Array]':
                val = JSON.stringify(val);break;
            case '[object File]':
                break;
            default:
                throw new Error('暂不支持的类型：'+valProto);
        }
        return val;
    },

    getAll: function(name){
        return name ? this.data[name] : this.data;
    },
    toString: async function(){
        return (await this.toBuffer()).toString();
    },
    toBuffer: async function(){
        let result = [], rsize = 0;
        for(let k in this.data){
            let v = this.data[k];
            for(let i = 0; i < v.length; i++){
                let buf = await this._getContent(k, v[i]);
                result.push(buf);rsize += buf.length;
            }
        }

        let lastbuf = Buffer('--'+this.boundary+'--');
        result.push(lastbuf);rsize += lastbuf.length;
        return Buffer.concat(result, rsize);
    },

    _getContent: async function(key, val){
        let bufArray = [], bufSize = 0;
        let result = `--${this.boundary}${this.LINE_BREAK}Content-Disposition: form-data; name="${key}"`;
        if(typeof val!=='object'){
            result += this.LINE_BREAK.repeat(2) + val + this.LINE_BREAK;
            return Buffer(result);
        }

        let valProto = Object.prototype.toString.call(val);
        switch(valProto){
            case '[object File]':
                result += `; filename="${val.name}"`;
                result += this.LINE_BREAK + `Content-Type: ${val.type}` + this.LINE_BREAK.repeat(2);
                let buf = Buffer(result);
                bufArray.push(buf);bufSize += buf.length;
                buf = await this._toBuffer(val);
                bufArray.push(buf);bufSize += buf.length;
                buf = Buffer(this.LINE_BREAK);
                bufArray.push(buf);bufSize += buf.length;
                break;
        }
        return Buffer.concat(bufArray, bufSize);
    },
    _getContentType: function(){
        return `multipart/form-data; boundary=${this.boundary}`;
    }
});