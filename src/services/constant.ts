import Report from './report';

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
export enum ErrorsCategory {
  AJAX_ERROR = 'ajax',
  RESOURCE_ERROR = 'resource',
  VUE_ERROR = 'vue',
  PROMISE_ERROR = 'promise',
  JS_ERROR = 'js',
  UNKNOWN_ERROR = 'unknown',
}
export enum GradeTypeEnum {
  INFO = 'Info',
  WARNING = 'Warning',
  ERROR = 'Error',
}
export enum ReportTypes {
  ERROR = '/browser/errorLog',
  ERRORS = '/browser/errorLogs',
  PERF = '/browser/perfData',
  SEGMENT = '/v3/segment',
  SEGMENTS = '/v3/segments',
}

export enum SpanLayerType {
  UNKNOWN = 'UNKNOWN',
  DATABASE = 'DATABASE',
  RPC_FRAMEWORK = 'RPC_FRAMEWORK',
  HTTP = 'HTTP',
  MQ = 'MQ',
  CACHE = 'CACHE',
}

export const SpanLayer = SpanLayerType.HTTP;

export enum SpanTypeEnum {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  LOCAL = 'LOCAL',
}

export const SpanType = SpanTypeEnum.EXIT;
export enum ReadyStatus {
  OPENED = 1,
  DONE = 4,
}
export const ComponentId = 10001; // ajax
