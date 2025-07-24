# apify-persistent-stats

Library for collecting Stats in Apify runs. Stats are persisted and work reliable between actor migrations.

## Install package

```bash
yarn add @hckr_/apify-persistent-stats
```

## Usage

You can collect statistics during your scrape. They are periadically logged to teh console every 20 seconds.

```js
import { withPersistedStats } from "@hckr_/apify-persistent-stats";
import { Actor } from "apify";

async function main() {
  const stats = await withPersistedStats({
    notFound: 0,
    denied: 0,
    timeout: 0,
  });

  async function failedRequestHandler({ request, response }, error) {
    const status = response?.statusCode ?? error.message;
    switch (status) {
      case 404:
        stats.inc("notFound");
        break;
      case 401:
      case 403:
        stats.inc("denied");
        break;
      case "request timed out after 120 seconds.":
        stats.inc("timeout");
        break;
      default:
        stats.inc("failed");
        break;
    }
  }
}

await Actor.main(main, { statusMessage: "DONE" });
```

## Publish package

```bash
yarn npm publish --access public
```
