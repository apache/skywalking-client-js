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
import {ReportOpts} from "../types";
import {LayoutShift} from "../services/types";
import {observe} from "../services/observe";

export default function onCLS() {
  const metric: any = {name: "clsTime"};

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
    if (partValue > metric.value) {
      metric.value = partValue;
      metric.entries = entryList;
      return metric;
    }
  };

  const params = observe('layout-shift', handleEntries);

  return params;
};
