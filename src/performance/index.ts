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
import {prerenderChangeListener, onHidden, runOnce, idlePeriod} from "../services/eventsListener";
import pagePerf from './perf';
import FMP from './fmp';
import {observe} from "../services/observe";
import {LCPMetric, FIDMetric, CLSMetric} from "./type";
import {LayoutShift} from "../services/types";
import {getVisibilityObserver} from '../services/getVisibilityObserver';
import {getActivationStart, getResourceEntry} from '../services/getEntries';

const handler = {
  set(target: {[key: string]: unknown}, prop: string, value: unknown) {
    target[prop] = value;
    const source: {[key: string]: unknown} = {
      ...target,
      collector: undefined,
      useWebVitals: undefined,
    };
    if (target.useWebVitals && !isNaN(Number(target.fmpTime)) && !isNaN(Number(target.lcpTime)) && !isNaN(Number(target.clsTime))) {
      new TracePerf().reportPerf(source, String(target.collector));
    }
    return true;
  }
};
const reportedMetricNames: Record<string, boolean> = {};
const InitiatorTypes = ["beacon", "xmlhttprequest", "fetch"];
class TracePerf {
  private options: CustomOptionsType = {
    pagePath: '',
    serviceVersion: '',
    service: '',
    collector: ''
  };
  private perfInfo = {};
  private coreWebMetrics: Record<string, unknown> = {};
  private resources: {name: string, duration: string, size: number, protocol: string}[] = [];
  public getPerf(options: CustomOptionsType) {
    this.options = options;
    this.perfInfo = {
      pagePath: options.pagePath,
      serviceVersion: options.serviceVersion,
      service: options.service,
    }
    this.coreWebMetrics = new Proxy({...this.perfInfo, collector: options.collector, useWebVitals: options.useWebVitals}, handler);
    this.observeResources();
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      this.getBasicPerf();
    } else {
      window.addEventListener(
        'load',
        () => {
          this.getBasicPerf();
        },
      );
    }
    this.getCorePerf();
    window.addEventListener(
      'beforeunload',
      () => {
        const newResources = getResourceEntry().filter((d: PerformanceResourceTiming) => !InitiatorTypes.includes(d.initiatorType))
        .map((d: PerformanceResourceTiming) => ({
          name: d.name,
          duration: d.duration.toFixed(2),
          size: d.transferSize, 
          protocol: d.nextHopProtocol,
          type: d.initiatorType,
        }));
        new Report('RESOURCES', options.collector).sendByBeacon([...newResources, ...this.resources]);
      },
    );
  }

  private observeResources() {    
    const obs = observe('resource', (list) => {
      const newResources = list.filter((d: PerformanceResourceTiming) => !InitiatorTypes.includes(d.initiatorType))
      .map((d: PerformanceResourceTiming) => ({
        name: d.name,
        duration: d.duration.toFixed(2),
        size: d.transferSize,
        protocol: d.nextHopProtocol,
        type: d.initiatorType,
      }));
      this.resources.push(...newResources);
    });

    if (!obs) {
      return;
    }
  }

  private async getCorePerf() {
    if (this.options.useWebVitals) {
      this.LCP();
      this.FID();
      this.CLS();
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
          } else {
            partValue = entry.value;
          }
          entryList.push(entry);
        }
      });
      if (partValue > clsTime) {
        this.coreWebMetrics.clsTime = Math.floor(partValue);
      }
    };

    const obs = observe('layout-shift', handleEntries);

    if (!obs) {
      return;
    }
    onHidden(() => {
      handleEntries(obs.takeRecords() as CLSMetric['entries']);
      obs!.disconnect();
    });
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
  
      const obs = observe('largest-contentful-paint', processEntries);
      if (!obs) {
        return;
      }
      const disconnect = runOnce(() => {
        if (!reportedMetricNames['lcp']) {
          processEntries(obs!.takeRecords() as LCPMetric['entries']);
          obs!.disconnect();
          reportedMetricNames['lcp'] = true;
        }
      });
      ['keydown', 'click'].forEach((type) => {
        addEventListener(type, () => idlePeriod(disconnect), true);
      });
      onHidden(disconnect);
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
          new Report('WEBINTERACTION', this.options.collector).sendByXhr(perfInfo);
        }
      };
  
      const processEntries = (entries: FIDMetric['entries']) => {
        entries.forEach(processEntry);
      };
      const obs = observe('first-input', processEntries);
      if (!obs) {
        return;
      }

      onHidden(
        runOnce(() => {
          processEntries(obs.takeRecords() as FIDMetric['entries']);
          obs.disconnect();
        }),
      );
    })
  }
  private getBasicPerf() {
    // auto report pv and perf data
    const perfDetail = this.options.autoTracePerf ? new pagePerf().getPerfTiming() : {};
    const perfInfo = {
      ...perfDetail,
      ...this.perfInfo,
    };
    new Report('PERF', this.options.collector).sendByXhr(perfInfo);
    // clear perf data
    this.clearPerf();
  }

  public reportPerf(data: {[key: string]: unknown}, collector: string) {
    const perf = {
      ...data,
      ...this.perfInfo
    };
    new Report('WEBVITALS', collector).sendByXhr(perf);
  }

  private clearPerf() {
    if (!(window.performance && window.performance.clearResourceTimings)) {
      return;
    }
    window.performance.clearResourceTimings();
  }
}

export default new TracePerf();
