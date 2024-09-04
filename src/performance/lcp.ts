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
import {ReportOpts} from "../types"
import {LCPMetric} from "./type";
import {getVisibilityObserver} from '../services/getVisibilityObserver';
import {getActivationStart} from '../services/getNavigationEntry';

export default function LCP(options: ReportOpts) {
  prerenderChangeListener(() => {
    const metric: any = {name: "lcpTime"};
    const visibilityObserver = getVisibilityObserver();
    const processEntries = (entries: LCPMetric['entries']) => {
      if (!options!.reportAllChanges) {
        entries = entries.slice(-1);
      }

      entries.forEach((entry) => {
        if (entry.startTime < visibilityObserver.firstHiddenTime) {
          metric.value = Math.max(entry.startTime - getActivationStart(), 0);
          metric.entries = [entry];
        }
      });
    };

    const params = observe('largest-contentful-paint', processEntries);

    return params;
  })
}
