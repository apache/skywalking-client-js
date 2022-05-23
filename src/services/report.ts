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
    } else if (type === 'SEGMENT') {
      this.url = collector + ReportTypes.SEGMENT;
    } else if (type === 'SEGMENTS') {
      this.url = collector + ReportTypes.SEGMENTS;
    } else if (type === 'PERF') {
      this.url = collector + ReportTypes.PERF;
    }
  }

  public sendByFetch(data: any) {
    delete data.collector;
    if (!this.url) {
      return;
    }
    const sendRequest = new Request(this.url, { method: 'POST', body: JSON.stringify(data) });

    fetch(sendRequest)
      .then((response) => {
        if (response.status >= 400 || response.status === 0) {
          throw new Error('Something went wrong on api server!');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public sendByXhr(data: any) {
    if (!this.url) {
      return;
    }
    const xhr = new XMLHttpRequest();

    xhr.open('post', this.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status < 400) {
        console.log('Report successfully');
      }
    };
    xhr.send(JSON.stringify(data));
  }

  public sendByBeacon(data: any) {
    if (!this.url) {
      return;
    }
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(this.url, JSON.stringify(data));
      return;
    }

    this.sendByXhr(data);
  }
}
export default Report;
