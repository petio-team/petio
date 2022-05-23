import objectpath from "../../lib/object-path";

import * as utils from "./utils";
const unroot = utils.unroot;

import * as cvtError from "./../../error";
const PATH_INVALID = cvtError.PATH_INVALID;
const VALUE_INVALID = cvtError.VALUE_INVALID;

export default function validator(strictValidation) {
  const node = this._instance;
  const schema = this._schema;

  const errors = {
    undeclared: Array<any>(),
    invalid_type: Array<any>(),
    missing: Array<any>(),
  };

  function applyValidation(node, schema, path) {
    const nodeKeys = Object.keys(node || {});
    const schemaKeys = Object.keys(schema);

    const keys = [...nodeKeys, ...schemaKeys];

    for (let i = 0, len = keys.length; i < len; i++) {
      const name = keys[i];

      if (keys.indexOf(name) === i) {
        const fullpath = [...path, name];

        if (schemaKeys.indexOf(name) === -1) {
          // If schema[name] doesn't exist:
          if (strictValidation) {
            const err = new VALUE_INVALID(
              "configuration param '" +
                unroot(objectpath.stringify(fullpath)) +
                "' not declared in the schema"
            );
            errors.undeclared.push(err);
          }
        } else if (nodeKeys.indexOf(name) !== -1) {
          // If node[name] and schema[name] exists:
          if (!schema[name]._cvtProperties) {
            const attr = schema[name].attributes;
            // Is a property:
            if (
              attr.required ||
              !(
                typeof attr.default === "undefined" &&
                node[name] === attr.default
              )
            ) {
              try {
                schema[name].validate(node[name]);
              } catch (err) {
                errors.invalid_type.push(err);
              }
            }
          } else {
            applyValidation(node[name], schema[name]._cvtProperties, fullpath);
          }
        } else {
          // If node[name] doesn't exist and schema[name] exists:
          const fullname = unroot(objectpath.stringify(fullpath));
          const notfound = new PATH_INVALID(fullname, path, name, node);
          const error = new VALUE_INVALID(
            `config parameter "${fullname}" missing from config, did you override its parent? Because ${notfound.why}.`
          );
          errors.missing.push(error);
        }
      }
    }
  }

  applyValidation(node, schema._cvtProperties, []);

  return errors;
}
