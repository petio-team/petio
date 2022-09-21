import * as cvtError from './error';
import ConfigObjectModel from './model/com';
import GetterInterface from './performer/getter';
import ParserInterface from './performer/parser';
import RulerInterface from './performer/ruler';

const {CUSTOMISE_FAILED} = cvtError;

/**
 * Cutomize Blueconfig before make a ConfigObjectModel (= COM, Like DOM but not for Document, for Config)
 *
 * @example
 * const Blueconfig = require('blueconfig/lib/core.js')
 * const blueconfig = new Blueconfig()
 * console.log(blueconfig.getGettersOrder()) // === [value', 'force']
 *
 * @class
 */
const BlueconfigCore = function () {
  this.initPerformer();
};

export default BlueconfigCore;

/**
 * Create instance of worker (Parser, Getter, Ruler)
 *
 * @return   {this}
 */
BlueconfigCore.prototype.initPerformer = function () {
  this.Parser = new ParserInterface();
  this.Getter = new GetterInterface();
  this.Ruler = new RulerInterface();

  return this;
};

/**
 * Gets array with getter name in the current order of priority
 *
 * @example
 * const Blueconfig = require('blueconfig/lib/core.js')
 * const blueconfig = new Blueconfig()
 * blueconfig.init(rawSchema, options)
 *
 * @param   {string|object}   rawSchema    Schema object or a path to a schema JSON file
 * @param   {object}   [options]    Options. [See ConfigObjectModel constructor doc](./ConfigObjectModel.html)
 *
 * @return    {string[]}    Returns current getter order
 */
BlueconfigCore.prototype.init = function (rawSchema, options) {
  return new ConfigObjectModel(rawSchema, options, {
    Parser: this.Parser,
    Getter: this.Getter,
    Ruler: this.Ruler,
  });
};

/**
 * Gets array with getter name in the current order of priority
 *
 * @example
 * blueconfig.getGettersOrder() // ['default', 'value', 'env', 'arg', 'force']
 *
 * @return    {string[]}    Returns current getter order
 */
BlueconfigCore.prototype.getGettersOrder = function () {
  return [...this.Getter.storage.order];
};

/**
 * Sorts getter priority, this function uses ascending order. It is recommanded to uses this function before init COM (with `blueconfig()`)
 * or you should call `<COM>.refreshGetters()`.
 *
 * @see ConfigObjectModel.refreshGetters
 *
 * @example
 * blueconfig.getGettersOrder()
 * // ['default', 'value', 'env', 'arg', 'force']
 *
 * // two ways to do:
 * blueconfig.sortGetters(['default', 'value', 'arg', 'env', 'force'])
 * blueconfig.sortGetters(['default', 'value', 'arg', 'env']) // force is optional and must be the last one
 *
 * blueconfig.getGettersOrder()
 * // ['default', 'value', 'arg', 'env', 'force']
 *
 * @param    {string[]}    newOrder       Value of the property to validate
 *
 * @return   {this}
 */
BlueconfigCore.prototype.sortGetters = function (newOrder) {
  const sortFilter = this.Getter.sortGetters(
    this.Getter.storage.order,
    newOrder,
  );

  this.Getter.storage.order.sort(sortFilter);

  return this;
};

/**
 * Adds a new custom getter. Getter function get value depending of the property name. In schema, the property name is a keyname of the schema.
 *
 * @example
 * convict.addGetter('aws', function(aws, schema, stopPropagation) {
 *   return aws.get(aws)
 * }, false, true)
 *
 * @param {string|object}       name                      String for Getter name, `Object/Object[]` or which contains arguments:
 * @param    {string}           name.name             Getter name
 * @param    {function}         name.getter               *See below*
 * @param    {boolean}          [name.usedOnlyOnce=false] *See below*
 * @param    {boolean}          [name.rewrite=false]      *See below*
 * @param    {ConfigObjectModel.getterCallback}   getter  Getter function get external value depending of the name name.
 * @param    {boolean}          [usedOnlyOnce=false]      `false` by default. If true, The value can't be reused by another `keyname=value`
 * @param    {boolean}          [rewrite=false]           Allow rewrite an existant format
 *
 * @return   {this}
 */
BlueconfigCore.prototype.addGetter = function (
  name,
  getter,
  usedOnlyOnce,
  rewrite,
) {
  if (typeof name === 'object') {
    getter = name.getter;
    usedOnlyOnce = name.usedOnlyOnce;
    rewrite = name.rewrite;
    name = name.name || name.property;
  }
  this.Getter.add(name, getter, usedOnlyOnce, rewrite);

  return this;
};

/**
 * Adds several getters
 *
 * @example
 * // Example with the default env & arg getters:
 * Blueconfig.addGetters({
 *   env: {
 *     getter: (value, schema) => schema._cvtCoerce(this.getEnv()[value])
 *   },
 *   arg: {
 *     getter: function(value, schema, stopPropagation) {
 *       const argv = parseArgs(this.getArgs(), { configuration: { 'dot-notation': false } })
 *       return schema._cvtCoerce(argv[value])
 *     },
 *     usedOnlyOnce: true
 *   }
 * })
 *
 * @param {object|object[]}    getters                      Object containing list of Getters/Object
 * @param {object}    getters.{name}                        `name` is the getter name
 * @param {function}  getters.{name}.getter                 *See Blueconfig.addGetter*
 * @param {boolean}   [getters.{name}.usedOnlyOnce=false]   *See Blueconfig.addGetter*
 * @param {boolean}   [getters.{name}.rewrite=false]        *See Blueconfig.addGetter*
 *
 * @return   {this}
 */
BlueconfigCore.prototype.addGetters = function (getters) {
  if (Array.isArray(getters)) {
    getters.forEach((child) => {
      this.addGetter(child);
    });

    return this;
  }
  Object.keys(getters).forEach((name) => {
    const child = getters[name];
    this.addGetter(name, child.getter, child.usedOnlyOnce, child.rewrite);
  });

  return this;
};

/**
 * Adds a new custom format. Validate function and coerce function will be used to validate COM property with `format` type.
 *
 * @example
 * Blueconfig.addFormat({
 *   name: 'int',
 *   coerce: (value) => (typeof value !== 'undefined') ? parseInt(value, 10) : value,
 *   validate: function(value) {
 *     if (Number.isInteger(value)) {
 *       throw new Error('must be an integer')
 *     }
 *   }
 * })
 *
 *
 * @param {string|object}                name              String for Format name, `Object/Object[]` or which contains arguments:
 * @param    {string}                    name.name         Format name
 * @param    {function}                  name.validate     *See below*
 * @param    {function}                  name.coerce       *See below*
 * @param    {boolean}               [name.rewrite=false]  *See below*
 * @param {SchemaNode.validateCallback}  validate          Validate function, should throw if the value is wrong `Error` or [`LISTOFERRORS` (see example)](./ZCUSTOMERROR.LISTOFERRORS.html)
 * @param {SchemaNode.coerce}            coerce            Coerce function to convert a value to a specified function (can be omitted)
 * @param    {boolean}                   [rewrite=false]   Allow rewrite an existant format
 *
 * @return   {this}
 */
BlueconfigCore.prototype.addFormat = function (
  name,
  validate,
  coerce,
  rewrite,
) {
  if (typeof name === 'object') {
    validate = name.validate;
    coerce = name.coerce;
    rewrite = name.rewrite;
    name = name.name;
  }
  this.Ruler.add(name, validate, coerce, rewrite);

  return this;
};

/**
 * Adds several formats
 *
 * @example
 * // Add several formats with: [Object, Object, Object, Object]
 * const vFormat = require('blueconfig-format-with-validator')
 * blueconfig.addFormats({ // add: email, ipaddress, url, token
 *   email: vFormat.email,
 *   ipaddress: vFormat.ipaddress,
 *   url: vFormat.url,
 *   token: {
 *     validate: function(value) {
 *       if (!isToken(value)) {
 *         throw new Error(':(')
 *       }
 *     }
 *   }
 * })
 *
 * @see Blueconfig.addFormat
 *
 * @param {object|object[]}    formats               Object containing list of Object
 * @param {object}    formats.{name}                 {name} in `formats.{name}` is the format name
 * @param {function}  formats.{name}.validate        *See Blueconfig.addFormat*
 * @param {function}  formats.{name}.coerce          *See Blueconfig.addFormat*
 * @param {boolean}   [formats.{name}.rewrite=false] *See Blueconfig.addFormat*
 *
 * @return   {this}
 */
BlueconfigCore.prototype.addFormats = function (formats) {
  if (Array.isArray(formats)) {
    formats.forEach((child) => {
      this.addFormat(child);
    });

    return this;
  }
  Object.keys(formats).forEach((name) => {
    this.addFormat(
      formats[name].name,
      formats[name].validate,
      formats[name].coerce,
      formats[name].rewrite,
    );
  });

  return this;
};

/**
 * Adds new custom file parsers. JSON.parse will be used by default for unknown extension (default extension -> `*` => JSON).
 *
 * Blueconfig is able to parse files with custom file types during `merge`. For this specify the
 * corresponding parsers with the associated file extensions.
 *
 * If no supported extension is detected, `merge` will fallback to using the default json parser `JSON.parse`.
 *
 * @example
 * blueconfig.addParser([
 *  { extension: ['yml', 'yaml'], parse: yaml.safeLoad },
 *  { extension: ['yaml', 'yml'], parse: require('yaml').safeLoad },
 *  // will allow comment in json file
 *  { extension: 'json', parse: require('json5').parse } // replace `JSON` by `json5`
 * ])
 * config.merge('config.yml')
 *
 * @param    {object[]}    parsers              Parser
 * @param    {string}      parsers.extension    Parser extension
 * @param    {function}    parsers.parse        Parser function
 *
 * @return   {this}
 */
BlueconfigCore.prototype.addParser = function (parsers) {
  if (!Array.isArray(parsers)) parsers = [parsers];

  parsers.forEach((parser) => {
    if (!parser) throw new CUSTOMISE_FAILED('Invalid parser');
    if (!parser.extension)
      throw new CUSTOMISE_FAILED('Missing parser.extension');
    if (!parser.parse)
      throw new CUSTOMISE_FAILED('Missing parser.parse function');

    this.Parser.add(parser.extension, parser.parse);
  });

  return this;
};
