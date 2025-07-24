type KeboolaStack =
  | "import.keboola.com"
  | "import.us-east4.gcp.keboola.com"
  | "import.eu-central-1.keboola.com"
  | "import.north-europe.azure.keboola.com"
  | "import.europe-west3.gcp.keboola.com"
  | string;

type UploaderInput = {
  datasetId?: string;
  keboolaStorageApiKey?: string;
  keboolaStack?: KeboolaStack;
  bucket: string;
  table: string;
  headers?: string[];
  batchSize?: number;
  incremental?: boolean;
};
