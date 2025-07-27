import { parseInput } from "@hckr_/apify-keboola/input";
import { Actor, Dataset, log } from "apify";

// TODO: move this to separate package as it is general purpose utility
export async function importModuleFromString(code) {
  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`);
}

async function getInputMappingFn(mapping) {
  const getUrlOrFirstValue = x => x.url ?? Object.values(x).at(0);
  const defaultMapping = input => ({ startUrls: input.map(getUrlOrFirstValue) });
  const { inputMapping } = typeof mapping === "string"
    ? (await importModuleFromString(mapping))
    : {
      inputMapping(input) {
        return defaultMapping(input);
      },
    };
  return typeof inputMapping === "function" ? inputMapping : defaultMapping;
}

async function main() {
  const input = await Actor.getInput();
  const { keboolaIgniter, inputTableRecord, mapping, ...rest } = input;
  if (!keboolaIgniter?.targetActorId) {
    throw new Error("Required property keboolaIgniter.targetActorId is not defined. There is nothing to do.");
  }
  const { targetActorId } = keboolaIgniter;
  const apifyClient = Actor.newClient();

  const inputMapping = await getInputMappingFn(mapping);
  const parsedInput = await parseInput(inputTableRecord, apifyClient);
  const mappedInput = inputMapping(parsedInput);
  const targetActor = apifyClient.actor(targetActorId);
  const targetActorRun = await targetActor.start(Object.assign({}, rest, mappedInput));

  log.info(`Async run of ${targetActorId} started.`, targetActorRun);

  await Dataset.pushData({
    runStartDate: new Date().toISOString(),
    runId: Actor.getEnv().actorRunId,
    nextRunId: targetActorRun.id,
  });
}

await Actor.main(main, { statusMessage: "DONE" });
