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
import { IPerfDetail } from './type';
class PagePerf {
  public getPerfTiming(): IPerfDetail {
    try {
      let { timing } = window.performance as PerformanceNavigationTiming | any; // PerformanceTiming
      if (typeof window.PerformanceNavigationTiming === 'function') {
        const nt2Timing = performance.getEntriesByType('navigation')[0];

        if (nt2Timing) {
          timing = nt2Timing;
        }
      }
      let redirectTime = 0;

      if (timing.navigationStart !== undefined) {
        redirectTime = parseInt(String(timing.fetchStart - timing.navigationStart), 10);
      } else if (timing.redirectEnd !== undefined) {
        redirectTime = parseInt(String(timing.redirectEnd - timing.redirectStart), 10);
      } else {
        redirectTime = 0;
      }

      return {
        redirectTime,
        dnsTime: parseInt(String(timing.domainLookupEnd - timing.domainLookupStart), 10),
        ttfbTime: parseInt(String(timing.responseStart - timing.requestStart), 10), // Time to First Byte
        tcpTime: parseInt(String(timing.connectEnd - timing.connectStart), 10),
        transTime: parseInt(String(timing.responseEnd - timing.responseStart), 10),
        domAnalysisTime: parseInt(String(timing.domInteractive - timing.responseEnd), 10),
        fptTime: parseInt(String(timing.responseEnd - timing.fetchStart), 10), // First Paint Time or Blank Screen Time
        domReadyTime: parseInt(String(timing.domContentLoadedEventEnd - timing.fetchStart), 10),
        loadPageTime: parseInt(String(timing.loadEventStart - timing.fetchStart), 10), // Page full load time
        // Synchronous load resources in the page
        resTime: parseInt(String(timing.loadEventStart - timing.domContentLoadedEventEnd), 10),
        // Only valid for HTTPS
        sslTime:
          location.protocol === 'https:' && timing.secureConnectionStart > 0
            ? parseInt(String(timing.connectEnd - timing.secureConnectionStart), 10)
            : undefined,
        ttlTime: parseInt(String(timing.domInteractive - timing.fetchStart), 10), // time to interact
        firstPackTime: parseInt(String(timing.responseStart - timing.domainLookupStart), 10), // first pack time
        fmpTime: 0, // First Meaningful Paint
      };
    } catch (e) {
      throw e;
    }
  }
}

export default PagePerf;
