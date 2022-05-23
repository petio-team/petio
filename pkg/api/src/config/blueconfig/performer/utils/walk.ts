import { parse, stringify } from "../../lib/object-path";

import * as utils from "./utils";
const isObjNotNull = utils.isObjNotNull;

import * as cvtError from "./../../error";
const PATH_INVALID = cvtError.PATH_INVALID;

export default function walk(obj, path, initializeMissing?): Object {
  if (path) {
    path = Array.isArray(path) ? path : parse(path);
    const sibling = path.slice(0);
    const historic: any = [];
    while (sibling.length) {
      const key = sibling.shift();

      if (key !== "_cvtProperties") {
        historic.push(key);
      }

      if (initializeMissing && obj[key] == null) {
        obj[key] = {};
        obj = obj[key];
      } else if (isObjNotNull(obj) && key in obj) {
        obj = obj[key];
      } else {
        const noCvtProp = (path) => path !== "_cvtProperties";
        throw new PATH_INVALID(
          stringify(path.filter(noCvtProp)),
          historic.slice(0, -1),
          historic[historic.length - 1],
          obj
        );
      }
    }
  }

  return obj;
}
