import { File } from "node:buffer";
import { writeToBuffer } from "@fast-csv/format";
import byteSize from "byte-size";
import gzip from "node-gzip";
import { uploadToKeboola } from "./uploadToKeboola.mjs";

const fileName = "data.csv";

async function collectError(resp) {
  if (resp.headers.get("Content-Type").startsWith("application/json")) {
    const err = await resp.json();
    return new Error(err.message ?? err.error);
  } else {
    const err = await resp.text();
    return new Error(err);
  }
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function formatOrdinals(n) {
  const enOrdinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });
  const suffixes = new Map([["one", "st"], ["two", "nd"], ["few", "rd"], ["other", "th"],]);
  const rule = enOrdinalRules.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
}

async function retry(f, logger) {
  let lastErr = null;
  for (let i = 0; i < 4; i++) {
    try {
      const resp = await f();
      if (resp.ok) return;
      lastErr = await collectError(resp);
    } catch (err) {
      lastErr = err;
    }
    logger.warning(`${formatOrdinals(i + 1)} try failed`, lastErr);
    await sleep((i + 1) * 10_000);
  }
  if (lastErr) throw lastErr;
}

export async function sendData(data, keboolaSettings, { bucket, table, headers }, logger) {
  // Serialize complex data as JSON
  const csvTable = data.map(row => Object.fromEntries(Object.entries(row)
  .map(([key, value]) => [key, (Array.isArray(value) || typeof value === "object") ? JSON.stringify(value) : value])));

  const csv = await writeToBuffer(csvTable, { headers: headers ?? true })
  .then((b) => gzip.gzip(b))
  .then((b) => new File([b], `${fileName}.gz`, { type: "application/gzip" }));

  try {
    logger.info(`Uploading to Keboola table ${bucket}.${table}…`);
    const start = Date.now();
    await retry(() => uploadToKeboola(bucket, table, csv, keboolaSettings), logger);
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    const size = byteSize(csv.size);
    logger.info(`Uploaded ${size} to ${bucket}.${table} in ${elapsed}s.`);
  } catch (err) {
    logger.error(err.message ?? "Upload Error", err);
  }
}
