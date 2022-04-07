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

import { CustomOptionsType } from '../types';
import Report from '../services/report';
import pagePerf from './perf';
import FMP from './fmp';
import { IPerfDetail } from './type';

class TracePerf {
  private perfConfig = {
    perfDetail: {},
  } as { perfDetail: IPerfDetail };

  public getPerf(options: CustomOptionsType) {
    this.recordPerf(options);
    if (options.enableSPA) {
      // hash router
      window.addEventListener(
        'hashchange',
        () => {
          this.recordPerf(options);
        },
        false,
      );
    }
  }

  public async recordPerf(options: CustomOptionsType) {
    let fmp: { fmpTime: number | undefined } = { fmpTime: undefined };
    if (options.autoTracePerf && options.useFmp) {
      fmp = await new FMP();
    }
    // auto report pv and perf data
    setTimeout(() => {
      if (options.autoTracePerf) {
        this.perfConfig.perfDetail = new pagePerf().getPerfTiming();
      }
      const perfDetail = options.autoTracePerf
        ? {
            ...this.perfConfig.perfDetail,
            fmpTime: options.useFmp ? parseInt(String(fmp.fmpTime), 10) : undefined,
          }
        : undefined;
      const perfInfo = {
        ...perfDetail,
        pagePath: options.pagePath,
        serviceVersion: options.serviceVersion,
        service: options.service,
      };
      new Report('PERF', options.collector).sendByXhr(perfInfo);
      // clear perf data
      this.clearPerf();
    }, 6000);
  }

  private clearPerf() {
    if (!(window.performance && window.performance.clearResourceTimings)) {
      return;
    }
    window.performance.clearResourceTimings();
    this.perfConfig = {
      perfDetail: {},
    } as { perfDetail: IPerfDetail };
  }
}

export default new TracePerf();
