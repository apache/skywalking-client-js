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

import {observe} from "../services/observe";
import {prerenderChangeListener} from "../services/eventsListener";
import {ReportOpts} from "../types";
import {FIDMetric} from "./type";
import {getVisibilityObserver} from '../services/getVisibilityObserver';

export default function FID(options: ReportOpts) {
  prerenderChangeListener(() => {
    const metric: any = {name: "fidTime"};
    const visibilityWatcher = getVisibilityObserver();
    const processEntry = (entry: PerformanceEventTiming) => {
      // Only report if the page wasn't hidden prior to the first input.
      if (entry.startTime < visibilityWatcher.firstHiddenTime) {
        metric.value = entry.processingStart - entry.startTime;
        metric.entries.push(entry);

        return metric;
      }
    };

    const processEntries = (entries: FIDMetric['entries']) => {
      entries.forEach(processEntry);
    };

    const params = observe('first-input', processEntries);

    return params;
  })
}
