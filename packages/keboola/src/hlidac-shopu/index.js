import { bindActor } from "../uploader.js";

/**
 * @type {function(UploaderInput): Promise<void>}
 */
export const uploadToKeboola = bindActor("hlidac-shopu/keboola-uploader");
