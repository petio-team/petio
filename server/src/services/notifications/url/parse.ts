import {
  ErrEmptyService,
  ErrEmptyURL,
  ErrInvalidOptionKey,
  ErrInvalidOptionValue,
  ErrInvalidSource,
  ErrMissingParameters,
  ErrMissingServiceIdentifier,
  ErrMissingUsernamePasswordAuth
} from "./errors";
import { AuthConfig } from "./url";

export function ParseURL(url: string): AuthConfig {
  const scheme: AuthConfig = {
      service: "",
      arguments: {},
      options: {},
      isPath: true,
  };

  // NotificationService
  // <service>://<source>/<value>/<extra>?<options>
  // <service>://<identifier>:<secret>@<source>:<value>?<options>
  // options: <key=value>[&?]
  if (!url.length) {
    throw ErrEmptyURL;
  }

  if (url.lastIndexOf("://") === -1) {
    throw ErrMissingServiceIdentifier;
  }

  const [service, str] = url.split("://");
  if (!service.length) {
    throw ErrEmptyService;
  }
  scheme.service = service;

  if (!str.length) {
    throw ErrInvalidSource;
  }

  let path = str;
  // check for params
  if (url.lastIndexOf("?") !== -1) {
      let params = "";
      [path, params] = str.split("?");
      if (!params.length) {
        throw ErrMissingParameters;
      }

      const options = params.split("&");
      for (const param of options) {
          let key = param;
          if (param.lastIndexOf("=") === -1) {
            scheme.options[key] = "";
            continue;
          }

          let value = "";
          [key, value] = param.split("=");
          if (key === "") {
            throw ErrInvalidOptionKey;
          }

          if (value === "") {
            throw ErrInvalidOptionValue;
          }
          scheme.options[key] = value;
      }
  }

  let source = path;

  // Has auth section
  if (source.lastIndexOf("@") !== -1) {
    const [auth, src] = source.split("@");
    if (auth !== "") {
      const [identifier, secret] = auth.split(":");
      if (identifier === "" && secret === "") {
        throw ErrMissingUsernamePasswordAuth;
      }
      if (identifier !== "") {
        scheme.arguments.identifier = identifier;
      }
      if (secret !== "") {
        scheme.arguments.secret = secret;
      }
    }

    source = src;
  }

  // path section
  if (source.lastIndexOf("/") !== -1) {
    const [src, value, extra] = source.split("/");
    if (value != undefined && value !== "") {
      scheme.arguments.value = value;
    }
    if (extra != undefined && extra !== "") {
      scheme.arguments.extra = extra;
    }
    source = src;
  } else if (source.lastIndexOf(":") !== -1) {
    scheme.isPath = false;
    const [src, value] = source.split(":");
    if (value !== "") {
      scheme.arguments.value = value;
    }
    source = src;
  }

  scheme.arguments.source = source;

  return scheme;
}
