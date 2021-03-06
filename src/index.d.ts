import type { Readable } from 'svelte/store';

export interface PingInit extends RequestInit {
    url: string;
    retry?: number;
    abort?: number;
    payload?: boolean;
}

export interface Config {
    ping?: PingInit | string;
    sse?: string;
}

export interface Status {
    online: boolean;
    hidden: boolean;
    heartbeat: boolean;
    stream: boolean;
}
export declare function statusable(config?: Config): Readable<Status>;
