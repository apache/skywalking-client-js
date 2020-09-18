Apache SkyWalking Client JS
==========

<img src="http://skywalking.apache.org/assets/logo.svg" alt="Sky Walking logo" height="90px" align="right" />

[Apache SkyWalking](https://github.com/apache/skywalking) Client-side JavaScript exception and tracing library.
- Make browser as a start of whole distributed tracing
- Provide metrics and error collection to SkyWalking backend.
- Lightweight

# Usage
* Install: the skywalking-client-js runtime library is available at npm
```
npm install skywalking-client-js --save
```
* Init SDK
```
import ClientMonitor from 'skywalking-client-js';
```
```
ClientMonitor.register({
  service: 'test-ui',
  pagePath: 'http://localhost:8080/',
  serviceVersion: 'v1.0.0',
});
```
* SDK Reference


Parameter|Type|Description|Required|Default Value|
-|:-:|-:|
service|String|project id|true|-|
serviceVersion|String|project verison|true|-|
pagePath|String|project path|true|-|
jsErrors|Boolean|Support js errors monitoring|false|true|
apiErrors|Boolean|Support API errors monitoring|false|true|
resourceErrors|Boolean|Support resource errors monitoring|false|true|
useFmp|Boolean|Collect FMP (first meaningful paint) data of the first screen|false|false|
enableSPA|Boolean|Monitor the page hashchange event and report PV, which is suitable for single page application scenarios|false|false|
autoTracePerf|Boolean|Support automatic sending of performance data|false|true|
vue|Boolean|Support vue errors monitoring|false|true|
  

* API Reference

**register()**  
After the SDK is initially completed, it calls the register() interface to revise some of the configuration items. For details of the SDK configuration item, see SDK reference.  

register() grammar  
```
ClientMonitor.register(params);
```

register() call parameters  
Parameter|Type|Description|Required|Default Value|
-|:-:|-:|
params|Object|Configuration items and values to be modified|true|-|

**setPerformance()**  
After the page onLoad, call the setPerformance() interface to report the default performance metrics.  

How to use setPerformance()  
1. Set the SDK configuration item autoTracePerf to false to turn off automatic reporting performance metrics and wait for manual triggering of escalation.  
2. Call ClientMonitor.setPerformance (object) method to manually report user-defined indicators. In this process, the default performance metrics will also be automatically reported.  

setPerformance() examples of use  
```
import ClientMonitor from 'skywalking-client-js';

ClientMonitor.setPerformance({
  reportUrl: 'http://example.com',
  service: 'skywalking-ui',
  serviceVersion: 'v8.1.0',
  pagePath: location.href,
  useFmp: true
});
```

# Development
* npm install
* npm link skywalking-client-js
* npm run start

# Contact Us
* Submit an [issue](https://github.com/apache/skywalking/issues)
* Mail list: **dev@skywalking.apache.org**. Mail to `dev-subscribe@skywalking.apache.org`, follow the reply to subscribe the mail list.
* Join `#skywalking` channel at [Apache Slack](https://join.slack.com/t/the-asf/shared_invite/enQtNzc2ODE3MjI1MDk1LTAyZGJmNTg1NWZhNmVmOWZjMjA2MGUyOGY4MjE5ZGUwOTQxY2Q3MDBmNTM5YTllNGU4M2QyMzQ4M2U4ZjQ5YmY). If the linke is not working, find the latest one at [Apache INFRA WIKI](https://cwiki.apache.org/confluence/display/INFRA/Slack+Guest+Invites).
* QQ Group: 392443393(2000/2000, not available), 901167865(available)

# License
Apache 2.0

