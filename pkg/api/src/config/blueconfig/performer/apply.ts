import { cloneDeep } from 'lodash';

import * as utils from './utils/utils';

const {isObjNotNull} = utils;

/**
 * Apply values/getters on COM
 *
 * @private
 * @class
 */
function Apply() {}

export default new Apply();

/**
 * Apply getters values
 */
Apply.prototype.getters = function applyGetters(schema, node) {
  Object.keys(schema._cvtProperties).forEach((name) => {
    const mySchema = schema._cvtProperties[name];
    if (mySchema._cvtProperties) {
      if (!node[name]) {
        node[name] = {};
      }
      applyGetters.call(this, mySchema, node[name]);
    } else {
      const currentOrigin = mySchema.getOrigin();
      const currentLevel = currentOrigin
        ? this._getters.order.indexOf(currentOrigin)
        : 0;

      for (let i = this._getters.order.length - 1; i >= 0; i--) {
        if (i < currentLevel) {
          break; // stop if the current getter is higher
        }

        const getterName = this._getters.order[i]; // getterName
        const getterObj = this._getters.list[getterName];
        let propagationAsked = false; // #224 accept undefined

        if (!getterObj || !(getterName in mySchema.attributes)) {
          continue;
        }
        const {getter} = getterObj;
        const value = cloneDeep(mySchema.attributes[getterName]);
        const stopPropagation = () => {
          propagationAsked = true;
        };

        /**
         * Will get an external value depending of custom getter/code
         *
         * @callback ConfigObjectModel.getterCallback
         *
         * @example
         * blueconfig.addGetter({
         *   property: 'accept-undefined',
         *   getter: (value, schema, stopPropagation) => schema._cvtCoerce(fs.readFileSync(value, 'utf-8').toString()),
         *   usedOnlyOnce: true // use file only once
         * });
         *
         * @param    {*}           value       Value to coerce
         * @param    {string}      mySchema    Value to coerce
         * @param    {function}    value       Stop propagation (accept undefined value). By default,
         *                                     undefined don't stop the getter queue, this mean Blueconfig
         *                                     will continue to call other getter to find a value not undefined.
         *
         * @returns  {*}    value    Returns coerced value
         */
        // call getter                        vvvvvvvvvvvvvvvvvvv Support prevent breakchanges
        node[name] = getter.call(
          this,
          value,
          mySchema.attributes,
          stopPropagation,
        );

        if (typeof node[name] !== 'undefined' || propagationAsked) {
          // We use function because function are not saved/exported in schema
          mySchema._private.origin = getterName;
          break;
        }
      }
    }
  });
};

/**
 * Apply values from config merged
 */
Apply.prototype.values = function applyValues(from, to, schema) {
  const indexVal = this._getters.order.indexOf('value');
  Object.keys(from).forEach((name) => {
    const mySchema =
      schema && schema._cvtProperties ? schema._cvtProperties[name] : null;
    // leaf
    if (
      Array.isArray(from[name]) ||
      !isObjNotNull(from[name]) ||
      !schema ||
      schema.format === 'object'
    ) {
      const lastG = mySchema && mySchema.getOrigin && mySchema.getOrigin();

      if (lastG && indexVal < this._getters.order.indexOf(lastG)) {
        return;
      }

      to[name] =
        mySchema && mySchema.coerce ? mySchema.coerce(from[name]) : from[name];
      if (lastG) {
        mySchema._private.origin = 'value';
      }
    } else {
      if (!isObjNotNull(to[name])) to[name] = {};
      applyValues.call(this, from[name], to[name], mySchema);
    }
  });
};
