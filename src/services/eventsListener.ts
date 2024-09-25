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
export function prerenderChangeListener(callback: () => void) {
  if ((document as any).prerendering) {
    addEventListener('prerenderingchange', callback, true);
    return;
  }
  callback();
}

export function onHidden (cb: () => void) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cb();
    }
  });
};

export function runOnce (callback: () => void) {
  let called = false;
  return () => {
    if (!called) {
      callback();
      called = true;
    }
  };
};

export function idlePeriod(callback: () => void): number {
  const func = window.requestIdleCallback || window.setTimeout;

  let handle = -1;
  callback = runOnce(callback);
  if (document.visibilityState === 'hidden') {
    callback();
  } else {
    handle = func(callback);
    onHidden(callback);
  }
  return handle;
};
