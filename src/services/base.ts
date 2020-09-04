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
import { ErrorInfoFeilds, ReportFields } from './types';

let jsErrorPv = false;
export default class Base {

  public logInfo: ErrorInfoFeilds & ReportFields = {
    uniqueId: '',
    service: '',
    serviceVersion: '',
    pagePath: '',
    category: ErrorsCategory.UNKNOW_ERROR,
    grade: GradeTypeEnum.INFO,
    errorUrl: '',
    line: 0,
    col: 0,
    errorInfo: '',
    message: '',
    firstReportedError: false,
  };

  public traceInfo() {
    // mark js error pv
    if (!jsErrorPv && this.logInfo.category === ErrorsCategory.JS_ERROR) {
      jsErrorPv = true;
      this.logInfo.firstReportedError = true;
    }
    this.handleRecordError();
    setTimeout(() => {
      Task.fireTasks();
    }, 100);
  }

  private handleRecordError() {
    try {
      if (!this.logInfo.message) {
        return;
      }
      const errorInfo = this.handleErrorInfo();

      Task.addTask(errorInfo);

    } catch (error) {
      throw error;
    }
  }

  private handleErrorInfo() {
    let message = `error category:${this.logInfo.category}\r\n log info:${this.logInfo.message}\r\n
      error url: ${this.logInfo.errorUrl}\r\n `;
    switch (this.logInfo.category) {
      case ErrorsCategory.JS_ERROR:
        message += `error line number: ${this.logInfo.line}\r\n error col number:${this.logInfo.col}\r\n`;
        if (this.logInfo.errorInfo && this.logInfo.errorInfo.stack) {
          message += `error stack: ${this.logInfo.errorInfo.stack}\r\n`;
        }
        break;
      default:
        message += `other error: ${this.logInfo.errorInfo}\r\n`;
        break;
    }
    const recordInfo = {
      ...this.logInfo,
      message,
    };
    return recordInfo;
  }
}
