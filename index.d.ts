export as namespace ClientMonitor;

export interface ClientMonitorConfig {
    collector?: string;
    service: string;
    serviceVersion: string;
    pagePath: string;
    jsErrors?: boolean;
    apiErrors?: boolean;
    resourceErrors?: boolean;
    useFmp?: boolean;
    enableSPA?: boolean;
    autoTracePerf?: boolean;
    vue?: Vue;
    traceSDKInternal?: boolean;
    detailMode?: boolean;
    noTraceOrigins?: (string | RegExp)[];
    traceTimeInterval?: number;
}

export function register(config: ClientMonitorConfig): void;
