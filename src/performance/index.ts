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

class TracePerf {
  private options: CustomOptionsType = {
    pagePath: '',
    serviceVersion: '',
    service: '',
    collector: ''
  };
  private perfInfo = {};
  private coreWebMetrics: {[key: string]: string | number | undefined} = {};
  public getPerf(options: CustomOptionsType) {
    this.options = options;
    this.perfInfo = {
      pagePath: options.pagePath,
      serviceVersion: options.serviceVersion,
      service: options.service,
    }
    this.coreWebMetrics = new Proxy({...this.perfInfo, collector: options.collector}, handler);
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      this.getBasicPerf();
    } else {
      window.addEventListener(
        'load',
        () => {
          this.getBasicPerf();
        },
        false,
      );
    }
    this.getCorePerf();
  }

  private async getCorePerf() {
    if (this.options.useWebVitals) {
      this.LCP();
      this.FID();
      this.CLS();
    }
    if (this.options.useFmp) {
      const {fmpTime} = await new FMP();
      this.coreWebMetrics.fmpTime = Math.floor(fmpTime);
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
        this.coreWebMetrics.clsTime = Math.floor(partValue);
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
            this.coreWebMetrics.lcpTime = Math.floor(Math.max(entry.startTime - getActivationStart(), 0));
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
          const fidTime = Math.floor(entry.processingStart - entry.startTime);
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
  private getBasicPerf() {
    // auto report pv and perf data
    const perfDetail = this.options.autoTracePerf ? new pagePerf().getPerfTiming() : {};
    const perfInfo = {
      ...perfDetail,
      ...this.perfInfo,
    };
    this.reportPerf({...perfInfo, isPV: true});
  }

  public reportPerf(data: {[key: string]: number | string | boolean}, collector?: string) {
    const perf = {
      ...data,
      ...this.perfInfo
    };
    new Report('PERF', collector || this.options.collector).sendByXhr(perf);
    // clear perf data
    this.clearPerf();
  }

  private clearPerf() {
    if (!(window.performance && window.performance.clearResourceTimings)) {
      return;
    }
    window.performance.clearResourceTimings();
  }
}

export default new TracePerf();

const handler = {
  set(target: {[key: string]: number | string | undefined}, prop: string, value: number | string | undefined) {
    target[prop] = value;
    if (!isNaN(Number(target.fmpTime)) && !isNaN(Number(target.lcpTime)) && !isNaN(Number(target.clsTime))) {
      const source: {[key: string]: number | string | undefined} = {
        ...target,
        collector: undefined,
      };
      new TracePerf().reportPerf(source, String(target.collector));
    }
    return true;
  }
};
