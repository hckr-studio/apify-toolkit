function formData(obj) {
  const body = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    body.append(key, value);
  }
  return body;
}

export function uploadToKeboola(bucket, table, data, { keboolaStorageApiKey, keboolaStack, incremental }) {
  return fetch(`https://${keboolaStack}/write-table`, {
    method: "POST",
    headers: { "X-StorageApi-Token": keboolaStorageApiKey },
    body: formData({
      data,
      tableId: `${bucket}.${table}`,
      incremental: incremental ? "1" : "0",
    }),
  });
}
