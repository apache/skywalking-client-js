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

import { CustomOptionsType, CustomReportOptions, TagOption } from './types';
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
    this.validateOptions();
    this.catchErrors(this.customOptions);
    if (!this.customOptions.enableSPA) {
      this.performance(this.customOptions);
    }

    traceSegment(this.customOptions);
  },
  performance(configs: any) {
    tracePerf.getPerf(configs);
    if (configs.enableSPA) {
      // hash router
      window.addEventListener(
        'hashchange',
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
    this.validateOptions();
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
  validateTags(customTags?: TagOption[]) {
    if (!customTags) {
      return false;
    }
    if (!Array.isArray(customTags)) {
      this.customOptions.customTags = undefined;
      console.error('customTags error');
      return false;
    }
    let isTags = true;
    for (const ele of customTags) {
      if (!(ele && ele.key && ele.value)) {
        isTags = false;
      }
    }
    if (!isTags) {
      this.customOptions.customTags = undefined;
      console.error('customTags error');
      return false;
    }
    return true;
  },
  validateOptions() {
    const {
      collector,
      service,
      pagePath,
      serviceVersion,
      jsErrors,
      apiErrors,
      resourceErrors,
      autoTracePerf,
      useFmp,
      enableSPA,
      traceSDKInternal,
      detailMode,
      noTraceOrigins,
      traceTimeInterval,
      customTags,
      vue,
    } = this.customOptions;
    this.validateTags(customTags);
    if (typeof collector !== 'string') {
      this.customOptions.collector = location.origin;
    }
    if (typeof service !== 'string') {
      this.customOptions.service = '';
    }
    if (typeof pagePath !== 'string') {
      this.customOptions.pagePath = '';
    }
    if (typeof serviceVersion !== 'string') {
      this.customOptions.serviceVersion = '';
    }
    if (typeof jsErrors !== 'boolean') {
      this.customOptions.jsErrors = true;
    }
    if (typeof apiErrors !== 'boolean') {
      this.customOptions.apiErrors = true;
    }
    if (typeof resourceErrors !== 'boolean') {
      this.customOptions.resourceErrors = true;
    }
    if (typeof autoTracePerf !== 'boolean') {
      this.customOptions.autoTracePerf = true;
    }
    if (typeof useFmp !== 'boolean') {
      this.customOptions.useFmp = false;
    }
    if (typeof enableSPA !== 'boolean') {
      this.customOptions.enableSPA = false;
    }
    if (typeof traceSDKInternal !== 'boolean') {
      this.customOptions.traceSDKInternal = false;
    }
    if (typeof detailMode !== 'boolean') {
      this.customOptions.detailMode = true;
    }
    if (typeof detailMode !== 'boolean') {
      this.customOptions.detailMode = true;
    }
    if (!Array.isArray(noTraceOrigins)) {
      this.customOptions.noTraceOrigins = [];
    }
    if (typeof traceTimeInterval !== 'number') {
      this.customOptions.traceTimeInterval = 60000;
    }
    if (typeof vue !== 'function') {
      this.customOptions.vue = undefined;
    }
  },
  setCustomTags(tags: TagOption[]) {
    const opt = { ...this.customOptions, customTags: tags };
    if (this.validateTags(tags)) {
      setConfig(opt);
    }
  },
};

export default ClientMonitor;
