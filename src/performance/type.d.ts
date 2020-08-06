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
export interface ICalScore {
  dpss: ICalScore[];
  st: number;
  els: Els;
  root?: Element;
}
export type Els = Array<{
  $node: Element;
  st: number;
  weight: number;
}>;
export type IPerfDetail = {
  redirectTime: number | undefined;
  dnsTime: number | undefined;
  ttfbTime: number | undefined; // Time to First Byte
  tcpTime: number | undefined;
  transTime: number | undefined;
  domAnalysisTime: number | undefined;
  fptTime: number | undefined; // First Paint Time or Blank Screen Time
  domReadyTime: number | undefined;
  loadPage: number | undefined; // Page full load time
  resTime: number | undefined; // Synchronous load resources in the page
  sslTime: number | undefined; // Only valid for HTTPS
  ttlTime: number | undefined; // time to interact
  firstPackTime: number | undefined; // first pack time
  fmpTime: number | undefined; // First Meaningful Paint
};