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
import {LCPMetric, INPMetric, CLSMetric} from "./type";
import {LayoutShift} from "../services/types";
import {getVisibilityObserver} from "../services/getVisibilityObserver";
import {getActivationStart, getResourceEntry} from "../services/getEntries";
import {onBFCacheRestore} from "../services/bfcache";
import {handleInteractionEntry, clearInteractions, getLongestInteraction, DEFAULT_DURATION_THRESHOLD} from "../services/interactions";

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
  private resources: {name: string, duration: number, size: number, protocol: string, resourceType: string}[] = [];
  private inp: number = NaN;
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
      window.addEventListener('load', () => this.getBasicPerf());
    }
    this.getCorePerf();
    window.addEventListener('beforeunload', () => this.reportResources());
  }
  private observeResources() {    
    observe('resource', (list) => {
      const newResources = list.filter((d: PerformanceResourceTiming) => !InitiatorTypes.includes(d.initiatorType))
      .map((d: PerformanceResourceTiming) => ({
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        name: d.name,
        duration: Math.floor(d.duration),
        size: d.transferSize,
        protocol: d.nextHopProtocol,
        resourceType: d.initiatorType,
      }));
      this.resources.push(...newResources);
    });
  }
  private reportResources() {
    const newResources = getResourceEntry().filter((d: PerformanceResourceTiming) => !InitiatorTypes.includes(d.initiatorType))
      .map((d: PerformanceResourceTiming) => ({
        service: this.options.service,
        serviceVersion: this.options.serviceVersion,
        pagePath: this.options.pagePath,
        name: d.name,
        duration: Math.floor(d.duration),
        size: d.transferSize, 
        protocol: d.nextHopProtocol,
        resourceType: d.initiatorType,
      }));
    const list = [...newResources, ...this.resources];
    if (!list.length) {
      return;
    }
    new Report('RESOURCES', this.options.collector).sendByBeacon(list);
  }
  private async getCorePerf() {
    if (this.options.useWebVitals) {
      this.LCP();
      this.INP();
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
  private INP() {
    prerenderChangeListener(() => {
      const processEntries = (entries: INPMetric['entries']) => {
        idlePeriod(() => {
          entries.forEach(handleInteractionEntry);
          const interaction = getLongestInteraction();
          if (interaction && interaction.latency !== this.inp) {
            this.inp = interaction.latency;
            const param = {
              inpTime: interaction.latency,
              ...this.perfInfo,
            };
            new Report('WEBINTERACTION', this.options.collector).sendByXhr(param);
          }
        })
      };
      const obs = observe('event', processEntries, {
        durationThreshold: DEFAULT_DURATION_THRESHOLD,
      });
      if (!obs) {
        return;
      }
      obs.observe({type: 'first-input', buffered: true});
      onHidden(
        runOnce(() => {
          processEntries(obs.takeRecords() as INPMetric['entries']);
          obs.disconnect();
        }),
      );
      onBFCacheRestore(() => {
        clearInteractions();
        this.inp = NaN;
      })
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
