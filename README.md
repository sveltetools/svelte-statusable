# Super tiny, simple to use SvelteJS store to control your application status.

[![NPM version](https://img.shields.io/npm/v/svelte-statusable.svg?style=flat)](https://www.npmjs.com/package/svelte-statusable) [![NPM downloads](https://img.shields.io/npm/dm/svelte-statusable.svg?style=flat)](https://www.npmjs.com/package/svelte-statusable)


## Install

```bash
npm i svelte-statusable --save-dev
```

```bash
yarn add svelte-statusable
```

CDN: [UNPKG](https://unpkg.com/svelte-statusable/) | [jsDelivr](https://cdn.jsdelivr.net/npm/svelte-statusable/) (available as `window.statusable`)

If you are **not** using ES6, instead of importing add 

```html
<script src="/path/to/svelte-statusable/index.js"></script>
```

just before closing body tag.

## Usage

### Create store to control `online/offline` status and page `visibility` with zero-config:

```javascript
import { statusable } from 'svelte-statusable';

export const status = statusable();
```

Check it somewhere in you app:

```svelte
{#if ! $status.online}
  <mark>Intenet connection lost</mark>
{/if}

<script>
  import { status } from './stores/status';

  $: if ($status.hidden) {
    player.pause();
  }
</script>
```

### Pass `ping` option on store creation to ping your server route and check its status: 

Just provide event name as `event` and `withCredentials` properties in config object.

```javascript
import { statusable } from 'svelte-statusable';

export const status = statusable({
  ping: 'https://mydomain/status'
});
```

OR additional options to full control:

```javascript
import { statusable } from 'svelte-statusable';

export const status = statusable({
  ping: {
    url: 'https://mydomain/status',
    retry: 5000, // interval of polling
    abort: 1000, // acceptable response time
    // any Fetch API options
  }
});
```

Check it somewhere in you app:

```svelte
{#if ! $status.heartbeat}
  <mark>Server connection lost</mark>
{/if}
```

### Usage with Server-sent event:

Just provide SSE url via `sse` option to control SSE stream status: 

```javascript
export const status = statusable({
  sse: 'https://mydomain/stream'
});
```

Check it somewhere in you app:

```svelte
{#if ! $status.stream}
  <mark>Live updates are stopped. Re-connecting...</mark>
{/if}
```

## License

MIT &copy; [PaulMaly](https://github.com/PaulMaly)
