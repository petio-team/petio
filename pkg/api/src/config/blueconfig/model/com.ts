import fs from 'fs';
import { cloneDeep } from 'lodash';

import * as cvtError from "../error";
import { parse, stringify } from '../lib/object-path';
import Apply from "../performer/apply";
import parsingSchema from "../performer/utils/parsingschema";
import * as utils from "../performer/utils/utils";
import validator from "../performer/utils/validator";
import walk from "../performer/utils/walk";
import SchemaNode from './schemanode';

const {unroot} = utils;

const ALLOWED_OPTION_STRICT = 'strict';
const ALLOWED_OPTION_WARN = 'warn';
const ALLOWED_OPTION_IGNORE = 'ignore';

const {BLUECONFIG_ERROR} = cvtError;
// 2
const {CUSTOMISE_FAILED} = cvtError;
const {INCORRECT_USAGE} = cvtError;
const {PATH_INVALID} = cvtError;
// 2
const {VALIDATE_FAILED} = cvtError;

/**
 * Class for configNode, created with blueconfig class. This class is declared by `const config = blueconfig(schema)`.
 *
 * The global getter config will be cloned to local config. You must refresh getters configs if you apply global change to local
 * (configuration instance).
 *
 * @example
 * const config = blueconfig({
 *   env: {
 *     doc: 'The applicaton environment.',
 *     format: ['production', 'development', 'test'],
 *     default: 'development',
 *     env: 'NODE_ENV'
 *   },
 *   log_file_path: {
 *     'doc': 'Log file path',
 *     'format': String,
 *     'default': '/tmp/app.log'
 *   }
 * });
 * // or
 * config = blueconfig('/some/path/to/a/config-schema.json');
 *
 * @param   {string|object}   rawSchema    Schema object or a path to a schema JSON file
 *
 * @param   {object}   [options]    Options:
 *
 * @param   {object}    [options.env]     Override `process.env` if specified using an object `{'NODE_ENV': 'production'}`.
 * @param   {string[]}  [options.args]    Override `process.argv` if specified using an array `['--argname', 'value']` or a string `--argname value`.
 * @param   {string}    [options.defaultSubstitute]    Override `'$~default'`, this value will be replaced by `'default'` during the schema parsing.
 * @param   {string}    [options.strictParsing]        Throw an error if `default` or `format` properties are omitted.
 *
 * @param   {object}   scope           workers
 * @param   {Getter}   scope.Getter    Getter worker
 * @param   {Parser}   scope.Parser    Parser worker
 * @param   {Ruler}    scope.Ruler     Ruler worker
 *
 * @class
 */
function ConfigObjectModel(rawSchema, options, scope) {
  this.options = options;

  this.Getter = scope.Getter;
  this.Parser = scope.Parser;
  this.Ruler = scope.Ruler;

  this._strictParsing = !!(options && options.strictParsing);
  // The key `$~default` will be replaced by `default` during the schema parsing that allow
  // to use default key for config properties.
  const optsDefSub = options ? options.defaultSubstitute : false;
  this._defaultSubstitute =
    typeof optsDefSub !== 'string' ? '$~default' : optsDefSub;

  // If the definition is a string treat it as an external schema file
  if (typeof rawSchema === 'string') {
    rawSchema = parseFile.call(this, rawSchema);
  }

  rawSchema = {
    root: rawSchema,
  };

  // build up current config from definition
  this._schema = {
    _cvtProperties: {
      // root key lets apply format on the config root tree
      // root: { _cvtProperties: {} }
    },
  };

  this._getterAlreadyUsed = {};
  this._sensitive = new Set();

  // inheritance (own getter)
  this._getters = this.Getter.cloneStorage();

  Object.keys(rawSchema).forEach((key) => {
    parsingSchema.call(
      this,
      key,
      rawSchema[key],
      this._schema._cvtProperties,
      key,
    );
  });

  this._schemaRoot = this._schema._cvtProperties.root;

  // config instance
  this._instance = {};

  Apply.getters.call(this, this._schema, this._instance);
}

export default ConfigObjectModel;

/**
 * Parse constructor arguments.
 * Returns the list of process arguments (not including the launcher and application file arguments).
 * Defaults to process.argv unless an override is specified using the args key of the second (options)
 * argument of the blueconfig function.
 *
 * @return    {string[]}    Returns custom args {options.args} or `process.argv.slice(2)`
 */
ConfigObjectModel.prototype.getArgs = function () {
  return (this.options && this.options.args) || process.argv.slice(2);
};

/**
 * Gets the environment variable map, using the override passed to the
 * blueconfig function or process.env if no override was passed.
 *
 * Returns the list of environment variables. Defaults to process.env unless an override is specified using the env key of
 * the second argument (options) argument of the blueconfig function.
 *
 * @return    {object}    Returns custom args {options.env} or `process.env`
 */
ConfigObjectModel.prototype.getEnv = function () {
  return (this.options && this.options.env) || process.env;
};

/**
 * Exports all the properties (that is the keys and their current values)
 *
 * @return    {object}    Returns properties
 */
ConfigObjectModel.prototype.getProperties = function () {
  return cloneDeep(this._instance.root);
};

/**
 * Exports all the properties (that is the keys and their current values) as
 * a JSON string, with sensitive values masked. Sensitive values are masked
 * even if they aren't set, to avoid revealing any information.
 *
 * @return    {string}    Returns properties as a JSON string
 */
ConfigObjectModel.prototype.toString = function () {
  const clone = cloneDeep(this._instance.root);
  this._sensitive.forEach((fullpath) => {
    const path = parse(unroot(fullpath));
    const childKey = path.pop();
    const parentKey = stringify(path);
    const parent = walk(clone, parentKey);
    parent[childKey] = '[Sensitive]';
  });
  return JSON.stringify(clone, null, 2);
};

/**
 * Exports the schema (as blueconfig understands your schema, may be more strict).
 *
 * @param    {boolean}    {debug=false}    When debug is true, returns Schema Node Model (as stored in blueconfig database).
 *
 * @return    {object}    Returns schema object
 */
ConfigObjectModel.prototype.getSchema = function (debug) {
  const schema = cloneDeep(this._schemaRoot);

  return debug ? schema : convertSchema.call(this, schema);
};

function convertSchema(schemaObjectModel) {
  if (
    !schemaObjectModel ||
    typeof schemaObjectModel !== 'object' ||
    Array.isArray(schemaObjectModel)
  ) {
    return schemaObjectModel;
  } if (schemaObjectModel._cvtProperties) {
    return convertSchema.call(this, schemaObjectModel._cvtProperties);
  } 
    let isSchemaNode = false;
    if (schemaObjectModel instanceof SchemaNode) {
      schemaObjectModel = (schemaObjectModel as any).attributes;
      isSchemaNode = true;
    }
    const schema = {};

    Object.keys(schemaObjectModel).forEach((name) => {
      let keyname = name;
      if (name === 'default' && !isSchemaNode) {
        keyname = this._defaultSubstitute;
      }

      schema[keyname] = convertSchema.call(this, schemaObjectModel[name]);
    });

    return schema;
  
}

/**
 * Exports the schema as a JSON string.
 *
 * @param    {boolean}    {debug=false}    When debug is true, returns Schema Node Model (as stored in blueconfig database).
 *
 * @return    {string}    Returns schema as a JSON string
 */
ConfigObjectModel.prototype.getSchemaString = function (debug) {
  return JSON.stringify(this.getSchema(debug), null, 2);
};

/**
 * Returns the current getter name of the `name` value origin. `name` can use dot notation to reference nested values.
 *
 * @example
 * config.get('db.host')
 * // or
 * config.get('db').host
 * // also
 * config.get('db[0]')
 * // with dot:
 * config.get('db["www.airbus.com"]') { 'db': { 'www.airbus.com': 'air company'} }
 * // in the first level
 * config.get("['site.fr']") // { 'site.fr': 'french site' }
 *
 * @param    {string}    name    Target property, `name` can use dot notation to reference
 *
 * @return   {*}     Returns the current `value` of the name property
 */
ConfigObjectModel.prototype.get = function (path) {
  const o = walk(this._instance.root, path);
  return cloneDeep(o);
};

/**
 * Returns the current getter name of the `name` value origin. `name` can use dot notation to reference nested values.
 *
 * @example
 * config.getOrigin('db.host')
 *
 * @param    {string}    name    Target property, `name` can use dot notation to reference
 *
 * @return   {string}     Returns the getter name with is the current origin of the value.
 */
ConfigObjectModel.prototype.getOrigin = function (path) {
  path = pathToSchemaPath(path);
  const obj = walk(this._schemaRoot._cvtProperties, path);
  return obj instanceof SchemaNode ? (obj as any).getOrigin() : undefined;
};

function pathToSchemaPath(path) {
  const schemaPath = Array<any>();

  path = parse(path);
  path.forEach((property) => schemaPath.push(property, '_cvtProperties'));
  schemaPath.splice(-1);

  /* if (addPath) {
    parsePath(addPath).forEach((key) => schemaPath.push(key))
  } */

  return schemaPath;
}

/**
 * Returns getter order. Local (configuration instance) version of blueconfig.sortGetters().
 *
 * @see Blueconfig.getGettersOrder
 *
 * @return    {string[]}    Returns current getter order
 */
ConfigObjectModel.prototype.getGettersOrder = function (path) {
  return [...this._getters.order];
};

/**
 * Sorts getter depending of array order, priority uses ascending order.
 *
 * Local (configuration instance) version of blueconfig.sortGetters().
 *
 * @see Blueconfig.sortGetters
 *
 * @example
 * config.sortGetters(['default', 'value', 'env', 'arg', 'force'])
 *
 * @param    {string[]}    newOrder    The new getter order
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.sortGetters = function (newOrder) {
  const sortFilter = this.Getter.sortGetters(this._getters.order, newOrder);

  this._getters.order.sort(sortFilter);

  return this;
};

/**
 * Reclone global getters config to local getters config and update configuration
 * object value depending on new getters' order.
 *
 * `value` set with `.merge()`/`.set()` will be replaced by schema/getter value depending
 * of Origin priority.
 *
 * @example
 * blueconfig.getGettersOrder() // ['default', 'value', 'env', 'arg', 'force']
 *
 * const config = blueconfig(schema) // will clone: ['default', 'value', 'env', 'arg', 'force']
 *
 * // ### Two ways to do:
 * // 1) Global change
 * blueconfig.sortGetters(['value', 'default', 'arg', 'env', 'force'])
 *
 * config.getGettersOrder() // ['default', 'value', 'env', 'arg', 'force']
 * blueconfig.getGettersOrder() // ['value', 'default', 'arg', 'env', 'force']
 *
 * // apply global change on local
 * config.refreshGetters() // refresh and apply global change to local
 *
 * config.getGettersOrder() // ['value', 'default', 'arg', 'env', 'force']
 * // 2) Local change
 * config.sortGetters(['default', 'value', 'env', 'arg', 'force'])
 * config.getGettersOrder() // ['default', 'value', 'env', 'arg', 'force']
 * blueconfig.getGettersOrder() // ['value', 'default', 'arg', 'env', 'force']
 */
ConfigObjectModel.prototype.refreshGetters = function () {
  this._getters = this.Getter.cloneStorage();

  Apply.getters.call(this, this._schema, this._instance);
};

/**
 * Returns the default value of the `name` property (defined in the schema). `name` can use dot notation to reference nested values.
 *
 * @example
 * config.default('db.host')
 *
 * @param    {string}    name    Target property, `name` can use dot notation to reference
 *
 * @return   {*}     Returns the default value.
 */
ConfigObjectModel.prototype.default = function (strPath) {
  // The default value for FOO.BAR.BAZ is stored in `_schema._cvtProperties` at:
  //   FOO._cvtProperties.BAR._cvtProperties.BAZ.default
  const path = pathToSchemaPath(strPath);

  try {
    const prop = walk(this._schemaRoot._cvtProperties, path);
    return cloneDeep((prop as any).attributes.default);
  } catch (err) {
    if (err instanceof PATH_INVALID) {
      throw new PATH_INVALID(
        `${err.fullname  }.default`,
        err.path,
        err.name,
        err.value,
      );
    } else {
      throw new INCORRECT_USAGE(
        `${unroot(strPath)  }: Cannot read property "default"`,
      );
    }
  }
};

/**
 * Resets a property to its default value as defined in the schema
 *
 * @example
 * config.reset('db.host')
 *
 * @param    {string}    name    Target property, `name` can use dot notation to reference
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.reset = function (name) {
  this.set(name, this.default(name), 'default', false);

  return this;
};

/**
 * Checks if the property `name` is set.
 *
 * @example
 * if (config.has('db.host')) {
 * // Your code
 * }
 *
 * @param    {string}    name    Target property, `name` can use dot notation to reference
 *
 * @return   {boolean}           Returns `true` if the property `name` is defined, or `false` otherwise.
 */
ConfigObjectModel.prototype.has = function (name) {
  const isRequired = (() => {
    try {
      const prop = walk(
        this._schemaRoot._cvtProperties,
        pathToSchemaPath(name),
      );
      return (prop as any).attributes.required;
    } catch (err) {
      return false;
      /*
      // For debug:
      if (err instanceof PATH_INVALID) {
        // undeclared property
        return false
      } else {
        // internal error
        throw err
      }
      */
    }
  })();

  try {
    // values that are set and required = false but undefined return false
    return isRequired || typeof this.get(name) !== 'undefined';
  } catch (err) {
    return false;
  }
};

/**
 * Sets the value `name` to value.
 *
 *
 * @example
 * config.set('property.that.may.not.exist.yet', 'some value')
 * config.get('property.that.may.not.exist.yet')
 * config.get('.property.that.may.not.exist.yet') // For path which start with `.` are ignored
 * // "some value"
 *
 * config.set('color', 'green', true) // getter: 'force'
 * // .get('color') --> 'green'
 *
 * config.set('color', 'orange', false, true) // getter: 'value' and respectPriority = true
 * // value will be not change because  ^^^^ respectPriority = true and value priority < force priority
 * // .get('color') --> 'green'
 *
 * config.set('color', 'pink', false) // getter: 'value'
 * // value will change because respectPriority is not active.
 * // .get('color') --> 'pink'
 *
 * config.set('color', 'green', true) // getter: 'force'
 * // .get('color') --> 'green'
 *
 * config.merge({color: 'blue'}) // getter: 'value'
 * // value will not change because value priority < force priority
 * // .get('color') --> 'green'
 *
 *
 * @param    {string}    name
 * Target property, `name` can use dot notation to reference nested values, e.g. `"db.name"`.
 * If objects in the chain don't yet exist, they will be initialized to empty objects.
 *
 * @param    {string}    [priority=false]
 * Optional, can be a boolean or getter name (a string). You must declare this property in
 * the schema to use this option. `set` will change the property getter origin depending on
 * `priority` value:
 *  - `false`: priority set to `value`.
 *  - `true`: priority set to `force`, can be only changed if you do another `.set(name, value)`.
 *    Make sure that `.refreshGetters()` will not overwrite your value.
 *  - `<string>`: must be a getter name (e.g.: `default`, `env`, `arg`).
 *
 * @param    {string}    [respectPriority=false]
 * Optional, if this argument is `true` this function will change the value only if `priority`
 * is higher than or equal to the property getter origin.
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.set = function (
  name,
  value,
  priority,
  respectPriority,
) {
  name = name.replace(/^\.(.+)$/, '$1'); // fix fast `root` & `unroot` issue (devfriendly)

  const mySchema = traverseSchema(this._schemaRoot, name);

  if (!priority) {
    priority = 'value';
  } else if (typeof priority !== 'string') {
    priority = 'force';
  } else if (
    !this._getters.list[priority] &&
    !['value', 'force'].includes(priority)
  ) {
    throw new INCORRECT_USAGE(`unknown getter: ${  priority}`);
  } else if (!mySchema) {
    // no schema and custom priority = impossible
    const errorMsg =
      `you cannot set priority because "${ 
      name 
      }" not declared in the schema`;
    throw new INCORRECT_USAGE(errorMsg);
  }

  // walk to the value
  const path = parse(name);
  const childKey = path.pop();
  const parentKey = stringify(path);
  const parent = walk(this._instance.root, parentKey, true);

  // respect priority
  const canIChangeValue = (() => {
    if (!respectPriority) {
      // -> false or not declared -> always change
      return true;
    }

    const gettersOrder = this._getters.order;

    const lastG = mySchema && mySchema.getOrigin && mySchema.getOrigin();

    if (lastG && gettersOrder.indexOf(priority) < gettersOrder.indexOf(lastG)) {
      return false;
    }

    return true;
  })();

  // change the value
  if (canIChangeValue) {
    parent[childKey] =
      mySchema && mySchema.coerce ? mySchema.coerce(value) : value;
    if (mySchema && mySchema._private) {
      mySchema._private.origin = priority;
    }
  }

  return this;
};

/*
 * Get the selected property for COM.set(...)
 */
function traverseSchema(schema, path) {
  const ar = parse(path);
  let o = schema;
  while (ar.length > 0) {
    const k = ar.shift();
    if (o && o._cvtProperties && o._cvtProperties[k]) {
      o = o._cvtProperties[k];
    } else {
      o = null;
      break;
    }
  }

  return o;
}

/**
 * Merges a JavaScript object into config
 *
 * @deprecated since v6.0.0, use `.merge(obj)` instead or strict way: `.merge(obj, 'data')`
 *
 * @param    {object}    obj    Load object
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.load = function (obj) {
  Apply.values.call(
    this,
    {
      root: cloneDeep(obj),
    },
    this._instance,
    this._schema,
  );

  return this;
};

/**
 * Merges a JavaScript properties files into config
 *
 * @deprecated since v6.0.0, use `.merge(string|string[])` instead or strict way: `.merge(string|string[], 'filepath')`
 *
 * @param    {string|string[]}    paths    Config file paths
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.loadFile = function (paths) {
  if (!Array.isArray(paths)) paths = [paths];
  paths.forEach((path) => {
    // Support empty config files #253
    const json = parseFile.call(this, path);
    if (json) {
      this.load(json);
    }
  });
  return this;
};

function parseFile(path) {
  const segments = path.split('.');
  const extension = segments.length > 1 ? segments.pop() : '';

  // TODO: Get rid of the sync call
  // eslint-disable-next-line no-sync
  return this.Parser.parse(extension, fs.readFileSync(path, 'utf-8'));
}

/**
 * Merges a JavaScript object/files into config
 *
 * @example
 * // Loads/merges a JavaScript object into `config`.
 * config.merge({
 *   'env': 'test',
 *   'ip': '127.0.0.1',
 *   'port': 80
 * })
 *
 * @example
 * // If you set contentType to data, blueconfig will parse array like config and not like several config.
 * config.merge([
 *   {'ip': 'test'},
 *   {'ip': '127.0.0.1'},
 *   {'ip': 80}
 * ], 'data').getProperties() // === [{'ip': 'test'}, {'ip': '127.0.0.1'}, {'ip': 80}]
 *
 * config.merge([
 *   {'ip': 'test'},
 *   {'ip': '127.0.0.1'},
 *   {'ip': 80}
 * ]).getProperties() // === {'ip': 80}
 *
 * // Merges one or multiple JSON configuration files into `config`.
 * config.merge('./config/' + conf.get('env') + '.json')
 *
 * // Or, merging multiple files at once.
 * config.merge(process.env.CONFIG_FILES.split(','))
 * // -> where env.CONFIG_FILES=/path/to/production.json,/path/to/secrets.json,/path/to/sitespecific.json
 *
 * @params   {object|string|string[]}      sources    Configs will be merged
 * @params   {string}    [contentType]
 * Accept: `data` or `filepath`. If you set contentType to data, blueconfig will parse array like config and not like several config.
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.merge = function (sources, contentType) {
  if (!Array.isArray(sources) || contentType === 'data') sources = [sources];
  sources.forEach((config) => {
    if (typeof config !== 'string' || contentType === 'data') {
      this.load(config);
    } else {
      const json = parseFile.call(this, config);
      if (json) {
        this.load(json);
      }
    }
  });
  return this;
};

/**
 * Validates the config considering the schema (iterates each `SchemaNode.validate()` in your config).
 * All errors are collected and thrown or displayed at once.
 *
 * @example
 * config.validate({
 *   allowed: 'strict',
 *   output: require('debug')('blueconfig:validate:error')
 * })
 *
 *
 * @memberof ConfigObjectModel
 *
 * @param   {object}   [options]    Options, accepts: `options.allow` and `options.output`:
 *
 * @param   {string}   [options.allowed=warn]
 * Any properties specified in config files that are not declared in the schema will
 * print a warning or throw an error depending on this setting:
 *  - `'warn'`: is the default behavior, will print a warning.
 *  - `'strict'`: will throw errors. This is to ensure that the schema and the config
 *    files are sync.
 *
 * @param   {string}   [options.output]
 * You can replace the default output `console.log` by your own output function.
 * You can use [debug module](https://www.npmjs.com/package/debug) like the example.
 *
 * @return   {this}
 */
ConfigObjectModel.prototype.validate = function (options) {
  options = options || {};

  options.allowed = options.allowed || ALLOWED_OPTION_IGNORE;

  if (options.output && typeof options.output !== 'function') {
    throw new CUSTOMISE_FAILED(
      'options.output is optionnal and must be a function.',
    );
  }

  const output_function = options.output || global.console.log;

  const errors = validator.call(this, options.allowed);

  // Write 'Warning:' in bold and in yellow
  const BOLD_YELLOW_TEXT = '\x1b[33;1m';
  const RESET_TEXT = '\x1b[0m';

  if (
    errors.invalid_type.length +
    errors.undeclared.length +
    errors.missing.length
  ) {
    const sensitive = this._sensitive;

    const fillErrorBuffer = function (errors) {
      const messages = Array<any>();
      errors.forEach((err) => {
        let err_buf = '  - ';

        /* if (err.type) {
          err_buf += '[' + err.type + '] '
        } */
        if (err.fullname) {
          err_buf += `${unroot(err.fullname)  }: `;
        }
        if (err.message) {
          err_buf += err.message;
        }

        const hidden = !!sensitive.has(`root.${  err.fullname}`);
        const value = hidden ? '[Sensitive]' : JSON.stringify(err.value);
        const getterValue = hidden
          ? '[Sensitive]'
          : JSON.stringify(err.getter && err.getter.keyname);

        if (err.value) {
          err_buf += `: value was ${  value}`;

          const getter = err.getter ? err.getter.name : false;

          if (getter) {
            err_buf += `, getter was \`${  getter}`;
            err_buf += getter !== 'value' ? `[${  getterValue  }]\`` : '`';
          }
        }

        if (!(err instanceof BLUECONFIG_ERROR)) {
          let warning = '[/!\\ this is probably blueconfig internal error]';
          console.error(err);
          if (process.stdout.isTTY) {
            warning = BOLD_YELLOW_TEXT + warning + RESET_TEXT;
          }
          err_buf += ` ${  warning}`;
        }

        messages.push(err_buf);
      });
      return messages;
    };

    const types_err_buf = fillErrorBuffer(errors.invalid_type).join('\n');
    const params_err_buf = fillErrorBuffer(errors.undeclared).join('\n');
    const missing_err_buf = fillErrorBuffer(errors.missing).join('\n');

    const output_err_bufs = [types_err_buf, missing_err_buf];

    if (options.allowed !== ALLOWED_OPTION_IGNORE) {
      if (options.allowed === ALLOWED_OPTION_WARN && params_err_buf.length) {
        let warning = 'Warning:';
        if (process.stdout.isTTY) {
          warning = BOLD_YELLOW_TEXT + warning + RESET_TEXT;
        }
        output_function(`${warning  }\n${  params_err_buf}`);
      } else if (options.allowed === ALLOWED_OPTION_STRICT) {
        output_err_bufs.push(params_err_buf);
      }
    }

    const output = output_err_bufs
      .filter((str) => str.length)
      .join('\n');

    if (output.length) {
      throw new VALIDATE_FAILED(output);
    }
  }
  return this;
};
