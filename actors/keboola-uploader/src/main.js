import { Actor, Dataset, KeyValueStore, log } from "apify";
import { sendData } from "./sendData.mjs";

function plural(n, s, ss) {
  const cr = new Intl.PluralRules("en-US");
  const x = new Map([["one", s], ["other", ss ?? (s + "s")]]);
  return x.get(cr.select(n));
}

async function initBatcher(batchSize, itemCount) {
  const batches = Math.ceil(itemCount / batchSize);
  let currentIndex = (await KeyValueStore.getValue("currentIndex")) ?? 0;
  Actor.on("migrating", async () => {
    await KeyValueStore.setValue("currentIndex", currentIndex);
  });
  return {
    count: batches - currentIndex,
    *entries() {
      while (currentIndex < batches) {
        yield currentIndex++;
      }
    },
  };
}

async function main() {
  const input = await Actor.getInput();
  const {
    datasetId,
    keboolaStorageApiKey,
    keboolaStack,
    bucket,
    table,
    headers,
    batchSize,
    incremental,
  } = Object.assign({}, {
    keboolaStorageApiKey: process.env.KEBOOLA_STORAGE_API_KEY,
    keboolaStack: process.env.KEBOOLA_STACK ?? "import.keboola.com",
    batchSize: 1000,
    incremental: true,
    datasetId: input.payload?.resource?.defaultDatasetId,
  }, input);

  if (!datasetId && !keboolaStorageApiKey) {
    return console.log("Theres nothing to do. Most probably test.");
  }

  if (!datasetId) throw new Error("datasetId is missing in INPUT");
  if (!keboolaStorageApiKey) throw new Error("keboolaStorageApiKey is missing in INPUT");
  if (!bucket) throw new Error("bucket is missing in INPUT");
  if (!table) throw new Error("table is missing in INPUT");

  const dataset = await Actor.openDataset(datasetId);

  const { userId } = Actor.getEnv();
  const { itemCount, actId, actRunId } = await dataset.getInfo();
  const batcher = await initBatcher(batchSize, itemCount);
  const batches = batcher.count;

  log.info(
    `Got dataset ${datasetId} from actor run https://console.apify.com/organization/${userId}/actors/${actId}/runs/${actRunId}#storage`,
  );
  log.info(`Uploading ${itemCount} documents in ${batches} ${plural(batches, "batch", "batches")}.`);

  for (const currentIndex of batcher.entries()) {
    const data = await dataset.getData({
      limit: batchSize,
      offset: currentIndex * batchSize,
      skipEmpty: true,
    });
    const logger = log.child({ prefix: `KeboolaUploader:Batch#${currentIndex + 1}` });
    await sendData(
      data.items.filter(Boolean),
      { keboolaStorageApiKey, keboolaStack, incremental },
      { bucket, table, headers },
      logger,
    );
  }

  await Dataset.pushData({
    tableName: `${bucket}.${table}`,
    datasetId,
    actId,
    actRunId,
    userId,
    itemsCount: itemCount,
  });
}

await Actor.main(main, { statusMessage: "DONE" });
