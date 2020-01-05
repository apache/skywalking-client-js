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
import JSErrors from './errors/jsErrors';
import { TClientMonitor, TErrorsType } from './types';

const ClientMonitor = {
  errorTypes: {
    jsErrors: true,
    promiseErrors: true,
    consoleErrors: false,
    vueErrors: false,
    reactErrors: false,
    ajaxErrors: true,
    resourceErrors: true,
  } as TErrorsType,

  register(options: TClientMonitor & TErrorsType) {
    this.errorTypes = options;
    if (this.errorTypes.jsErrors) {
      this.errorTypes.jsErrors = options.jsErrors;
      JSErrors.handleErrors({reportUrl: options.reportUrl});
    }
    if (this.errorTypes.promiseErrors) {
      this.errorTypes.promiseErrors = options.promiseErrors || this.errorTypes.promiseErrors;
    }
    if (this.errorTypes.resourceErrors) {
      this.errorTypes.resourceErrors = options.resourceErrors;
    }
    if (this.errorTypes.ajaxErrors) {
      this.errorTypes.ajaxErrors = options.ajaxErrors || this.errorTypes.ajaxErrors;
    }
  },
};

export default ClientMonitor;
