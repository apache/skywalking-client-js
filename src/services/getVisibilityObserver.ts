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

import {onBFCacheRestore} from './bfcache';

let firstHiddenTime = -1;

function initHiddenTime () {
  return document.visibilityState === 'hidden' && !(document as any).prerendering
    ? 0
    : Infinity;
};

function onVisibilityUpdate(event: Event) {
  if (document.visibilityState === 'hidden' && firstHiddenTime > -1) {
    firstHiddenTime = event.type === 'visibilitychange' ? event.timeStamp : 0;
    removeChangeListeners();
  }
};

function addChangeListeners() {
  addEventListener('visibilitychange', onVisibilityUpdate, true);
  addEventListener('prerenderingchange', onVisibilityUpdate, true);
};

function removeChangeListeners() {
  removeEventListener('visibilitychange', onVisibilityUpdate, true);
  removeEventListener('prerenderingchange', onVisibilityUpdate, true);
};

export function getVisibilityObserver() {
  if (firstHiddenTime < 0) {
    firstHiddenTime = initHiddenTime();
    addChangeListeners();
    onBFCacheRestore(() => {
      setTimeout(() => {
        firstHiddenTime = initHiddenTime();
        addChangeListeners();
      }, 0);
    });
  }
  return {
    get firstHiddenTime() {
      return firstHiddenTime;
    },
  };
};
