const regex = {
  "'": /\\\'/g,
  '"': /\\\"/g,
};
export function parse(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('ObjectPath.parse must be passed a string');
  }

  var i = 0;
  var parts = Array<any>();
  var dot, bracket, quote, closing;
  while (i < str.length) {
    dot = str.indexOf('.', i);
    bracket = str.indexOf('[', i);

    // we've reached the end
    if (dot === -1 && bracket === -1) {
      parts.push(str.slice(i, str.length));
      i = str.length;
    }
    // dots
    else if (bracket === -1 || (dot !== -1 && dot < bracket)) {
      parts.push(str.slice(i, dot));
      i = dot + 1;
    }
    // brackets
    else {
      if (bracket > i) {
        parts.push(str.slice(i, bracket));
        i = bracket;
      }
      quote = str.slice(bracket + 1, bracket + 2);

      if (quote !== '"' && quote !== "'") {
        closing = str.indexOf(']', bracket);
        if (closing === -1) {
          closing = str.length;
        }
        parts.push(str.slice(i + 1, closing));
        i =
          str.slice(closing + 1, closing + 2) === '.'
            ? closing + 2
            : closing + 1;
      } else {
        closing = str.indexOf(quote + ']', bracket);
        if (closing === -1) {
          closing = str.length;
        }
        while (
          str.slice(closing - 1, closing) === '\\' &&
          bracket < str.length
        ) {
          bracket++;
          closing = str.indexOf(quote + ']', bracket);
        }
        parts.push(
          str
            .slice(i + 2, closing)
            .replace(regex[quote], quote)
            .replace(/\\+/g, function (backslash) {
              return new Array(Math.ceil(backslash.length / 2) + 1).join('\\');
            }),
        );
        i =
          str.slice(closing + 2, closing + 3) === '.'
            ? closing + 3
            : closing + 2;
      }
    }
  }
  return parts;
}

export function stringify(arr: any[], quote?: string, forceQuote?: any) {
  if (!Array.isArray(arr)) arr = [arr];

  quote = quote === '"' ? '"' : "'";
  var regexp = new RegExp('(\\\\|' + quote + ')', 'g'); // regex => /(\\|')/g

  return arr
    .map(function (value, key) {
      let property = value.toString();
      if (!forceQuote && /^[A-z_]\w*$/.exec(property)) {
        // str with only A-z0-9_ chars will display `foo.bar`
        return key !== 0 ? '.' + property : property;
      } else if (!forceQuote && /^\d+$/.exec(property)) {
        // str with only numbers will display `foo[0]`
        return '[' + property + ']';
      } else {
        property = property.replace(regexp, '\\$1');
        return '[' + quote + property + quote + ']';
      }
    })
    .join('');
}

export function normalise(data, quote, forceQuote) {
  return stringify(Array.isArray(data) ? data : parse(data), quote, forceQuote);
}
