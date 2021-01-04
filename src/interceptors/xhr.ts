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

export default function xhrInterceptor() {
  const originalXHR = window.XMLHttpRequest as any;
  const xhrSend = XMLHttpRequest.prototype.send;
  const xhrOpen = XMLHttpRequest.prototype.open;

  originalXHR.prototype.getRequestConfig = [];

  function ajaxEventTrigger(event: string) {
    const ajaxEvent = new CustomEvent(event, { detail: this });

    window.dispatchEvent(ajaxEvent);
  }

  function customizedXHR() {
    const liveXHR = new originalXHR();

    liveXHR.addEventListener(
      'readystatechange',
      function () {
        ajaxEventTrigger.call(this, 'xhrReadyStateChange');
      },
      false,
    );

    liveXHR.open = function (method: string, url: string) {
      this.getRequestConfig = arguments;

      return xhrOpen.apply(this, arguments);
    };
    liveXHR.send = function (body: any) {
      return xhrSend.apply(this, arguments);
    };

    return liveXHR;
  }
  (window as any).XMLHttpRequest = customizedXHR;
}
