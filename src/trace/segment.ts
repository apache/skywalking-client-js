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
import xhrInterceptor from '../interceptors/xhr';
import uuid from '../services/uuid';
import { Base64 } from '../services/base64';
import { SegmentFeilds, SpanFeilds } from './type';

export default function traceSegment(options: any) {
  const segment = {
    traceId: uuid(),
    service: options.service,
    spans: [],
    serviceInstance: options.serviceVersion,
    traceSegmentId: options.segmentId,
  } as SegmentFeilds;

  // inject interceptor
  xhrInterceptor();
  window.addEventListener('xhrReadyStateChange', (e: CustomEvent) => {
    const xhrState = e.detail.readyState;
    let startTime = new Date().getTime();
    if (xhrState === 1) {
      const StringTraceId = String(Base64.encode(segment.traceId));
      const segmentId = String(Base64.encode(segment.traceSegmentId));
      const segmentService = String(Base64.encode(segment.service));
      const serviceInstance = String(Base64.encode(segment.serviceInstance));
      const endpoint = String(Base64.encode(options.pagePath));
      const url = String(Base64.encode(location.href));
      const values = `${1}-${StringTraceId}-${segmentId}-${
        segment.spans.length
      }-${segmentService}-${serviceInstance}-${endpoint}-${url}`;

      e.detail.setRequestHeader('sw8', values);
    }
    if (xhrState === 4) {
      let endTime = new Date().getTime();
      const exitSpan: SpanFeilds = {
        operationName: options.pagePath,
        startTime,
        endTime,
        spanId: segment.spans.length - 1 || 0,
        spanLayer: 'Http',
        spanType: 'Exit',
        isError: false,
        parentSpanId: segment.spans.length,
        componentId: 10001, // ajax
        peer: xhrState.responseURL,
      };
      segment.spans.push(exitSpan);
    }
  });
}
