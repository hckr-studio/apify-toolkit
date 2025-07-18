import { Actor, log as parentLog } from "apify";

/** @typedef { import("apify").ApifyEnv } ApifyEnv */
/** @typedef { import("apify").ActorRun } ActorRun */

const isDisabled = process.env.KEBOOLA_UPLOADER_DISABLED;
const log = parentLog.child({ prefix: "Keboola Uploader" });

/**
 * @param {UploaderInput} input
 */
export async function uploadToKeboola({
  datasetId,
  keboolaStorageApiKey,
  keboolaStack,
  bucket,
  table,
  headers,
  batchSize,
  incremental,
}) {
  if (isDisabled) return;
  log.info(`Uploading to table ${bucket}.${table}`);
  /** @type {ApifyEnv} */
  const env = await Actor.getEnv();
  /** @type {ActorRun} */
  const run = await Actor.call("hckr-studio/keboola-uploader", {
    datasetId,
    keboolaStorageApiKey,
    keboolaStack,
    bucket,
    table,
    headers,
    batchSize,
    incremental,
  });

  log.info(
    `upload ${run.status}: https://console.apify.com/organization/${run.userId}/actors/${run.actId}/runs/${run.id}#log`,
    { run }
  );
  if (run.status === "FAILED") throw new Error("Upload failed");
}
