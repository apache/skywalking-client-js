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
import { ComponentId, ReadyStatus, ReportTypes, SpanLayer, SpanType } from '../../services/constant';
import uuid from '../../services/uuid';
import { encode } from 'js-base64';
import { CustomOptionsType } from '../../types';
import { SegmentFields, SpanFields } from '../type';

let customConfig: CustomOptionsType | any = {};
export default function xhrInterceptor(options: CustomOptionsType, segments: SegmentFields[]) {
  setOptions(options);
  const originalXHR = window.XMLHttpRequest as any;
  const xhrSend = XMLHttpRequest.prototype.send;
  const xhrOpen = XMLHttpRequest.prototype.open;

  if (!(xhrSend && xhrOpen)) {
    console.error('Tracing is not supported');
    return;
  }
  originalXHR.getRequestConfig = [];

  function ajaxEventTrigger(event: string) {
    const ajaxEvent = new CustomEvent(event, { detail: this });

    window.dispatchEvent(ajaxEvent);
  }

  function customizedXHR() {
    const liveXHR = new originalXHR();

    liveXHR.addEventListener(
      'readystatechange',
      function () {
        ajaxEventTrigger.call(this, 'xhrReadyStateChange');
      },
      false,
    );

    liveXHR.open = function (
      method: string,
      url: string,
      async: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      this.getRequestConfig = arguments;

      return xhrOpen.apply(this, arguments);
    };
    liveXHR.send = function (body?: Document | BodyInit | null) {
      return xhrSend.apply(this, arguments);
    };

    return liveXHR;
  }

  (window as any).XMLHttpRequest = customizedXHR;

  const segCollector: { event: XMLHttpRequest; startTime: number; traceId: string; traceSegmentId: string }[] = [];

  window.addEventListener('xhrReadyStateChange', (event: CustomEvent<XMLHttpRequest & { getRequestConfig: any[] }>) => {
    let segment = {
      traceId: '',
      service: customConfig.service,
      spans: [],
      serviceInstance: customConfig.serviceVersion,
      traceSegmentId: '',
    } as SegmentFields;
    const xhrState = event.detail.readyState;
    const config = event.detail.getRequestConfig;
    let url = {} as URL;
    if (config[1].startsWith('http://') || config[1].startsWith('https://')) {
      url = new URL(config[1]);
    } else if (config[1].startsWith('//')) {
      url = new URL(`${window.location.protocol}${config[1]}`);
    } else {
      url = new URL(window.location.href);
      url.pathname = config[1];
    }

    const noTraceOrigins = customConfig.noTraceOrigins.some((rule: string | RegExp) => {
      if (typeof rule === 'string') {
        if (rule === url.origin) {
          return true;
        }
      } else if (rule instanceof RegExp) {
        if (rule.test(url.origin)) {
          return true;
        }
      }
    });
    if (noTraceOrigins) {
      return;
    }

    const cURL = new URL(customConfig.collector);
    const pathname = cURL.pathname === '/' ? url.pathname : url.pathname.replace(new RegExp(`^${cURL.pathname}`), '');
    const internals = [ReportTypes.ERROR, ReportTypes.ERRORS, ReportTypes.PERF, ReportTypes.SEGMENTS] as string[];
    const isSDKInternal = internals.includes(pathname);

    if (isSDKInternal && !customConfig.traceSDKInternal) {
      return;
    }

    // The values of xhrState are from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
    if (xhrState === ReadyStatus.OPENED) {
      const traceId = uuid();
      const traceSegmentId = uuid();

      segCollector.push({
        event: event.detail,
        startTime: new Date().getTime(),
        traceId,
        traceSegmentId,
      });

      const traceIdStr = String(encode(traceId));
      const segmentId = String(encode(traceSegmentId));
      const service = String(encode(segment.service));
      const instance = String(encode(segment.serviceInstance));
      const endpoint = String(encode(customConfig.pagePath));
      const peer = String(encode(url.host));
      const index = segment.spans.length;
      const values = `${1}-${traceIdStr}-${segmentId}-${index}-${service}-${instance}-${endpoint}-${peer}`;

      event.detail.setRequestHeader('sw8', values);
    }

    if (xhrState === ReadyStatus.DONE) {
      const endTime = new Date().getTime();
      for (let i = 0; i < segCollector.length; i++) {
        if (segCollector[i].event.readyState === ReadyStatus.DONE) {
          let responseURL = {} as URL;
          if (segCollector[i].event.status) {
            responseURL = new URL(segCollector[i].event.responseURL);
          }

          const exitSpan: SpanFields = {
            operationName: customConfig.pagePath,
            startTime: segCollector[i].startTime,
            endTime,
            spanId: segment.spans.length,
            spanLayer: SpanLayer,
            spanType: SpanType,
            isError: event.detail.status === 0 || event.detail.status >= 400, // when requests failed, the status is 0
            parentSpanId: segment.spans.length - 1,
            componentId: ComponentId,
            peer: responseURL.host,
            tags: customConfig.detailMode
              ? [
                  {
                    key: 'http.method',
                    value: config[0],
                  },
                  {
                    key: 'url',
                    value: segCollector[i].event.responseURL || `${url.protocol}//${url.host}${url.pathname}`,
                  },
                ]
              : undefined,
          };
          segment = {
            ...segment,
            traceId: segCollector[i].traceId,
            traceSegmentId: segCollector[i].traceSegmentId,
          };
          segment.spans.push(exitSpan);
          segCollector.splice(i, 1);
        }
      }
      segments.push(segment);
    }
  });
}
export function setOptions(opt: CustomOptionsType) {
  customConfig = { ...customConfig, ...opt };
}
