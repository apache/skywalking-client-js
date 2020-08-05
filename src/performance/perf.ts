
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

import FMP from './fmp';
class PagePerf {
  private fmpTime: number = 0;

  constructor() {
    new FMP(this.getFmpTiming);
  }

  public getPerfTiming() {
    try {
      if (!window.performance || !window.performance.timing) {
        console.log('your browser do not support performance');
        return;
      }
      const { timing } = window.performance;
      const loadTime = timing.loadEventEnd - timing.loadEventStart;
      let redirectTime = 0;

      if (loadTime < 0) {
        setTimeout(() => {
          this.getPerfTiming();
        }, 3000);
        return;
      }

      if (timing.navigationStart !== undefined) {
        redirectTime = timing.fetchStart - timing.navigationStart;
      } else if (timing.redirectEnd !== undefined) {
        redirectTime = timing.redirectEnd - timing.redirectStart;
      } else {
        redirectTime = 0;
      }
      return {
        redirectTime,
        dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        ttfbTime: timing.responseStart - timing.requestStart, // Time to First Byte
        tcpTime: timing.connectEnd - timing.connectStart,
        transTime: timing.responseEnd - timing.responseStart,
        domAnalysisTime: timing.domInteractive - timing.responseEnd,
        fptTime: timing.responseEnd - timing.fetchStart, // First Paint Time or Blank Screen Time
        domReadyTime: timing.domContentLoadedEventEnd - timing.fetchStart,
        loadPage: timing.loadEventStart - timing.fetchStart, // Page full load time
        resTime: timing.loadEventStart - timing.domContentLoadedEventEnd, // Synchronous load resources in the page
        sslTime: timing.connectEnd - timing.secureConnectionStart, // Only valid for HTTPS
        ttlTime: timing.domInteractive - timing.fetchStart, // time to interact
        firstPackTime: timing.responseStart - timing.domainLookupStart, // first pack time
        fmpTime: this.fmpTime, // First Meaningful Paint
      };
    } catch (e) {
      throw e;
    }
  }

  private getFmpTiming(data: any) {
    console.log(data);
    this.fmpTime = data.fmpTiming;
  }
}

export default new PagePerf();
