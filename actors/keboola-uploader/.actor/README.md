# Keboola Uploader

Reliable uploader of Apify Datasets to [Keboola Connection](https://www.keboola.com/).
We are using [Storage API Importer](https://developers.keboola.com/integrate/storage/api/importer/) with optimal
defaults.
This actor is helpful in workflows or for ad-hoc data uploads.

This actor is generalisation of our custom-made uploaders for many of our projects. It uses minimum dependencies and
optimizes for speed and reliability.

- gracefully
  handles [migrations](https://docs.apify.com/academy/expert-scraping-with-apify/migrations-maintaining-state)
- implements retry policy for failed uploads
- supports [Actor Integration](https://docs.apify.com/platform/integrations/actors/integration-ready-actors)
- allows to fine tune the batch size for you optimal usage of resources

Your Apify Dataset will be split into batches, converted to CSV and uploaded with gzip compression enabled.
You should choose the `batchSize` according to the nature of you data. Primitive properties from your Dataset will
be 1:1 mapped to CSV table. Complex properties (arrays and objects) will be serialized to JSON, so you can
use [Snowflake support
for JSON](https://docs.snowflake.com/en/user-guide/querying-semistructured) in your transformations.

## Inputs

### Dataset ID

ID of [Apify Dataset](https://docs.apify.com/platform/storage/dataset) that should be uploaded to Keboola.
When you use this actor in Integrations workflow, this field is optional. Default Dataset of previous actor in the flow
will be used.

### Keboola Stack

Hostname of your Keboola stack import endpoint.
See [Keboola documentations](https://developers.keboola.com/overview/api/#stacks-and-endpoints)
for more details. Default is `import.keboola.com` for AWS US-East region.
You can alternatively set `KEBOOLA_STACK` environment variable instead.

Current multi-tenant stacks are:

| region           | hostname                                |
|------------------|-----------------------------------------|
| US Virginia AWS  | `import.keboola.com`                    |
| US Virginia GCP  | `import.us-east4.gcp.keboola.com`       |
| EU Frankfurt AWS | `import.eu-central-1.keboola.com`       |
| EU Ireland Azure | `import.north-europe.azure.keboola.com` |
| EU Frankfurt GCP | `import.europe-west3.gcp.keboola.com`   |

If you are a single tenant user then your hostname is in format `import.CUSTOMER_NAME.keboola.com`.

### Keboola Storage API Key

Your API Key to a Keboola project where you want to upload the data.
You should generate a new API key just for this actor with limited rights to **write-only** for destination bucket.
You can alternatively set `KEBOOLA_STORAGE_API_KEY` environment variable instead.

### Bucket

Name of the destination Keboola bucket. eg. `in.c-apify`

### Table

Name of the destination Keboola table. eg. `scrape_results`

### Headers

Array of header names of destination Keboola table.
You can use this to select subset of properties to result table or to reorder the columns - the order of headers is
preserved in result table.
You can leave it blank if your Dataset items have all properties always specified (without `undefined` values).
In this case properties of the first Dataset item are used.
Our recommendation is to be explicit to prevent unexpected data loss.

### Batch Size

Size of the batch to upload. Dataset will be split into more batches if it has more items that this number.
Batches will be uploaded sequentially. Choose the batch size according to the nature of you data and parallelization of
you process.
Generally speaking, Keboola Importer works best if you send less frequent bigger portions (dozens of MB gzipped) of
data.
On the other side you are constrained by the Actor size. You can easily hit OOM condition when this number is too high.

### Incremental load

When enabled, imported data will be added to the existing table.
When disabled, table will be truncated - all existing data will be deleted from the table.
Default is enabled (`true`).
