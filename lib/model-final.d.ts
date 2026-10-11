// Deklarasi tipe untuk model hasil kompilasi SDEverywhere (lib/model-final.js).
import type { JsModel } from "@sdeverywhere/runtime";

declare const loadModel: () => Promise<JsModel>;
export default loadModel;
