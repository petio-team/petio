import * as utils from "./utils";

const isObjNotNull = utils.isObjNotNull;
const unroot = utils.unroot;

import SchemaNode from "./../../model/schemanode";

import * as cvtError from "./../../error";

const SCHEMA_INVALID = cvtError.SCHEMA_INVALID;

const BUILT_INS_BY_NAME = {
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp,
};
const BUILT_IN_NAMES = Object.keys(BUILT_INS_BY_NAME);
const BUILT_INS = BUILT_IN_NAMES.map(function (name) {
  return BUILT_INS_BY_NAME[name];
});

export default function parsingSchema(
  name,
  rawSchema,
  schemaObjectModel,
  fullpath
) {
  if (name === "_cvtProperties") {
    throw new SCHEMA_INVALID(
      unroot(fullpath),
      "'_cvtProperties' is reserved word of blueconfig, it can be used like property name."
    );
  }

  const countChildren = rawSchema ? Object.keys(rawSchema).length : 0;
  const isArray = rawSchema ? Array.isArray(rawSchema) : false;
  const hasFormat = rawSchema ? rawSchema.format : false;

  const isConfigPropFormat =
    hasFormat && isObjNotNull(hasFormat) && !Array.isArray(hasFormat);

  const filterName = (name) => {
    return name === this._defaultSubstitute ? "default" : name;
  }; //                    ^^^^^^^^^^^^^^^^^^ = '$~default'

  name = filterName(name);

  // If the current schema (= rawSchema) :
  //   - is an object not null and not an array ;
  //   - is not a config property :
  //         - has no `.default` ;
  //         - has no `.format` or has `.format: [ isObject && notNull && notArray ]`
  //   - has children.
  // Then: recursively parsing like schema property.
  if (
    isObjNotNull(rawSchema) &&
    !isArray &&
    countChildren > 0 &&
    !("default" in rawSchema) &&
    (!hasFormat || isConfigPropFormat)
  ) {
    schemaObjectModel[name] = {
      _cvtProperties: {},
    };
    Object.keys(rawSchema).forEach((key) => {
      const path = fullpath + "." + key;
      parsingSchema.call(
        this,
        key,
        rawSchema[key],
        schemaObjectModel[name]._cvtProperties,
        path
      );
    });
    return;
  } else if (
    this._strictParsing &&
    isObjNotNull(rawSchema) &&
    !("default" in rawSchema)
  ) {
    // throw an error instead use magic parsing
    throw new SCHEMA_INVALID(unroot(fullpath), "default property is missing");
    // Magic parsing
  } else if (
    typeof rawSchema !== "object" ||
    rawSchema === null ||
    isArray ||
    countChildren === 0
  ) {
    // Parses a shorthand value to a config property
    rawSchema = { default: rawSchema };
  } else if (!("default" in rawSchema) && !isConfigPropFormat) {
    // Set `.default` to undefined when it doesn't exist
    rawSchema.default = (function () {})(); // === undefined
  }

  const schemaNode = new SchemaNode(rawSchema);

  schemaObjectModel[name] = schemaNode;
  const schema = schemaObjectModel[name].attributes;

  Object.keys(schema).forEach((keyname) => {
    if (this._getters.list[keyname]) {
      const usedOnlyOnce = this._getters.list[keyname].usedOnlyOnce;
      if (usedOnlyOnce) {
        if (!this._getterAlreadyUsed[keyname]) {
          this._getterAlreadyUsed[keyname] = new Set();
        }

        const value = schema[keyname];
        if (this._getterAlreadyUsed[keyname].has(value)) {
          if (typeof usedOnlyOnce === "function") {
            return usedOnlyOnce(value, schema, fullpath, keyname);
          } else {
            const errorMessage = `uses a already used getter keyname for "${keyname}", current: \`${keyname}[${JSON.stringify(
              value
            )}]\``;
            throw new SCHEMA_INVALID(unroot(fullpath), errorMessage);
          }
        }

        this._getterAlreadyUsed[keyname].add(schema[keyname]);
      }
    }
  });

  // mark this property as sensitive
  if (schema.sensitive === true) {
    this._sensitive.add(fullpath);
  }

  // store original format function
  let format = schema.format;
  const newFormat = (() => {
    if (BUILT_INS.indexOf(format) >= 0 || BUILT_IN_NAMES.indexOf(format) >= 0) {
      // if the format property is a built-in JavaScript constructor,
      // assert that the value is of that type
      const Format =
        typeof format === "string" ? BUILT_INS_BY_NAME[format] : format;
      const formatFormat = Object.prototype.toString.call(new Format());
      const myFormat = Format.name;
      schema.format = format = myFormat;
      return (value) => {
        if (formatFormat !== Object.prototype.toString.call(value)) {
          throw new Error("must be of type " + myFormat);
          //        ^^^^^-- will be catch in _cvtValidateFormat and convert to FORMAT_INVALID Error.
        }
      };
    } else if (typeof format === "string") {
      // store declared type
      if (!this.Ruler.types.has(format)) {
        throw new SCHEMA_INVALID(
          unroot(fullpath),
          `uses an unknown format type (current: ${JSON.stringify(format)})`
        );
      }
      // use a predefined type
      return this.Ruler.types.get(format);
    } else if (Array.isArray(format)) {
      // assert that the value is in the whitelist, example: ['a', 'b', 'c'].include(value)
      const contains = (whitelist, value) => {
        if (!whitelist.includes(value)) {
          throw new Error(
            "must be one of the possible values: " + JSON.stringify(whitelist)
          );
          //        ^^^^^-- will be catch in _cvtValidateFormat and convert to FORMAT_INVALID Error.
        }
      };
      return contains.bind(null, format);
    } else if (typeof format === "function") {
      return format;
    } else if (format) {
      // Wrong type for format
      const errorMessage =
        "uses an invalid format, it must be a format name, a function, an array or a known format type";
      const value = (format || "").toString() || "is a " + typeof format;
      throw new SCHEMA_INVALID(
        unroot(fullpath),
        `${errorMessage} (current: ${JSON.stringify(value)})`
      );
    } else if (!this._strictParsing && typeof schema.default !== "undefined") {
      // Magic format: default format is the type of the default value (if strictParsing is not enabled)
      const defaultFormat = Object.prototype.toString.call(schema.default);
      const myFormat = defaultFormat.replace(/\[.* |]/g, "");
      // Magic coerceing
      schema.format = format = myFormat;
      return (value) => {
        if (defaultFormat !== Object.prototype.toString.call(value)) {
          throw new Error("must be of type " + myFormat);
          //        ^^^^^-- will be catch in _cvtValidateFormat and convert to FORMAT_INVALID Error.
        }
      };
    } else {
      // .format are missing
      const errorMessage = "format property is missing";
      throw new SCHEMA_INVALID(unroot(fullpath), errorMessage);
    }
  })();

  if (typeof format === "string") {
    schemaNode._private.coerce = this.Ruler.getCoerceMethod(format);
  }

  schemaNode._private.validate = newFormat.bind(this);

  schemaNode._private.fullpath = fullpath;
}
