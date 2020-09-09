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
import Base from '../services/base';
import { GradeTypeEnum, ErrorsCategory } from '../services/constant';

class AjaxErrors extends Base {
  public handleError(options: {
    service: string;
    serviceVersion: string;
    pagePath: string;
  }) {
    if (!window.XMLHttpRequest) {
      return;
    }
    const xhrSend = XMLHttpRequest.prototype.send;
    const xhrEvent = (event: any) => {
      try {
        if (event && event.currentTarget && event.currentTarget.status !== 200) {
          this.logInfo = {
            uniqueId: uuid(),
            service: options.service,
            serviceVersion: options.serviceVersion,
            pagePath: options.pagePath,
            category: ErrorsCategory.AJAX_ERROR,
            grade: GradeTypeEnum.ERROR,
            errorUrl: event.target.responseURL,
            message: event.target.response,
            errorInfo: {
              status: event.target.status,
              statusText: event.target.statusText,
            },
          };
          this.traceInfo();
        }
      } catch (error) {
        console.log(error);
      }
    };
    XMLHttpRequest.prototype.send = function() {
      if (this.addEventListener) {
        this.addEventListener('error', xhrEvent);
        this.addEventListener('load', xhrEvent);
        this.addEventListener('abort', xhrEvent);
      } else {
        const stateChange = this.onreadystatechange;
        this.onreadystatechange = function(event: any) {
          stateChange.apply(this, arguments);
          if (this.readyState === 4) {
            xhrEvent(event);
          }
        };
      }
      return xhrSend.apply(this, arguments);
    };
  }
}

export default new AjaxErrors();
