# Changes

## 1.0.0

1. Monitor Core Web Vitals.
2. Monitor static resource metrics.
3. Bump up `infra-e2e`.
4. Bump dependencies to fix vulnerabilities.
5. Adjust readme for 1.0 release.
6. Fix can't catch the resource error.
7. Fix append http method to tags error.
8. Bump up `test ui`.
9. Fix the caught fetch request does not work when it receives a URL.

## 0.12.0
1. Fix native fetch implementation when using Request object.
2. Fix fetch implementation when using the Header object in http queries.
3. Bump dependencies.

## 0.11.0

1. Fixed the bug that navigator.sendBeacon sent json to backend report "No suitable request converter found for a @RequestObject List".
2. Fix reading property from null.
3. Pin selenium version and update license CI.
4. Bump dependencies.
5. Update README.

## 0.10.0

1. Fix the ability of Fetch constructure.
2. Update README.
3. Bump dependencies.

## 0.9.0

1. Fix custom configurations when the page router changed for SPA.
2. Fix reporting data by navigator.sendbeacon when pages is closed.
3. Bump dependencies.
4. Add Security Notice.
5. Support adding custom tags to spans.
6. Validate custom parameters for register.

## 0.8.0

1. Fix fmp metric.
2. Add e2e tese based on skywaling-infra-e2e.
3. Update metric and events.
4. Remove ServiceTag by following SkyWalking v9 new layer model.

## 0.7.0

1. Support setting time interval to report segments.
2. Fix segments report only send once.
3. Fix apache/skywalking#7335.
4. Fix apache/skywalking#7793.
5. Fix firstReportedError for SPA.

## 0.6.0

1. Separate production and development environments when building.
2. Upgrade packages to fix vulnerabilities.
3. Fix headers could be null .
4. Fix catching errors for http requests.
5. Fix the firstReportedError is calculated with more types of errors.

## 0.5.1

1. Add `noTraceOrigins` option.
2. Fix wrong URL when using relative path.
3. Catch frames errors.
4. Get `response.body` as a stream with the fetch API.
5. Support reporting multiple logs.
6. Support typescript project.

## 0.4.0

1. Update stack and message in logs.
2. Fix wrong URL when using relative path in xhr.

## 0.3.0

1. Support tracing starting at the browser.
2. Add traceSDKInternal SDK for tracing SDK internal RPC.
3. Add detailMode SDK for tracing http method and url as tags in spans.
4. Fix conditions of http status.

## 0.2.0

1. Fix: `secureConnectionStart` is zero bug.
2. Fix: `response.status` judge bug.

## 0.1.0

1. Establish the browser exception and tracing core.