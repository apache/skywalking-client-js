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

import { CustomOptionsType, CustomReportOptions } from './types';
import { JSErrors, PromiseErrors, AjaxErrors, ResourceErrors, VueErrors, FrameErrors } from './errors/index';
import tracePerf from './performance/index';
import traceSegment, { setConfig } from './trace/segment';

const ClientMonitor = {
  customOptions: {
    collector: location.origin, // report serve
    jsErrors: true, // vue, js and promise errors
    apiErrors: true,
    resourceErrors: true,
    autoTracePerf: true, // trace performance detail
    useFmp: false, // use first meaningful paint
    enableSPA: false,
    traceSDKInternal: false,
    detailMode: true,
    noTraceOrigins: [],
    traceTimeInterval: 60000, // 1min
  } as CustomOptionsType,

  register(configs: CustomOptionsType) {
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };
    this.catchErrors(this.customOptions);
    if (!this.customOptions.enableSPA) {
      this.performance(this.customOptions);
    }

    traceSegment(this.customOptions);
  },
  performance(configs: any) {
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      tracePerf.getPerf(configs);
    } else {
      window.addEventListener(
        'load',
        () => {
          tracePerf.getPerf(configs);
        },
        false,
      );
    }
  },

  catchErrors(options: CustomOptionsType) {
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
  setPerformance(configs: CustomReportOptions) {
    // history router
    this.customOptions = {
      ...this.customOptions,
      ...configs,
      useFmp: false,
    };
    this.performance(this.customOptions);
    const { service, pagePath, serviceVersion, collector } = this.customOptions;
    if (this.customOptions.jsErrors) {
      JSErrors.setOptions({ service, pagePath, serviceVersion, collector });
      PromiseErrors.setOptions({ service, pagePath, serviceVersion, collector });
      if (this.customOptions.vue) {
        VueErrors.setOptions({ service, pagePath, serviceVersion, collector });
      }
    }
    if (this.customOptions.apiErrors) {
      AjaxErrors.setOptions({ service, pagePath, serviceVersion, collector });
    }
    if (this.customOptions.resourceErrors) {
      ResourceErrors.setOptions({ service, pagePath, serviceVersion, collector });
    }
    setConfig(this.customOptions);
  },
  reportFrameErrors(configs: CustomReportOptions, error: Error) {
    FrameErrors.handleErrors(configs, error);
  },
};

export default ClientMonitor;
