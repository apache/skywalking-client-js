Apache SkyWalking Client JS
==========

<img src="http://skywalking.apache.org/assets/logo.svg" alt="Sky Walking logo" height="90px" align="right" />

[Apache SkyWalking](https://github.com/apache/skywalking) 客户端JavaScript异常和跟踪库。
- 使浏览器成为整个分布式跟踪的起点
- 向SkyWalking后端提供度量和错误收集
- 轻量级

# 使用
* 安装  
skywalking-client-js运行库在npm上提供  
```
npm install skywalking-client-js --save
```
* 初始化
SDK以ClientMonitor.register方式初始化
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
* SDK参考

|参数|类型|描述|是否必选|默认值|
|----|----|----|----|----|
|service|String|项目id|true|-|
|serviceVersion|String|项目verison|true|-|
|pagePath|String|项目路径|true|-|
|jsErrors|Boolean|支持监控js错误|false|true|
|apiErrors|Boolean|支持监控API错误|false|true|
|resourceErrors|Boolean|支持监控资源错误|false|true|
|useFmp|Boolean|收集首屏时间|false|false|
|enableSPA|Boolean|监听页面的hashchange事件并重新上报PV，适用于单页面应用场景|false|false|
|autoTracePerf|Boolean|支持自动上报性能数据|false|true|
|vue|Boolean|支持监控vue错误|false|true|

* API参考

**register()**  
在SDK最初完成后，它调用register()接口来修改一些配置项。有关SDK配置项的详细信息，请参阅SDK参考。  

register()语法  
```
ClientMonitor.register(params);
```

register()调用参数  
|参数|类型|描述|是否必选|默认值|
|----|----|---------|----|----|
|params|Object|配置项和值需要改变的|true|-|

**setPerformance()**  
页面加载后，调用setPerformance()接口来报告默认的性能指标。  

如何使用setPerformance()  
1. 将SDK配置项autoTracePerf设置为false，从而关闭自动上报性能指标，并等待手动触发上报。  
2. 调用ClientMonitor.setPerformance(object)方法上报默认性能指标.  

setPerformance()使用案列 
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
* 特殊场景

**SPA页面**  
在spa（单页应用程序）单页应用程序中，页面将只刷新一次。传统的方法在页面加载后只报告一次PV，不能统计每个子页面的PV，也不能使其他类型的日志按子页面聚合。   
The SDK provides two processing methods for spa pages:  
1. 开启SPA自动解析  
此方法适用于大部分以URL Hash作为路由的单页面应用场景.  
在初始化的配置项中，设置enableSPA为true，即会开启页面的Hashchange事件监听（触发重新上报PV），并将URL Hash作为其他数据上报中的page字段。   
2. 手动上报  
此方法可用于所有的单页面应用场景。如果第一种方法无效，则可用此方法。  
SDK提供了setPerformanc方法来手动更新数据上报时的参数。调用此方法时，默认会重新上报页面PV，详情请参见setPerformance().  
```
app.on('routeChange', function (next) {
  ClientMonitor.setPerformance({
    reportUrl: 'http://example.com',
    service: 'skywalking-ui',
    serviceVersion: 'v8.1.0',
    pagePath: location.href,
    useFmp: true
  });
});   
```

# Development
* 安装模块
```
npm install
```
* 使用此项目的项目需要执行以下操作  

```
npm link path/skywalking-client-js
```
```
import ClientMonitor from '../node_modules/skywalking-client-js/src/index';
ClientMonitor.register({
  service: 'test-ui',
  pagePath: 'http://localhost:8080/',
  serviceVersion: 'v1.0.0'
});
```
* 前端代理
Refer to [test project](https://github.com/SkyAPMTest/skywalking-client-test)
* 启动项目
```
npm run start
```

# 联系我们
* 提交 [issue](https://github.com/apache/skywalking/issues)
* 邮件列表: **dev@skywalking.apache.org**. 邮寄至 `dev-subscribe@skywalking.apache.org`, 按照回复订阅邮件列表.
* 加入 `#skywalking` channel at [Apache Slack](https://join.slack.com/t/the-asf/shared_invite/enQtNzc2ODE3MjI1MDk1LTAyZGJmNTg1NWZhNmVmOWZjMjA2MGUyOGY4MjE5ZGUwOTQxY2Q3MDBmNTM5YTllNGU4M2QyMzQ4M2U4ZjQ5YmY). 如果这个链接不可用，请在这里[Apache INFRA WIKI](https://cwiki.apache.org/confluence/display/INFRA/Slack+Guest+Invites)找到最新的一个.
* QQ Group: 392443393(2000/2000, 不可用), 901167865(可用)

# License
Apache 2.0
