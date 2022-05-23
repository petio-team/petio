import * as cvtError from "./../error";
const CUSTOMISE_FAILED = cvtError.CUSTOMISE_FAILED;

/**
 * Load and parse file with parser
 *
 * @private
 * @class
 */
function Parser() {
  this.engines = {
    "*": JSON.parse,
  };
}

export default Parser;

/**
 * Parses data with stored engine
 */
Parser.prototype.parse = function (extension, data) {
  const parser = this.engines[extension] || this.engines["*"];

  return parser(data);
};

/**
 * Adds new custom file parsers
 */
Parser.prototype.add = function (extension, parse) {
  if (typeof parse !== "function")
    throw new CUSTOMISE_FAILED("Invalid parser.parse function");

  const extensions = !Array.isArray(extension) ? [extension] : extension;
  extensions.forEach((extension) => {
    if (typeof extension !== "string")
      throw new CUSTOMISE_FAILED("Invalid parser.extension");
    this.engines[extension] = parse;
  });
};
