import { Actor, log as parentLog } from "apify";

/** @typedef {import("apify").ApifyEnv} ApifyEnv */
/** @typedef {import("apify").ActorRun} ActorRun */

const { KEBOOLA_STORAGE_API_KEY, KEBOOLA_STACK, KEBOOLA_UPLOADER_DISABLED } = process.env;

const log = parentLog.child({ prefix: "Keboola Uploader" });

export function bindActor(actor = "hckr-studio/keboola-uploader") {
  /**
   * @param {UploaderInput} input
   */
  async function uploadToKeboola({
    datasetId,
    keboolaStorageApiKey,
    keboolaStack,
    bucket,
    table,
    headers,
    batchSize,
    incremental,
  }) {
    if (KEBOOLA_UPLOADER_DISABLED) return;
    log.info(`Uploading to table ${bucket}.${table}`);
    /** @type {ApifyEnv} */
    const env = await Actor.getEnv();
    /** @type {ActorRun} */
    const run = await Actor.call(actor, {
      datasetId: datasetId ?? env.defaultDatasetId,
      keboolaStorageApiKey: keboolaStorageApiKey ?? KEBOOLA_STORAGE_API_KEY,
      keboolaStack: keboolaStack ?? KEBOOLA_STACK,
      bucket,
      table,
      headers,
      batchSize,
      incremental,
    });

    log.info(
      `upload ${run.status}: https://console.apify.com/organization/${run.userId}/actors/${run.actId}/runs/${run.id}#log`,
      { run },
    );
    if (run.status === "FAILED") throw new Error("Upload failed");
  }

  return uploadToKeboola;
}

/**
 * @type {function(UploaderInput): Promise<void>}
 */
export const uploadToKeboola = bindActor();
