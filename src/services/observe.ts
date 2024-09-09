/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {LargestContentfulPaint, LayoutShift} from "./types";
interface PerformanceEntryObj {
  'layout-shift': LayoutShift[];
  'largest-contentful-paint': LargestContentfulPaint[];
  'first-input': PerformanceEventTiming[];
}

export function observe <K extends keyof PerformanceEntryObj>(
  type: K,
  callback: (entries: PerformanceEntryObj[K]) => void,
  opts?: PerformanceObserverInit,
): PerformanceObserver {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(type)) {
      const perfObs = new PerformanceObserver((list) => {

        Promise.resolve().then(() => {
          callback(list.getEntries() as PerformanceEntryObj[K]);
        });
      });
      perfObs.observe(
        Object.assign(
          {
            type,
            buffered: true,
          },
          opts || {},
        ) as PerformanceObserverInit,
      );
      return perfObs;
    }
  } catch (e) {
    console.error(e);
  }
};