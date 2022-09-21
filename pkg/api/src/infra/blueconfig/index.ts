import parseArgs from 'yargs-parser';

import Core from './core';

/**
 * Static version of BlueConfigCore, with standard getters/formats:
 *
 * ```js
 * Blueconfig.addGetter('default', (value, schema, stopPropagation) => schema._cvtCoerce(value))
 * Blueconfig.sortGetters(['default', 'value']) // set default before value
 * Blueconfig.addGetter('env', function(value, schema, stopPropagation) {
 *   return schema._cvtCoerce(this.getEnv()[value])
 * })
 * Blueconfig.addGetter('arg', function(value, schema, stopPropagation) {
 *   const argv = parseArgs(this.getArgs(), {
 *     configuration: {
 *       'dot-notation': false
 *     }
 *   })
 *   return schema._cvtCoerce(argv[value])
 * }, true)
 *
 * Blueconfig.addFormats(require('./format/standard-formats.js'))
 * ```
 *
 * @example
 * const schema = { port: { default: 80, format: 'port' } }
 * const conf = blueconfig(schema);
 *
 * @class
 */
const Blueconfig = function (rawSchema, options?) {
  return Blueconfig.init(rawSchema, options);
};

/* >> HACK TO KEEP THE SAME BEHAVIOR (= STATIC OBJECT like convict) AND PREVENT BREAK CHANGE FOR v6.1.0 */
/* SORRY IF YOU HAVE HEART ATTACK WHILE YOU READING THIS LINE ;-) I had no choice in writing this… */
Core.prototype.initPerformer.call(Blueconfig);

Blueconfig.init = Core.prototype.init;
Blueconfig.getGettersOrder = Core.prototype.getGettersOrder;
Blueconfig.sortGetters = Core.prototype.sortGetters;
Blueconfig.addGetter = Core.prototype.addGetter;
Blueconfig.addGetters = Core.prototype.addGetters;
Blueconfig.addFormat = Core.prototype.addFormat;
Blueconfig.addFormats = Core.prototype.addFormats;
Blueconfig.addParser = Core.prototype.addParser;
/* << */

/* >> default getters & standard formats */
// Add getters
Blueconfig.addGetter('default', (value, schema, stopPropagation) =>
  schema._cvtCoerce(value),
);
Blueconfig.sortGetters(['default', 'value']); // set default before value
Blueconfig.addGetter('env', function (value, schema, stopPropagation) {
  return schema._cvtCoerce(this.getEnv()[value]);
});
Blueconfig.addGetter(
  'arg',
  function (value, schema, stopPropagation) {
    const argv = parseArgs(this.getArgs(), {
      configuration: {
        'dot-notation': false,
      },
    });
    return schema._cvtCoerce(argv[value]);
  },
  true,
);

// Add formats
Blueconfig.addFormats(require('./format/standard-formats'));
Blueconfig.addFormats(require('./format/validator'));
/* << */

export default Blueconfig;
