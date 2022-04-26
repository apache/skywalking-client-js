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

class VueErrors extends Base {
  private infoOpt: CustomReportOptions = {
    service: '',
    pagePath: '',
    serviceVersion: '',
  };
  public handleErrors(options: CustomReportOptions, Vue: any) {
    this.infoOpt = options;
    Vue.config.errorHandler = (error: Error, vm: any, info: string) => {
      try {
        this.logInfo = {
          ...this.infoOpt,
          uniqueId: uuid(),
          category: ErrorsCategory.VUE_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: location.href,
          message: info,
          collector: options.collector,
          stack: error.stack,
        };
        this.traceInfo();
      } catch (error) {
        throw error;
      }
    };
  }
  setOptions(opt: CustomReportOptions) {
    this.infoOpt = opt;
  }
}

export default new VueErrors();
