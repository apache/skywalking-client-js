/**
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
class API {

    constructor(url){
        this.url = url;
    }
    
    /**
     * 上报信息 （默认方式）
     */
    report(data){
        if(!this.checkUrl(this.url)){
            console.log("上报信息url地址格式不正确,url=",this.url);
            return;
        }
        console.log("上报地址："+this.url);
        this.sendInfo(data);
    }

    /**
     * 发送消息
     */
    sendInfo(data){
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("POST",this.url,true);
            //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(data));
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * 通过img方式上报信息
     */
    reportByImg(data){
        if(!this.checkUrl(this.url)){
            console.log("上报信息url地址格式不正确,url=",this.url);
            return;
        }
        try {
            var img = new Image();
            img.src = this.url+'?v='+new Date().getTime()+'&' + this.formatParams(data);
        } catch (error) {
            console.log(error);
        }
    }

    /*
     *格式化参数
     */
    formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join("&");
    }

    /**
     * 检测URL
     */
    checkUrl(url){
        if(!url){
            return false;
        }
        var urlRule =/^[hH][tT][tT][pP]([sS]?):\/\//;
        return urlRule.test(url);
    }

}
export default API;