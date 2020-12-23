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

import uuid from '../services/uuid';

export default function xhrInterceptor() {
  const originalXHR = window.XMLHttpRequest;

  function ajaxEventTrigger(event: any) {
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

    return liveXHR;
  }
  (window as any).XMLHttpRequest = customizedXHR;
  window.addEventListener('xhrReadyStateChange', (e: any) => {
    if (e.detail.readyState === 1) {
      e.detail.setRequestHeader('sw8', 'test');
    }
  });
}
