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
import { ReportTypes } from './constant';
class Report {
  private url: string = '';

  constructor(type: string, collector: string) {
    if (type === 'ERROR') {
      this.url = collector + ReportTypes.ERROR;
    } else if (type === 'ERRORS') {
      this.url = collector + ReportTypes.ERRORS;
    } else if (type === 'TRACE') {
      this.url = collector + ReportTypes.TRACE;
    } else if (type === 'PROPERTIES') {
      this.url = collector + ReportTypes.PROPERTIES;
    } else {
      this.url = collector + ReportTypes.PERF;
    }
  }

  public sendByFetch(data: any) {
    delete data.collector;
    const sendRequest = new Request(this.url, { method: 'POST', body: JSON.stringify(data) });

    fetch(sendRequest)
      .then((response) => {
        if (response.status < 200 || response.status > 300) {
          throw new Error('Something went wrong on api server!');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private reportByImg(data: any) {
    if (!this.checkUrl(this.url)) {
      return;
    }
    try {
      const imgObj = new Image();

      imgObj.src = `${this.url}?v=${new Date().getTime()}&${this.formatParams(data)}`;
    } catch (error) {
      console.log(error);
    }
  }

  private formatParams(data: any) {
    return Object.keys(data)
      .map((name: string) => `${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`)
      .join('&');
  }

  private checkUrl(url: string) {
    if (!url) {
      return;
    }
    const urlRule = /^[hH][tT][tT][pP]([sS]?):\/\//;
    return urlRule.test(url);
  }
}
export default Report;
