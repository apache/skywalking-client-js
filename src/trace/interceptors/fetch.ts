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
import { encode } from 'js-base64';
import uuid from '../../services/uuid';
import { SegmentFields, SpanFields } from '../type';
import { CustomOptionsType } from '../../types';
import Base from '../../services/base';
import {
  ComponentId,
  ReportTypes,
  ServiceTag,
  SpanLayer,
  SpanType,
  ErrorsCategory,
  GradeTypeEnum,
} from '../../services/constant';

export default function windowFetch(options: CustomOptionsType, segments: SegmentFields[]) {
  const originFetch: any = window.fetch;

  window.fetch = async (...args: any) => {
    const startTime = new Date().getTime();
    const traceId = uuid();
    const traceSegmentId = uuid();
    let segment = {
      traceId: '',
      service: options.service + ServiceTag,
      spans: [],
      serviceInstance: options.serviceVersion,
      traceSegmentId: '',
    } as SegmentFields;
    let url = {} as URL;

    if (args[0].startsWith('http://') || args[0].startsWith('https://')) {
      url = new URL(args[0]);
    } else if (args[0].startsWith('//')) {
      url = new URL(`${window.location.protocol}${args[0]}`);
    } else {
      url = new URL(window.location.href);
      url.pathname = args[0];
    }

    const noTrace = options.noTraceOrigins.some((rule: string | RegExp) => {
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

    const collectorURL = new URL(options.collector);
    const hasTrace = !(
      noTrace ||
      (([ReportTypes.ERROR, ReportTypes.ERRORS, ReportTypes.PERF, ReportTypes.SEGMENTS] as string[]).includes(
        url.pathname.replace(new RegExp(`^${collectorURL.pathname}`), ''),
      ) &&
        !options.traceSDKInternal)
    );

    if (hasTrace) {
      const traceIdStr = String(encode(traceId));
      const segmentId = String(encode(traceSegmentId));
      const service = String(encode(segment.service));
      const instance = String(encode(segment.serviceInstance));
      const endpoint = String(encode(options.pagePath));
      const peer = String(encode(url.host));
      const index = segment.spans.length;
      const values = `${1}-${traceIdStr}-${segmentId}-${index}-${service}-${instance}-${endpoint}-${peer}`;

      if (!args[1]) {
        args[1] = {};
      }
      if (!args[1].headers) {
        args[1].headers = {};
      }
      args[1].headers['sw8'] = values;
    }

    let response;
    try {
      response = await originFetch(...args);

      return response.clone();
    } catch (e) {
      throw e;
    } finally {
      if (response && (response.status === 0 || response.status >= 400)) {
        const logInfo = {
          uniqueId: uuid(),
          service: options.service,
          serviceVersion: options.serviceVersion,
          pagePath: options.pagePath,
          category: ErrorsCategory.AJAX_ERROR,
          grade: GradeTypeEnum.ERROR,
          errorUrl: (response && response.url) || `${url.protocol}//${url.host}${url.pathname}`,
          message: `status: ${response ? response.status : 0}; statusText: ${response && response.statusText};`,
          collector: options.collector,
          stack: 'Fetch: ' + response && response.statusText,
        };
        new Base().traceInfo(logInfo);
      }
      if (hasTrace) {
        const endTime = new Date().getTime();
        const exitSpan: SpanFields = {
          operationName: options.pagePath,
          startTime: startTime,
          endTime,
          spanId: segment.spans.length,
          spanLayer: SpanLayer,
          spanType: SpanType,
          isError: response && (response.status === 0 || response.status >= 400), // when requests failed, the status is 0
          parentSpanId: segment.spans.length - 1,
          componentId: ComponentId,
          peer: url.host,
          tags: options.detailMode
            ? [
                {
                  key: 'http.method',
                  value: args[1].method || 'GET',
                },
                {
                  key: 'url',
                  value: (response && response.url) || `${url.protocol}//${url.host}${url.pathname}`,
                },
              ]
            : undefined,
        };
        segment = {
          ...segment,
          traceId: traceId,
          traceSegmentId: traceSegmentId,
        };
        segment.spans.push(exitSpan);
        segments.push(segment);
      }
    }
  };
}
