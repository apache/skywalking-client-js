
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

import { CustomPerfOptionsType } from '../types';
import Report from '../services/report';
import pagePerf from './perf';
import FMP from './fmp';
import { IPerfDetail } from './type';

class TracePerf {
  private isPerf: boolean = true;
  private perfConfig = {
    perfDetail: {},
  } as { perfDetail: IPerfDetail };

  public async recordPerf(options: CustomPerfOptionsType) {
    if (this.isPerf) {
      this.perfConfig.perfDetail = await new pagePerf().getPerfTiming();
    }
    const fmp: {fmpTime: number} = await new FMP();

    setTimeout(() => {
      const perfInfo = {
        perfDetail: {...this.perfConfig.perfDetail, fmpTime: fmp.fmpTime},
        ...options,
      };
      new Report(options.reportUrl).sendByXhr(perfInfo);
      this.clearPerf();
    }, 5000);
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
