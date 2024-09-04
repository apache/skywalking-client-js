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
import {LargestContentfulPaint} from "../services/types";
export interface ICalScore {
  dpss: ICalScore[];
  st: number;
  els: ElementList;
  root?: Element;
}
export type ElementList = Array<{
  ele: Element;
  st: number;
  weight: number;
}>;
export type IPerfDetail = {
  redirectTime: number | undefined; // Time of redirection
  dnsTime: number | undefined; // DNS query time
  ttfbTime: number | undefined; // Time to First Byte
  tcpTime: number | undefined; // Tcp connection time
  transTime: number | undefined; // Content transfer time
  domAnalysisTime: number | undefined; // Dom parsing time
  fptTime: number | undefined; // First Paint Time or Blank Screen Time
  domReadyTime: number | undefined; // Dom ready time
  loadPageTime: number | undefined; // Page full load time
  resTime: number | undefined; // Synchronous load resources in the page
  sslTime: number | undefined; // Only valid for HTTPS
  ttlTime: number | undefined; // Time to interact
  firstPackTime: number | undefined; // first pack time
  fmpTime: number | undefined; // First Meaningful Paint
};

export interface Metric {
  /**
   * The name of the metric (in acronym form).
   */
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

  /**
   * The current value of the metric.
   */
  value: number;

  /**
   * The rating as to whether the metric value is within the "good",
   * "needs improvement", or "poor" thresholds of the metric.
   */
  rating: 'good' | 'needs-improvement' | 'poor';

  /**
   * The delta between the current value and the last-reported value.
   * On the first report, `delta` and `value` will always be the same.
   */
  delta: number;

  /**
   * A unique ID representing this particular metric instance. This ID can
   * be used by an analytics tool to dedupe multiple values sent for the same
   * metric instance, or to group multiple deltas together and calculate a
   * total. It can also be used to differentiate multiple different metric
   * instances sent from the same page, which can happen if the page is
   * restored from the back/forward cache (in that case new metrics object
   * get created).
   */
  id: string;
  entries: PerformanceEntry[];

  /**
   * The type of navigation.
   *
   * This will be the value returned by the Navigation Timing API (or
   * `undefined` if the browser doesn't support that API), with the following
   * exceptions:
   * - 'back-forward-cache': for pages that are restored from the bfcache.
   * - 'back_forward' is renamed to 'back-forward' for consistency.
   * - 'prerender': for pages that were prerendered.
   * - 'restore': for pages that were discarded by the browser and then
   * restored by the user.
   */
  navigationType:
    | 'navigate'
    | 'reload'
    | 'back-forward'
    | 'back-forward-cache'
    | 'prerender'
    | 'restore';
}

export interface LCPMetric extends Metric {
  name: 'LCP';
  entries: LargestContentfulPaint[];
}