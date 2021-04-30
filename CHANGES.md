# Changes

## 0.5.0

1. Add `noTraceOrigins` option.
2. Fix wrong URL when using relative path.
3. Catch frames errors.
4. Get response.body as a stream with the fetch API.
5. Support reporting multiple logs.

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