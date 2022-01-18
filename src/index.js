import { readable } from 'svelte/store';

const hasWindow = typeof window !== 'undefined';
const hasNavigator = typeof navigator !== 'undefined';
const hasDocument = typeof document !== 'undefined';
const hasEventSource = typeof EventSource !== 'undefined';
const hasAbortController = typeof AbortController !== 'undefined';
const defaultRetry = 10000;

function setIntervalImmediately(func, interval) {
	func();
	return setInterval(func, interval);
}

function heartbeat({ url, abort = 0, payload = false, retry, ...options }) {
	/*eslint no-unused-vars: "off"*/

	if (abort && hasAbortController) {
		const ac = new AbortController();
		options.signal = ac.signal;
		setTimeout(() => ac.abort(), abort);
	}

	return fetch(url, options)
		.then((res) => (payload ? res.json() : res.type === 'opaque' || res.ok))
		.catch(() => false);
}

export function statusable({ ping, sse }) {
	let value = {
		online: hasNavigator ? navigator.onLine : true,
		hidden: hasDocument ? document.hidden : false,
		heartbeat: !hasWindow, // for SSR
		stream: !hasWindow,
	};

	if (typeof ping === 'string') {
		ping = {
			url: ping,
			method: 'HEAD',
			cache: 'no-cache',
			credentials: 'omit',
			referrerPolicy: 'no-referrer',
		};
	}

	return readable(value, (set) => {
		if (!hasWindow || !hasNavigator || !hasDocument) return;

		let es;
		let interval;

		function assign(key, val) {
			if (value[key] === val) return;
			set((value = { ...value, [key]: val }));
		}

		function online() {
			assign('online', navigator.onLine);
		}

		function visibility() {
			assign('hidden', document.hidden);
		}

		function stream(e) {
			assign('stream', e.target.readyState === EventSource.OPEN);
		}

		if (sse && hasEventSource) {
			es = new EventSource(sse);
			es.addEventListener('open', stream);
			es.addEventListener('error', stream);

			assign('stream', es.readyState === EventSource.OPEN);
		}

		if (ping) {
			interval = setIntervalImmediately(() => {
				if (document.hidden || !navigator.onLine) return;
				heartbeat(ping).then((heartbeat) => assign('heartbeat', heartbeat));
			}, ping.retry || defaultRetry);
		}

		window.addEventListener('online', online);
		window.addEventListener('offline', online);
		window.addEventListener('visibilitychange', visibility);

		return () => {
			window.removeEventListener('online', online);
			window.removeEventListener('offline', online);
			window.removeEventListener('visibilitychange', visibility);

			if (es) {
				es.removeEventListener('open', stream);
				es.removeEventListener('error', stream);
			}

			clearInterval(interval);
		};
	});
}
