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

import { CustomOptionsType } from './types';
import { JSErrors, PromiseErrors, AjaxErrors, ResourceErrors, VueErrors } from './errors/index';
import tracePerf from './performance/index';
import traceSegment from './trace/segment';

const ClientMonitor = {
  customOptions: {
    collector: '', // report serve
    jsErrors: true, // vue, js and promise errors
    apiErrors: true,
    resourceErrors: true,
    autoTracePerf: true, // trace performance detail
    useFmp: false, // use first meaningful paint
    enableSPA: false,
    traceSDKInternal: false,
  } as CustomOptionsType,

  register(configs: CustomOptionsType) {
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };
    this.errors(this.customOptions);
    if (!this.customOptions.enableSPA) {
      this.performance(this.customOptions);
    }

    traceSegment(this.customOptions);
  },
  performance(configs: any) {
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      tracePerf.recordPerf(configs);
    } else {
      window.addEventListener(
        'load',
        () => {
          tracePerf.recordPerf(configs);
        },
        false,
      );
    }
    if (this.customOptions.enableSPA) {
      // hash router
      window.addEventListener(
        'hashchange',
        () => {
          tracePerf.recordPerf(configs);
        },
        false,
      );
    }
  },
  errors(options: CustomOptionsType) {
    const { service, pagePath, serviceVersion, collector } = options;

    if (options.jsErrors) {
      JSErrors.handleErrors({ service, pagePath, serviceVersion, collector });
      PromiseErrors.handleErrors({ service, pagePath, serviceVersion, collector });
      if (options.vue) {
        VueErrors.handleErrors({ service, pagePath, serviceVersion, collector }, options.vue);
      }
    }
    if (options.apiErrors) {
      AjaxErrors.handleError({ service, pagePath, serviceVersion, collector });
    }
    if (options.resourceErrors) {
      ResourceErrors.handleErrors({ service, pagePath, serviceVersion, collector });
    }
  },
  setPerformance(configs: CustomOptionsType) {
    // history router
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };
    this.performance(this.customOptions);
  },
};

export default ClientMonitor;
