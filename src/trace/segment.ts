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

import xhrInterceptor, { setOptions } from './interceptors/xhr';
import windowFetch, { setFetchOptions } from './interceptors/fetch';
import Report from '../services/report';
import { SegmentFields } from './type';
import { CustomOptionsType } from '../types';

export default function traceSegment(options: CustomOptionsType) {
  const segments = [] as SegmentFields[];
  // inject interceptor
  xhrInterceptor(options, segments);
  windowFetch(options, segments);
  window.addEventListener('beforeunload', () => {
    if (!segments.length) {
      return;
    }
    new Report('SEGMENTS', options.collector).sendByBeacon(segments);
  });
  //report per options.traceTimeInterval min
  setInterval(() => {
    if (!segments.length) {
      return;
    }
    new Report('SEGMENTS', options.collector).sendByXhr(segments);
    segments.splice(0, segments.length);
  }, options.traceTimeInterval);
}

export function setConfig(opt: CustomOptionsType) {
  setOptions(opt);
  setFetchOptions(opt);
}
