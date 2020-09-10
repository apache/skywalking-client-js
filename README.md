Apache SkyWalking Client JS
==========

<img src="http://skywalking.apache.org/assets/logo.svg" alt="Sky Walking logo" height="90px" align="right" />

[Apache SkyWalking](https://github.com/apache/skywalking) Client-side JavaScript exception and tracing library.
- Make browser as a start of whole distributed tracing
- Provide metrics and error collection to SkyWalking backend.
- Lightweight

# Usage
* Install: the skywalking-client-js runtime library is available at npm
`$ npm install skywalking-client-js --save`
* Init SDK
`import ClientMonitor from 'skywalking-client-js';`
`ClientMonitor.register({`
  `service: 'test-ui',`
  `pagePath: 'http://localhost:8080/',`
  `serviceVersion: 'v1.0.0',`
});
* General SDK configuration
  Parameter|Type|Description|Required|Default Value
  -|:-:|-:
  service|String|project id|true|-
  serviceVersion|String|project verison|true|-
  pagePath|String|project path|true|-
  jsErrors|Boolean|Support js errors monitoring|true|true
  apiErrors|Boolean|Support API errors monitoring|true|true
  resourceErrors|Boolean|Support resource errors monitoring|true|true
  useFmp|Boolean|Support resource errors monitoring|true|false
  enableSPA|Boolean|Support resource errors monitoring|true|true
  autoSendPerf|Boolean|Support resource errors monitoring|true|true
  vue|Boolean|Support resource errors monitoring|true|true
* API
`register()`
`setPerformance()`

# Development
* npm install
* npm run start
* npm link skywalking-client-js

# Contact Us
* Submit an [issue](https://github.com/apache/skywalking/issues)
* Mail list: **dev@skywalking.apache.org**. Mail to `dev-subscribe@skywalking.apache.org`, follow the reply to subscribe the mail list.
* Join `#skywalking` channel at [Apache Slack](https://join.slack.com/t/the-asf/shared_invite/enQtNzc2ODE3MjI1MDk1LTAyZGJmNTg1NWZhNmVmOWZjMjA2MGUyOGY4MjE5ZGUwOTQxY2Q3MDBmNTM5YTllNGU4M2QyMzQ4M2U4ZjQ5YmY). If the linke is not working, find the latest one at [Apache INFRA WIKI](https://cwiki.apache.org/confluence/display/INFRA/Slack+Guest+Invites).
* QQ Group: 392443393(2000/2000, not available), 901167865(available)

# License
Apache 2.0

