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
import { GradeTypeEnum, ErrorsCategory, ReportTypes } from '../services/constant';

class AjaxErrors extends Base {
  // get http error info
  public handleError(options: { service: string; serviceVersion: string; pagePath: string; collector: string }) {
    // XMLHttpRequest Object
    if (!window.XMLHttpRequest) {
      return;
    }
    window.addEventListener(
      'xhrReadyStateChange',
      (event: CustomEvent<XMLHttpRequest & { getRequestConfig: any[] }>) => {
        const detail = event.detail;

        if (detail.readyState !== 4) {
          return;
        }
        if (detail.getRequestConfig[1] === options.collector + ReportTypes.ERRORS) {
          return;
        }

        this.logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: options.pagePath,
          category: ErrorsCategory.AJAX_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: detail.getRequestConfig[1],
          message: `status: ${detail.status}; statusText: ${detail.statusText};`,
          collector: options.collector,
          stack: detail.responseText,
        };
        this.traceInfo();
      },
    );
    // Fetch API
  }
}

export default new AjaxErrors();
