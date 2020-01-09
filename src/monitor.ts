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

const ClientMonitor = {
  customOptions: {
    jsErrors: true,
    promiseErrors: true,
    consoleErrors: false,
    vueErrors: false,
    ajaxErrors: true,
    resourceErrors: true,
  } as CustomOptionsType,

  register(options: CustomOptionsType) {
    const { serviceName, reportUrl } = options;

    this.customOptions = {
      ...this.customOptions,
      ...options,
    };

    if (this.customOptions.jsErrors) {
      JSErrors.handleErrors({reportUrl, serviceName});
    }
    if (this.customOptions.promiseErrors) {
      PromiseErrors.handleErrors({reportUrl, serviceName});
    }
    if (this.customOptions.resourceErrors) {
      ResourceErrors.handleErrors({reportUrl, serviceName});
    }
    if (this.customOptions.ajaxErrors) {
      AjaxErrors.handleError({reportUrl, serviceName});
    }
    if (this.customOptions.vueErrors && this.customOptions.vue) {
      VueErrors.handleErrors({reportUrl, serviceName}, this.customOptions.vue);
    }
  },
};

export default ClientMonitor;
