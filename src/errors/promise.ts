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

class PromiseErrors extends Base {
  public handleErrors(options: { service: string; serviceVersion: string; pagePath: string; collector: string }) {
    window.addEventListener('unhandledrejection', (event) => {
      try {
        let url = '';
        if (!event || !event.reason) {
          return;
        }
        if (event.reason.config && event.reason.config.url) {
          url = event.reason.config.url;
        }
        this.logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: options.pagePath,
          category: ErrorsCategory.PROMISE_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: url || location.href,
          message: event.reason.message,
          stack: event.reason.stack,
          collector: options.collector,
        };
        this.traceInfo();
      } catch (error) {
        console.log(error);
      }
    });
  }
}
export default new PromiseErrors();
