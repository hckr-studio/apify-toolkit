import { bindActor } from "../index.js";

/** @typedef { import("apify").ApifyEnv } ApifyEnv */
/** @typedef { import("apify").ActorRun } ActorRun */

export const uploadToKeboola = bindActor("hlidac-shopu/keboola-uploader");
