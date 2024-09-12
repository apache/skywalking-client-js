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

import {CustomOptionsType} from '../types';
import Report from '../services/report';
import {prerenderChangeListener} from "../services/eventsListener";
import pagePerf from './perf';
import FMP from './fmp';
import {observe} from "../services/observe";
import {LCPMetric, FIDMetric} from "./type";
import {LayoutShift} from "../services/types";
import {getVisibilityObserver} from '../services/getVisibilityObserver';
import {getActivationStart} from '../services/getNavigationEntry';
import { IPerfDetail } from './type';

class TracePerf {
  private options: CustomOptionsType = {
    pagePath: '',
    serviceVersion: '',
    service: '',
    collector: ''
  };
  private perfInfo = {};
  private perfConfig = {
    perfDetail: {},
  } as { perfDetail: IPerfDetail };

  public getPerf(options: CustomOptionsType) {
    this.options = options;
    this.perfInfo = {
      pagePath: options.pagePath,
      serviceVersion: options.serviceVersion,
      service: options.service,
    }
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      this.getBasicPerf(options);
    } else {
      window.addEventListener(
        'load',
        () => {
          this.getBasicPerf(options);
        },
        false,
      );
    }
    this.getCorePerf()
  }

  private async getCorePerf() {
    if (this.options.useFmp) {
      await new FMP();
    }
    if (this.options.useWebVitals) {
      this.LCP();
      this.FID();
      this.CLS();
    }
  }
  private CLS() {
    let clsTime = 0;
    let partValue = 0;
    let entryList: LayoutShift[] = [];

    const handleEntries = (entries: LayoutShift[]) => {
      entries.forEach((entry) => {
        // Count layout shifts without recent user input only
        if (!entry.hadRecentInput) {
          const firstEntry = entryList[0];
          const lastEntry = entryList[entryList.length - 1];
          if (
            partValue &&
            entry.startTime - lastEntry.startTime < 1000 &&
            entry.startTime - firstEntry.startTime < 5000
          ) {
            partValue += entry.value;
            entryList.push(entry);
          } else {
            partValue = entry.value;
            entryList = [entry];
          }
        }
      });
      if (partValue > clsTime) {
        clsTime = partValue;
        const perfInfo = {
          clsTime,
          ...this.perfInfo,
        };
        this.reportPerf(perfInfo);
      }
    };

    observe('layout-shift', handleEntries);
  }
  private LCP() {
    prerenderChangeListener(() => {
      const visibilityObserver = getVisibilityObserver();
      const processEntries = (entries: LCPMetric['entries']) => {
        entries = entries.slice(-1);
        for (const entry of entries) {
          if (entry.startTime < visibilityObserver.firstHiddenTime) {
            const lcpTime = Math.max(entry.startTime - getActivationStart(), 0);
            const perfInfo = {
              lcpTime,
              ...this.perfInfo,
            };
            this.reportPerf(perfInfo);
          }
        }
      };
  
     observe('largest-contentful-paint', processEntries);
    })
  }
  private FID() {
    prerenderChangeListener(() => {
      const visibilityWatcher = getVisibilityObserver();
      const processEntry = (entry: PerformanceEventTiming) => {
        // Only report if the page wasn't hidden prior to the first input.
        if (entry.startTime < visibilityWatcher.firstHiddenTime) {
          const fidTime = entry.processingStart - entry.startTime;
          const perfInfo = {
            fidTime,
            ...this.perfInfo,
          };
          this.reportPerf(perfInfo);
        }
      };
  
      const processEntries = (entries: FIDMetric['entries']) => {
        entries.forEach(processEntry);
      };
  
      observe('first-input', processEntries);
    })
  }
  private getBasicPerf(options: CustomOptionsType) {
    // auto report pv and perf data
    if (options.autoTracePerf) {
      this.perfConfig.perfDetail = new pagePerf().getPerfTiming();
    }
    const perfDetail = options.autoTracePerf ? this.perfConfig.perfDetail : undefined;
    const perfInfo = {
      ...perfDetail,
      ...this.perfInfo,
    };
    this.reportPerf(perfInfo);
  }

  private reportPerf(data: {[key: string]: number | string}) {
    const perfInfo = {
      ...data,
      pagePath: this.options.pagePath,
      serviceVersion: this.options.serviceVersion,
      service: this.options.service,
    };
    new Report('PERF', this.options.collector).sendByXhr(perfInfo);
    // clear perf data
    this.clearPerf();
  }

  private clearPerf() {
    if (!(window.performance && window.performance.clearResourceTimings)) {
      return;
    }
    window.performance.clearResourceTimings();
    this.perfConfig = {
      perfDetail: {},
    } as { perfDetail: IPerfDetail };
  }
}

export default new TracePerf();
