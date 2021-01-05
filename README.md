Apache SkyWalking Client JS
==========

<img src="http://skywalking.apache.org/assets/logo.svg" alt="Sky Walking logo" height="90px" align="right" />

[Apache SkyWalking](https://github.com/apache/skywalking) Client-side JavaScript exception and tracing library.
- Provide metrics and error collection to SkyWalking backend.
- Lightweight
- Make browser as a start of whole distributed tracing

# Usage

## Install  
The `skywalking-client-js` runtime library is available at [npm](https://www.npmjs.com/package/skywalking-client-js).

```
npm install skywalking-client-js --save-dev
```

## Quick Start

**`skywalking-client-js` requires SkyWalking 8.2+**

User could use `register` method to load and report data automatically.

```
import ClientMonitor from 'skywalking-client-js';
```
```
// Report collected data to `http:// + window.location.host + /browser/perfData` in default
ClientMonitor.register({
  collector: 'http://127.0.0.1:8080',
  service: 'test-ui',
  pagePath: '/current/page/name',
  serviceVersion: 'v1.0.0',
});
```

### Parameters 
The register method supports the following parameters.

|Parameter|Type|Description|Required|Default Value|
|----|----|----|----|----|
|collector|String|In default, the collected data would be reported to current domain(`/browser/perfData`. Then, typically, we recommend you use a Gateway/proxy to redirect the data to the OAP(`resthost:restport`). If you set this, the data could be reported to another domain, NOTE [the Cross-Origin Resource Sharing (CORS) issuse and solution](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). |false|-|
|service|String|project id. NOTE, in tracing data requests, the service parameter is `service + '<browser>'`.|true|-|
|serviceVersion|String|project verison|true|-|
|pagePath|String|project path|true|-|
|jsErrors|Boolean|Support js errors monitoring|false|true|
|apiErrors|Boolean|Support API errors monitoring|false|true|
|resourceErrors|Boolean|Support resource errors monitoring|false|true|
|useFmp|Boolean|Collect FMP (first meaningful paint) data of the first screen|false|false|
|enableSPA|Boolean|Monitor the page hashchange event and report PV, which is suitable for single page application scenarios|false|false|
|autoTracePerf|Boolean|Support sending of performance data automatically.|false|true|
|vue|Boolean|Support vue errors monitoring|false|true|
|traceSDKInternal|Boolean|Support tracing SDK internal|false|false|

## Collect Metrics Manually
Use the `setPerformance` method to report metrics at the moment of page loaded or any other moment meaningful.

1. Set the SDK configuration item autoTracePerf to false to turn off automatic reporting performance metrics and wait for manual triggering of escalation.  
2. Call `ClientMonitor.setPerformance(object)` method to report

- Examples
```
import ClientMonitor from 'skywalking-client-js';

ClientMonitor.setPerformance({
  collector: 'http://127.0.0.1:8080',
  service: 'browser-app',
  serviceVersion: '1.0.0',
  pagePath: location.href,
  useFmp: true
});
```

## Special scene

### SPA Page 
In spa (single page application) single page application, the page will be refreshed only once. The traditional method only reports PV once after the page loading, but cannot count the PV of each sub-page, and can't make other types of logs aggregate by sub-page.  
The SDK provides two processing methods for spa pages:

1. Enable spa automatic parsing  
This method is suitable for most single page application scenarios with URL hash as the route.  
In the initialized configuration item, set enableSPA to true, which will turn on the page's hashchange event listening (trigger re reporting PV), and use URL hash as the page field in other data reporting.  
2. Manual reporting  
This method can be used in all single page application scenarios. This method can be used if the first method is invalid.    
The SDK provides a set page method to manually update the page name when data is reported. When this method is called, the page PV will be re reported by default. For details, see setPerformance().  
```
app.on('routeChange', function (next) {
  ClientMonitor.setPerformance({
    collector: 'http://127.0.0.1:8080',
    service: 'browser-app',
    serviceVersion: '1.0.0',
    pagePath: location.href,
    useFmp: true
  });
});   
```

## Tracing range of data requests in the browser

Support tracking these([XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)) two modes of data requests. At the same time, Support tracking libraries and tools that base on XMLHttpRequest and fetch, such as [Axios](https://github.com/axios/axios), [SuperAgent](https://github.com/visionmedia/superagent), [OpenApi](https://www.openapis.org/) and so on.

# Demo project

Demo project provides instrumented web application with necessary environment, you could just simple use it to see the data SkyWalking collected and how SkyWalking visualizes on the UI. 
See more information, [click here](https://github.com/SkyAPMTest/skywalking-client-test).

# Contact Us
* Submit an [issue](https://github.com/apache/skywalking/issues)
* Mail list: **dev@skywalking.apache.org**. Mail to `dev-subscribe@skywalking.apache.org`, follow the reply to subscribe the mail list.
* Join `#skywalking` channel at [Apache Slack](https://join.slack.com/t/the-asf/shared_invite/enQtNzc2ODE3MjI1MDk1LTAyZGJmNTg1NWZhNmVmOWZjMjA2MGUyOGY4MjE5ZGUwOTQxY2Q3MDBmNTM5YTllNGU4M2QyMzQ4M2U4ZjQ5YmY). If the linke is not working, find the latest one at [Apache INFRA WIKI](https://cwiki.apache.org/confluence/display/INFRA/Slack+Guest+Invites).
* QQ Group: 392443393, 901167865

# License
Apache 2.0
