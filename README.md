Apache SkyWalking Client JS
==========

<img src="http://skywalking.apache.org/assets/logo.svg" alt="Sky Walking logo" height="90px" align="right" />

[Apache SkyWalking](https://github.com/apache/skywalking) Client-side JavaScript exception and tracing library.
- Provide metrics and error collection to SkyWalking backend.
- Lightweight
- Make browser as a start of whole distributed tracing

NOTICE,  SkyWalking Client JS 0.8.0 and later versions require SkyWalking v9.
# Usage

## Install  
The `skywalking-client-js` runtime library is available at [npm](https://www.npmjs.com/package/skywalking-client-js).

```
npm install skywalking-client-js --save
```

## Quick Start

**`skywalking-client-js` requires SkyWalking 8.2+**

User could use `register` method to load and report data automatically.

```js
import ClientMonitor from 'skywalking-client-js';
```
```js
// Report collected data to `http:// + window.location.host + /browser/perfData` in default
ClientMonitor.register({
  # Use core/default/restPort in the OAP server.
  # If External Communication Channels are activated, `receiver-sharing-server/default/restPort`,
  # ref to https://skywalking.apache.org/docs/main/latest/en/setup/backend/backend-expose/
  collector: 'http://127.0.0.1:12800', 
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
|service|String|project ID.|true|-|
|serviceVersion|String|project verison|true|-|
|pagePath|String|project path|true|-|
|jsErrors|Boolean|Support js errors monitoring|false|true|
|apiErrors|Boolean|Support API errors monitoring|false|true|
|resourceErrors|Boolean|Support resource errors monitoring|false|true|
|useFmp|Boolean|Collect FMP (first meaningful paint) data of the first screen|false|false|
|enableSPA|Boolean|Monitor the page hashchange event and report PV, which is suitable for [single page application scenarios](https://github.com/apache/skywalking-client-js#spa-page). |false|false|
|autoTracePerf|Boolean|Support sending of performance data automatically.|false|true|
|vue|Vue|Support vue2 errors monitoring. Deprecated: This is no longer recommended. Please use the [Catching errors in frames](https://github.com/apache/skywalking-client-js#catching-errors-in-frames-including-react-angular-vue) scenario instead. |false|undefined|
|traceSDKInternal|Boolean|Support tracing SDK internal RPC.|false|false|
|detailMode|Boolean|Support tracing http method and url as tags in spans.|false|true|
|noTraceOrigins|(string \| RegExp)[]|Origin in the `noTraceOrigins` list will not be traced.|false|[]|
|traceTimeInterval|Number|Support setting time interval to report segments.|false|60000|
|customTags|Array|Custom Tags|false|-|

## Collect Metrics Manually
Use the `setPerformance` method to report metrics at the moment of page loaded or any other moment meaningful.

1. Set the SDK configuration item autoTracePerf to false to turn off automatic reporting performance metrics and wait for manual triggering of escalation.  
2. Call `ClientMonitor.setPerformance(object)` method to report

- Examples
```js
import ClientMonitor from 'skywalking-client-js';

ClientMonitor.setPerformance({
  collector: 'http://127.0.0.1:12800',
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
```js
app.on('routeChange', function (next) {
  ClientMonitor.setPerformance({
    collector: 'http://127.0.0.1:12800',
    service: 'browser-app',
    serviceVersion: '1.0.0',
    pagePath: location.href,
    useFmp: true
  });
});   
```

## Tracing range of data requests in the browser

Support tracking these([XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)) two modes of data requests. At the same time, Support tracking libraries and tools that base on XMLHttpRequest and fetch, such as [Axios](https://github.com/axios/axios), [SuperAgent](https://github.com/visionmedia/superagent), [OpenApi](https://www.openapis.org/) and so on.

## Catching errors in frames, including React, Angular, Vue.

```js
// Angular
import { ErrorHandler } from '@angular/core';
import ClientMonitor from 'skywalking-client-js';
export class AppGlobalErrorhandler implements ErrorHandler {
  handleError(error) {
    ClientMonitor.reportFrameErrors({
      collector: 'http://127.0.0.1:12800',
      service: 'angular-demo',
      pagePath: '/app',
      serviceVersion: 'v1.0.0',
    }, error);
  }
}
@NgModule({
  ...
  providers: [{provide: ErrorHandler, useClass: AppGlobalErrorhandler}]
})
class AppModule {}
```

```js
// React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    ClientMonitor.reportFrameErrors({
      collector: 'http://127.0.0.1:12800',
      service: 'react-demo',
      pagePath: '/app',
      serviceVersion: 'v1.0.0',
    }, error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

```js
// Vue
Vue.config.errorHandler = (error) => {
  ClientMonitor.reportFrameErrors({
    collector: 'http://127.0.0.1:12800',
    service: 'vue-demo',
    pagePath: '/app',
    serviceVersion: 'v1.0.0',
  }, error);
}
```

## According to different pages or modules, add custom tags to spans.

```js
app.on('routeChange', function () {
  ClientMonitor.setCustomTags([
    { key: 'key1', value: 'value1' },
    { key: 'key2', value: 'value2' },
  ]);
});
```

# Security Notice
The SkyWalking client-js agent would be deployed and running outside of your datacenter. This means when you introduce this component you should be aware of the security impliciations.
There are various kinds of telemetry relative data would be reported to backend separately or through your original HTTP requests.

In order to implement **distributed tracing from the browser**, an HTTP header with the name `sw8` will be added to HTTP requests
according to [Cross Process Propagation Headers Protocol v3](https://skywalking.apache.org/docs/main/next/en/protocols/skywalking-cross-process-propagation-headers-protocol-v3/). 
`client-js` will also report spans and browser telemetry data through [Trace Data Protocol v3](https://skywalking.apache.org/docs/main/next/en/protocols/trace-data-protocol-v3/) and 
[Browser Protocol](https://skywalking.apache.org/docs/main/next/en/protocols/browser-protocol/).

Because all of this data is reported from an unsecured environment, users should make sure to:
1. Not expose OAP server to the internet directly.
1. Set up TLS/HTTPs between browser and OAP server.
1. Set up authentification(such as TOKEN based) for client-js reporting.
1. Validate all fields in the body of the HTTP headers and telemetry data mentioned above to detect and reject malicious data. Without such protections, an attacker could embed executable Javascript code in those fields, causing XSS or even Remote Code Execution (RCE) issues.

Please consult your security team before introducing this feature in your production environment. Don't expose the OAP server's IP/port(s) and URI without a security audit.

# Demo project

Demo project provides instrumented web application with necessary environment, you could just simple use it to see the data SkyWalking collected and how SkyWalking visualizes on the UI. 
See more information, [click here](https://github.com/SkyAPMTest/skywalking-client-test).

# Contact Us
* Submit an [issue](https://github.com/apache/skywalking/issues)
* Mail list: **dev@skywalking.apache.org**. Mail to `dev-subscribe@skywalking.apache.org`, follow the reply to subscribe the mail list.
* Join `#skywalking` channel at [Apache Slack](https://join.slack.com/t/the-asf/shared_invite/enQtNzc2ODE3MjI1MDk1LTAyZGJmNTg1NWZhNmVmOWZjMjA2MGUyOGY4MjE5ZGUwOTQxY2Q3MDBmNTM5YTllNGU4M2QyMzQ4M2U4ZjQ5YmY). If the linke is not working, find the latest one at [Apache INFRA WIKI](https://cwiki.apache.org/confluence/display/INFRA/Slack+Guest+Invites).
* QQ Group: 392443393, 901167865

# Release Guide
All committers should follow [Release Guide](release.md) to publish the official release.

# License
Apache 2.0
