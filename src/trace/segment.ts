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
import { Base64 } from 'js-base64';
import xhrInterceptor from '../interceptors/xhr';
import uuid from '../services/uuid';
import Report from '../services/report';
import { SegmentFeilds, SpanFeilds } from './type';
import { SpanLayer, SpanType, ReadyStatus, ComponentId } from '../services/constant';
import { CustomOptionsType } from '../types';

export default function traceSegment(options: CustomOptionsType) {
  const segments = [] as any;
  const segCollector: { event: XMLHttpRequest; startTime: number }[] | any = [];
  // inject interceptor
  xhrInterceptor();
  window.addEventListener('xhrReadyStateChange', (event: CustomEvent) => {
    const segment = {
      traceId: uuid(),
      service: options.service,
      spans: [],
      serviceInstance: options.serviceVersion,
      traceSegmentId: options.segmentId,
    } as SegmentFeilds;
    const xhrState = event.detail.readyState;

    // The values of xhrState are from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
    if (xhrState === ReadyStatus.OPENED) {
      segCollector.push({
        event: event.detail,
        startTime: new Date().getTime(),
      });
      const traceIdStr = String(Base64.encode(segment.traceId));
      const segmentId = String(Base64.encode(segment.traceSegmentId));
      const service = String(Base64.encode(segment.service));
      const instance = String(Base64.encode(segment.serviceInstance));
      const endpoint = String(Base64.encode(options.pagePath));
      const peer = String(Base64.encode(location.href));
      const index = segment.spans.length;
      const values = `${1}-${traceIdStr}-${segmentId}-${index}-${service}-${instance}-${endpoint}-${peer}`;

      event.detail.setRequestHeader('sw8', values);
    }
    if (xhrState === ReadyStatus.DONE) {
      const endTime = new Date().getTime();
      for (let i = 0; i < segCollector.length; i++) {
        if (segCollector[i].event.status) {
          const exitSpan: SpanFeilds = {
            operationName: options.pagePath,
            startTime: segCollector[i].startTime,
            endTime,
            spanId: segment.spans.length,
            spanLayer: SpanLayer,
            spanType: SpanType,
            isError: event.detail.status >= 400 ? true : false,
            parentSpanId: segment.spans.length,
            componentId: ComponentId,
            peer: segCollector[i].event.responseURL,
          };
          segment.spans.push(exitSpan);
          segCollector.splice(i, 1);
        }
      }
      segments.push(segment);
    }
  });
  window.onbeforeunload = function (e: Event) {
    // todo Navigator.sendBeacon(url, FormData);
    new Report('SEGMENTS', options.collector).sendByFetch(segments);
  };
}
