import { ErrEmptyService, ErrNoSourceArguments } from "./errors";
import { AuthConfig } from "./url";

export function ToURL(scheme: AuthConfig): string {
  let output = "";

  if (scheme.service === "") {
    throw ErrEmptyService;
  }
  output += `${scheme.service}://`;

  if (!(scheme.arguments.source)) {
    throw ErrNoSourceArguments;
  }

  if (!scheme.isPath) {
    if (scheme.arguments.identifier) {
      output += scheme.arguments.identifier;
    }
    if (scheme.arguments.secret) {
      output += `:${  scheme.arguments.secret}`;
    }

    if (scheme.arguments.identifier !== "" || scheme.arguments.secret !== "") {
      output += `@`;
    }
  }

  // add id to string
  output += scheme.arguments.source;

  const seperator = scheme.isPath ? '/' : ':';
  if (scheme.arguments.value !== "") {
    output += seperator + scheme.arguments.value;
  }

  if (scheme.isPath
    && scheme.arguments.extra != undefined
    && scheme.arguments.extra !== "") {
    output += `/${  scheme.arguments.extra}`;
  }

  // parameters
  const params = Object.keys(scheme.options).reduce((a, b, i) => `${a}${i ? '&' : ''}${b}=${scheme.options[b]}`,'')
  if (params.length) {
    output += `?${params}`;
  }

  return output;
}
