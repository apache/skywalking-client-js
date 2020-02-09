
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

class PagePerf {

  public getPerfTiming() {
    try {
      if (!window.performance || !window.performance.timing) {
        console.log('your browser do not support performance');
        return;
      }
      const { timing } = window.performance;
      const loadTime = timing.loadEventEnd - timing.loadEventStart;
      if (loadTime < 0) {
        setTimeout(() => {
          this.getPerfTiming();
        }, 300);
        return;
      }
      const perfTime = {
        redirectTime: timing.redirectEnd - timing.redirectStart,
        dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        ttfbTime: timing.responseStart - timing.navigationStart,
        appcacheTime: timing.domainLookupStart - timing.fetchStart,
        unloadTime: timing.unloadEventEnd - timing.unloadEventStart,
        tcpTime: timing.connectEnd - timing.connectStart,
        reqTime: timing.responseEnd - timing.responseStart,
        analysisTime: timing.domComplete - timing.domInteractive,
        blankTime: timing.domLoading - timing.navigationStart,
        domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadPage: timing.loadEventEnd - timing.navigationStart,
      };
      return perfTime;
    } catch (e) {
      throw e;
    }
  }
}

export default new PagePerf();
