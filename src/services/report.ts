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

class Report {

  private url: string = '';

  constructor(url: string) {
    this.url = url;
  }

  public sendByXhr(data: any) {
    if (!this.checkUrl(this.url)) {
      return;
    }

    delete data.reportUrl;
    console.log(data);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
  }

  private reportByImg(data: any) {
    if (!this.checkUrl(this.url)) {
      return;
    }
    try {
      const imgObj = new Image();

      imgObj.src = `${this.url}?v=${new Date().getTime()}&${this.formatParams(data)}`;
    } catch (error) {
        // console.log(error);
    }
  }

  private formatParams(data: any) {
    return Object.keys(data).map((name: string) =>
    `${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`,
    ).join('&');
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
