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
import Task from './task';
import { ErrorsCategory, GradeTypeEnum } from './constant';
import { ErrorInfoFields, ReportFields } from './types';

let jsErrorPv = false;
export default class Base {
  public logInfo: ErrorInfoFields & ReportFields & { collector: string } = {
    uniqueId: '',
    service: '',
    serviceVersion: '',
    pagePath: '',
    category: ErrorsCategory.UNKNOWN_ERROR,
    grade: GradeTypeEnum.INFO,
    errorUrl: '',
    line: 0,
    col: 0,
    message: '',
    firstReportedError: false,
    collector: '',
  };

  public traceInfo() {
    // mark js error pv
    if (!jsErrorPv && this.logInfo.category === ErrorsCategory.JS_ERROR) {
      jsErrorPv = true;
      this.logInfo.firstReportedError = true;
    }
    const collector = this.logInfo.collector;

    delete this.logInfo.collector;
    Task.addTask(this.logInfo, collector);
    Task.finallyFireTasks();
    // report errors within 1min
    setTimeout(() => {
      Task.fireTasks();
    }, 60000);
  }
}
