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
import {getNavigationEntry} from '../services/getNavigationEntry';
class PagePerf {
  public getPerfTiming(): IPerfDetail {
    try {
      let { timing } = window.performance as PerformanceNavigationTiming | any; // PerformanceTiming
      if (typeof window.PerformanceNavigationTiming === 'function') {
        const nt2Timing = getNavigationEntry();

        if (nt2Timing) {
          timing = nt2Timing;
        }
      }
      let redirectTime = 0;

      if (timing.navigationStart !== undefined) {
        redirectTime = Math.floor(timing.fetchStart - timing.navigationStart);
      } else if (timing.redirectEnd !== undefined) {
        redirectTime = Math.floor(timing.redirectEnd - timing.redirectStart);
      } else {
        redirectTime = 0;
      }

      return {
        redirectTime,
        dnsTime: Math.floor(timing.domainLookupEnd - timing.domainLookupStart),
        ttfbTime: Math.floor(timing.responseStart - timing.requestStart), // Time to First Byte
        tcpTime: Math.floor(timing.connectEnd - timing.connectStart),
        transTime: Math.floor(timing.responseEnd - timing.responseStart),
        domAnalysisTime: Math.floor(timing.domInteractive - timing.responseEnd),
        fptTime: Math.floor(timing.responseEnd - timing.fetchStart), // First Paint Time or Blank Screen Time
        domReadyTime: Math.floor(timing.domContentLoadedEventEnd - timing.fetchStart),
        loadPageTime: Math.floor(timing.loadEventStart - timing.fetchStart), // Page full load time
        // Synchronous load resources in the page
        resTime: Math.floor(timing.loadEventStart - timing.domContentLoadedEventEnd),
        // Only valid for HTTPS
        sslTime:
          location.protocol === 'https:' && timing.secureConnectionStart > 0
            ? Math.floor(timing.connectEnd - timing.secureConnectionStart)
            : undefined,
        ttlTime: Math.floor(timing.domInteractive - timing.fetchStart), // time to interact
        firstPackTime: Math.floor(timing.responseStart - timing.domainLookupStart), // first pack time
      };
    } catch (e) {
      throw e;
    }
  }
}

export default PagePerf;
