import * as cvtError from "../error";
import * as utils from "../performer/utils/utils";

const {unroot} = utils;

const {LISTOFERRORS} = cvtError;
const {FORMAT_INVALID} = cvtError;

/**
 * SchemaNode is rules for property
 *
 * @class
 */
function SchemaNode(rawSchema) {
  const schema = { ...rawSchema };

  this._private = {
    origin: undefined,
    validate: () => {},
    coerce: (v) => v,
  };

  /**
   * Is the public object given in the second argument of [validateCallback](./SchemaNode.html#.validateCallback)
   *
   * @memberOf SchemaNode
   * @type {SchemaNode.schema}
   */
  this.attributes = schema;

  /**
   * Is the public object given in the second argument of [validateCallback](./SchemaNode.html#.validateCallback)
   *
   * @name schema
   * @memberOf SchemaNode
   * @type {SchemaNode.schema}
   *
   * @class
   */

  /**
   * Attributes are: schema.default, schema.format, schema.doc, schema.env, schema.arg...
   *
   * @name {attributes}
   * @memberOf SchemaNode.schema
   *
   * @instance
   */
  // this.attributes.schema

  /**
   * Gets origin
   *
   * @name _cvtGetOrigin
   * @memberOf SchemaNode.schema
   *
   * @instance
   * @see SchemaNode.getOrigin
   *
   * @returns  {string}    value    Getter name which origin of the value
   */
  Object.defineProperty(this.attributes, '_cvtGetOrigin', {
    value: () => this.getOrigin(),
  });

  /**
   * Validates config property
   *
   * @name _cvtValidateFormat
   * @memberOf SchemaNode.schema
   *
   * @see SchemaNode.validate
   *
   * @param    {*}             value       Value of the property to validate
   */
  Object.defineProperty(this.attributes, '_cvtValidateFormat', {
    value: (value) => {
      this.validate(value);
    },
  });

  /**
   * Coerces config property
   *
   * @name _cvtCoerce
   * @memberOf SchemaNode.schema
   *
   * @instance
   * @see SchemaNode.coerce
   *
   * @param    {*}    value    Value to coerce
   *
   * @returns  {*}    value    Returns coerced value
   *
   */
  Object.defineProperty(this.attributes, '_cvtCoerce', {
    value: (value) => this.coerce(value),
  });
}

export default SchemaNode;

/**
 * Validates value, will call [validateCallback](./SchemaNode.html#.validateCallback)
 *
 * @param    {*}             value       Value of the property to validate
 */
SchemaNode.prototype.validate = function (value) {
  const schema = this.attributes;
  const fullpath = unroot(this._private.fullpath);
  try {
    /**
     * Validates function, should throw when value is not valid. Throws [LISTOFERRORS](./ZCUSTOMERROR.LISTOFERRORS.html)
     * if you have several error (see [LISTOFERRORS](./ZCUSTOMERROR.LISTOFERRORS.html) example)
     *
     * Validate functions are declared with `addFormat`, and corresponding to `format` property.
     *
     * @callback SchemaNode.validateCallback
     *
     * @example
     * Blueconfig.addFormat({
     *   name: 'int',
     *   coerce: (value) => (typeof value !== 'undefined') ? parseInt(value, 10) : value,
     *   validate: function(value, schema, fullpath) {
     *     if (Number.isInteger(value)) {
     *       throw new Error('must be an integer')
     *     }
     *   }
     * })
     *
     *
     * @param    {*}             value       Value of the property to validate
     * @param    {schemaNode}    schema      schemaNode (= rules) of the property
     * @param    {string}        fullpath    Full property path
     *
     * @throws {Error}                       Throw [Error()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error), `Error`s are transformed to `FORMAT_INVALID`.
     * @throws {ZCUSTOMERROR.LISTOFERRORS}   Throw [LISTOFERRORS()](./ZCUSTOMERROR.LISTOFERRORS.html) usefull if you validate a children key.
     *
     * @this {ConfigObjectModel}
     *
     * @see ZCUSTOMERROR.LISTOFERRORS
     */
    this._private.validate(value, schema, fullpath);
  } catch (err) {
    if (err instanceof LISTOFERRORS) {
      err.message = `${fullpath || 'root'}: Custom format "${
        schema.format
      }" tried to validate something and failed:`;

      err.errors.forEach((error, i) => {
        err.message +=
          `\n    ${i + 1}) ${unroot(error.parent)}:${ 
          (`\n${  error.why}`).replace(/(\n)/g, '$1    ')}`;
      });

      throw err;
    } else {
      // Origin of the value, is getter {name}.
      const name = this._private.origin;
      const keyname = schema[this._private.origin] ? schema[name] : '';
      const getter = { name, keyname };

      throw new FORMAT_INVALID(fullpath, err.message, getter, value);
    }
  }
};

/**
 * Converts a value to a specified function. Coerce functions are declared with `addFormat`, and corresponding to `format` property.
 *
 * @example
 * Blueconfig.addFormat({
 *   name: 'int',
 *   coerce: (value) => (typeof value !== 'undefined') ? parseInt(value, 10) : value,
 *   validate: function(value) {
 *     assert(Number.isInteger(value), 'must be an integer')
 *   }
 * })
 *
 * @param    {*}    value    Value to coerce
 *
 * @returns  {*}    value    Returns coerced value
 *
 * @memberof SchemaNode
 */
SchemaNode.prototype.coerce = function (value) {
  return this._private.coerce(value);
};

/**
 * Returns the name of the getter which gets the current value.
 *
 * @memberof SchemaNode
 *
 * @returns  {string}    value    Getter name which origin of the value
 */
SchemaNode.prototype.getOrigin = function () {
  return this._private.origin;
};
