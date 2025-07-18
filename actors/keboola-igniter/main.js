import {Actor, Dataset, log} from "apify";
import {parseStream} from "@fast-csv/parse";

async function parseInputUrlsList(inputTableRecord, apifyClient) {
  const {storeId, key} = inputTableRecord;

  // Input CSV is usually a large file, so we better read it from stream.
  // Use apify-client because SDK cannot work with streams.
  const storeClient = await apifyClient.keyValueStore(storeId);
  const {value: recordStream} = await storeClient.getRecord(key, {
    stream: true,
  });
  return parseStream(recordStream, {headers: true});
}

async function main() {
  const input = await Actor.getInput();
  const {keboolaIgniter, inputTableRecord, ...rest} = input;
  const {targetActorId} = keboolaIgniter;
  const apifyClient = Actor.newClient();

  const parser = await parseInputUrlsList(inputTableRecord, apifyClient);
  // TODO: read CSV stream imput and put it into Input of target actor

  const targetActor = apifyClient.actor(targetActorId);
  const targetActorRun = await targetActor.start(rest);

  log.info("Async run started", targetActorRun);

  await Dataset.pushData({
    runStartDate: new Date().toISOString(),
    runId: Actor.getEnv().actorRunId,
    nextRunId: targetActorRun.id,
  });
}

await Actor.main(main, {statusMessage: "DONE"});
