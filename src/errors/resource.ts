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
import { CustomReportOptions } from '../types';

class ResourceErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions) {
    this.infoOpt = options;
    window.addEventListener('error', (event) => {
      try {
        if (!event) {
          return;
        }
        const target: any = event.target;
        const isElementTarget =
          target instanceof HTMLScriptElement ||
          target instanceof HTMLLinkElement ||
          target instanceof HTMLImageElement;

        if (!isElementTarget) {
          // return js error
          return;
        }
        this.logInfo = {
          ...this.infoOpt,
          uniqueId: uuid(),
          category: ErrorsCategory.RESOURCE_ERROR,
          grade: target.tagName === 'IMG' ? GradeTypeEnum.WARNING : GradeTypeEnum.ERROR,
          errorUrl: (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || location.href,
          message: `load ${target.tagName} resource error`,
          collector: options.collector,
          stack: `load ${target.tagName} resource error`,
        };
        this.traceInfo();
      } catch (error) {
        throw error;
      }
    });
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}
export default new ResourceErrors();
