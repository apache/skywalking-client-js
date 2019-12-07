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
import { ErrorsCategory } from '../services/config';
export default class XHRError {

  constructor() {
    this.handleError();
  }

  handleError(){
    if(!window.XMLHttpRequest){
      return;
    }
    let xhrSend = XMLHttpRequest.prototype.send;
    let _handleEvent = (event: Event) => {
        try {
          if (event && event.currentTarget && event.currentTarget.status !== 200) {
            // this.category = ErrorsCategory.AJAX_ERROR;
            // this.msg = event.target.response;
            // this.url = event.target.responseURL;
            // this.error = {
            // status: event.target.status,
            //     statusText: event.target.statusText
            // };
            // this.recordError();
          }
        } catch (error) {
          console.log(error);
        }
      };
      XMLHttpRequest.prototype.send = function(){
          if (this.addEventListener){
              this.addEventListener('error', _handleEvent);
              this.addEventListener('load', _handleEvent);
              this.addEventListener('abort', _handleEvent);
          } else {
              let tempStateChange = this.onreadystatechange;
              this.onreadystatechange = function(event: any){
                  tempStateChange.apply(this,arguments);
                  if (this.readyState === 4) {
                      _handleEvent(event);
                  }
              }
          }
          return xhrSend.apply(this,arguments);
      }
  }
  
}