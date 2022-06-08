import * as cvtError from './../error';

const CUSTOMISE_FAILED = cvtError.CUSTOMISE_FAILED;

/**
 * Validate config with format
 *
 * @private
 * @class
 */
function Ruler() {
  this.types = new Map();
  this.types.set('*', () => {});
  this.coerces = new Map();
}

export default Ruler;

/**
 * Adds a new custom format.
 */
Ruler.prototype.add = function (name, validate, coerce, rewrite) {
  if (typeof name !== 'string') {
    throw new CUSTOMISE_FAILED(
      'Schema name must be a string (current: "' + typeof name + '").',
    );
  }
  if (typeof validate !== 'function') {
    throw new CUSTOMISE_FAILED(
      'Validation function for "' + name + '" must be a function.',
    );
  }
  if (coerce && typeof coerce !== 'function') {
    throw new CUSTOMISE_FAILED(
      'Coerce function for "' + name + '" must be a function.',
    );
  }

  if (this.types.has(name) && !rewrite) {
    const advice =
      ' Set the 4th argument (rewrite) of `addFormat` at true to skip this error.';
    throw new CUSTOMISE_FAILED(
      'Format name "' + name + '" is already registered.' + advice,
    );
  }

  this.types.set(name, validate);
  if (coerce) this.coerces.set(name, coerce);
};

/**
 * Returns coerce method
 *
 * @Returns {Function} Coerce method
 */
Ruler.prototype.getCoerceMethod = function (format) {
  const isStr = (value) => typeof value === 'string';

  if (this.coerces.has(format)) {
    return this.coerces.get(format);
  }
  switch (format) {
    case 'Number':
      return (v) => (isStr(v) ? parseFloat(v) : v);
    case 'Boolean':
      return (v) => (isStr(v) ? String(v).toLowerCase() !== 'false' : v);
    case 'Array':
      return (v) => (isStr(v) ? v.split(',') : v);
    case 'Object':
      return (v) => (isStr(v) ? JSON.parse(v) : v);
    case 'RegExp':
      return (v) => (isStr(v) ? new RegExp(v) : v);
    default:
    // for eslint "Expected a default case"
  }

  return (v) => v;
};
