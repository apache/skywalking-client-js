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

import { CustomOptionsType } from '../types';
import uuid from '../services/uuid';
import Report from '../services/report';

class TraceSegment {
  private collector: string = undefined;
  private service: string = undefined;
  private serviceVersion: string = undefined;
  private pagePath: string = undefined;
  private Base64 = require('js-base64').Base64;
  private traceSegment: {
    traceId: string;
    spans: any[];
    serviceInstance: string;
    service?: string;
    traceSegmentId: string;
  } = undefined;
  private segmentUrl: string = undefined;
  private reportedSpanLength = 0;
  private servicePropertiesReported = false;

  public getTraceSegment() {
    if (!this.traceSegment || !(this.segmentUrl === window.location.href)) {
      this.reportSegment();
      this.reportedSpanLength = 0;
      this.segmentUrl = window.location.href;
      this.traceSegment = {
        traceId: uuid(),
        serviceInstance: this.serviceVersion,
        spans: [],
        service: this.service,
        traceSegmentId: uuid(),
      };
    }
    return this.traceSegment;
  }

  public newSpan(
    operationName: string,
    spanType: string,
    isError: boolean,
    componentId: number,
    tags: any[],
    logs: any[],
  ) {
    return {
      operationName: operationName,
      startTime: new Date().getTime(),
      endTime: new Date().getTime(),
      spanType: spanType,
      parentSpanId: -1,
      isError: isError,
      spanLayer: 'Http',
      tags: tags,
      logs: logs,
      componentId: componentId,
    };
  }

  public addSpan(span: any) {
    let traceSegment = this.getTraceSegment();
    if (!traceSegment.spans || traceSegment.spans.length <= 0) {
      traceSegment.spans.push(this.newSpan('Start', 'Local', false, 2, [], []));
    }
    if (!span.spanId) {
      span.spanId = traceSegment.spans.length || 0;
    }
    span.parentSpanId = 0;
    traceSegment.spans.push(span);
  }

  public reportServiceProperties() {
    if (!this.servicePropertiesReported) {
      let serviceProperties = {
        service: this.service,
        serviceInstance: this.serviceVersion,
        properties: [
          {
            language: 'h5js',
            'OS Name': navigator.userAgent,
            hostname: window.location.host,
            'Process No': '1700',
            ipv4: '8.171.45.193',
          },
        ],
      };
      new Report('PROPERTIES', this.collector).sendByFetch(serviceProperties);
      this.servicePropertiesReported = true;
    }
  }

  public reportSegment() {
    if (
      this.traceSegment &&
      this.traceSegment.traceId &&
      this.traceSegment.spans &&
      this.traceSegment.spans.length &&
      this.reportedSpanLength < this.traceSegment.spans.length
    ) {
      this.reportServiceProperties();
      this.reportedSpanLength = this.traceSegment.spans.length;
      new Report('TRACE', this.collector).sendByFetch(this.traceSegment);
      this.traceSegment.traceSegmentId = uuid();
    }
  }

  public asyncReport() {
    setTimeout(() => {
      this.reportSegment();
      this.asyncReport();
    }, 5000);
  }

  public traceAxios(options: CustomOptionsType, axios: any) {
    const { service, pagePath, serviceVersion, collector } = options;
    this.collector = collector;
    this.service = service;
    this.serviceVersion = serviceVersion;
    this.pagePath = pagePath;
    axios.interceptors.request.use(
      (config: any) => {
        let exitSpan = this.newSpan(
          'config.url',
          'Exit',
          false,
          2,
          [
            {
              key: 'http.method',
              value: config.method,
            },
            {
              key: 'http.params',
              value: JSON.stringify(config.params),
            },
          ],
          [],
        );
        config.span = exitSpan;
        this.addSpan(config.span);
        let traceSegment = this.getTraceSegment();

        let traceContextArray = [];
        traceContextArray.push('1');
        traceContextArray.push(this.Base64.encode(traceSegment.traceId));
        traceContextArray.push(this.Base64.encode(traceSegment.traceSegmentId));
        traceContextArray.push(config.span.spanId);
        traceContextArray.push(this.Base64.encode(traceSegment.service));
        traceContextArray.push(this.Base64.encode(traceSegment.serviceInstance));
        traceContextArray.push(this.Base64.encode(window.location.pathname));
        traceContextArray.push(this.Base64.encode(config.url));
        config.headers['sw8'] = traceContextArray.join('-');
        return config;
      },
      (error: any) => {
        let span = error.config.span;
        span.endTime = new Date().getTime();
        span.isError = true;
        return Promise.reject(error);
      },
    );
    axios.interceptors.response.use(
      (response: any) => {
        let span = response.config.span;
        span.endTime = new Date().getTime();
        return response;
      },
      (error: any) => {
        let span = error.config.span;
        span.endTime = new Date().getTime();
        span.isError = true;
        span.tags.push({
          key: 'http.response',
          value: JSON.stringify(error.response || 'error'),
        });
        return Promise.reject(error);
      },
    );
    this.asyncReport();
  }
}

export default new TraceSegment();
