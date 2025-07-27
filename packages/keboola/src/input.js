import { parseStream } from "@fast-csv/parse";

/**
 * @param {InputTableRecord} inputTableRecord
 * @param {ApifyClient} apifyClient
 */
export async function parseInput({ storeId, key }, apifyClient) {
  // Input CSV is usually a large file, so we better read it from stream.
  // Using apify-client because SDK cannot work with streams.
  const storeClient = await apifyClient.keyValueStore(storeId);
  const { value: recordStream } = await storeClient.getRecord(key, { stream: true });
  return parseStream(recordStream, { headers: true });
}
