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

interface EnhancedXMLHttpRequest extends XMLHttpRequest {
  getRequestConfig?: IArguments;
}

let customConfig: CustomOptionsType = {} as CustomOptionsType;
export default function xhrInterceptor(options: CustomOptionsType, segments: SegmentFields[]) {
  setOptions(options);
  const originalXHR = window.XMLHttpRequest as any;

  if (!originalXHR || !originalXHR.prototype || !originalXHR.prototype.open || !originalXHR.prototype.send) {
    console.error('Tracing is not supported - XMLHttpRequest not available');
    return;
  }

  function ajaxEventTrigger(this: EnhancedXMLHttpRequest, event: string): void {
    const ajaxEvent = new CustomEvent(event, { detail: this });

    window.dispatchEvent(ajaxEvent);
  }

  function customizedXHR(): EnhancedXMLHttpRequest {
    // Create a new XMLHttpRequest instance using the original constructor
    const liveXHR = new originalXHR();

    // Store the original methods before overriding
    const originalOpen = liveXHR.open;
    const originalSend = liveXHR.send;

    // Add the readystatechange event listener for tracing
    liveXHR.addEventListener(
      'readystatechange',
      function () {
        ajaxEventTrigger.call(this, 'xhrReadyStateChange');
      },
      false,
    );

    // Override the open method to capture request configuration
    liveXHR.open = function (
      method: string,
      url: string,
      async: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      // Store the request configuration for later use in tracing
      (this as EnhancedXMLHttpRequest).getRequestConfig = arguments;
      
      // Call the original open method with the correct context
      return originalOpen.apply(this, arguments);
    };

    // Override the send method and keeping original functionality
    liveXHR.send = function (body?: Document | BodyInit | null) {
      return originalSend.apply(this, arguments);
    };

    return liveXHR;
  }

  // Preserve the prototype chain by setting the prototype of our custom constructor
  customizedXHR.prototype = originalXHR.prototype;
  
  // Ensure the constructor property points to our custom constructor and make it non-writable
  Object.defineProperty(customizedXHR.prototype, 'constructor', {
    value: customizedXHR,
    writable: false,
    configurable: true,
    enumerable: false,
  });

  // Set the prototype of our custom constructor to inherit static properties from original XMLHttpRequest
  // This automatically provides access to all static properties like UNSENT, OPENED, etc.
  Object.setPrototypeOf(customizedXHR, originalXHR);

  (window as any).XMLHttpRequest = customizedXHR;

  const segCollector: { event: EnhancedXMLHttpRequest; startTime: number; traceId: string; traceSegmentId: string }[] = [];

  window.addEventListener('xhrReadyStateChange', (event: CustomEvent<EnhancedXMLHttpRequest>) => {
    let segment = {
      traceId: '',
      service: customConfig.service,
      spans: [],
      serviceInstance: customConfig.serviceVersion,
      traceSegmentId: '',
    } as SegmentFields;
    const xhrState = event.detail.readyState;
    const config = (event.detail.getRequestConfig || []) as IArguments;
    let url: URL;
    
    const urlString = config[1] as string;
    if (!urlString) {
      return;
    }
    
    try {
      if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
        url = new URL(urlString);
      } else if (urlString.startsWith('//')) {
        url = new URL(`${window.location.protocol}${urlString}`);
      } else {
        url = new URL(window.location.href);
        url.pathname = urlString;
      }
    } catch (error) {
      console.warn('Invalid URL in XHR request:', urlString, error);
      return;
    }

    const noTraceOrigins = customConfig.noTraceOrigins?.some((rule: string | RegExp): boolean => {
      if (typeof rule === 'string') {
        return rule === url.origin;
      } else if (rule instanceof RegExp) {
        return rule.test(url.origin);
      }
      return false;
    }) || false;
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
          let responseURL: URL | null = null;
          if (segCollector[i].event.status && segCollector[i].event.responseURL) {
            try {
              responseURL = new URL(segCollector[i].event.responseURL);
            } catch (error) {
              console.warn('Invalid response URL:', segCollector[i].event.responseURL, error);
            }
          }
          const tags = [
            {
              key: 'http.method',
              value: config[0],
            },
            {
              key: 'url',
              value: segCollector[i].event.responseURL || `${url.protocol}//${url.host}${url.pathname}`,
            },
          ];
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
            peer: responseURL?.host || url.host,
            tags: customConfig.detailMode
              ? customConfig.customTags
                ? [...tags, ...(customConfig.customTags || [])]
                : tags
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
