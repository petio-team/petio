export class ParserError extends Error {
  constructor(message: string) {
    super(message)
  }
}

// errors
export const ErrEmptyURL = new ParserError("empty url specified");
export const ErrMissingServiceIdentifier = new ParserError("must contain '://' to be valid");
export const ErrEmptyService = new ParserError("service must not be empty");
export const ErrInvalidSource = new ParserError("invalid source arguments <service>://[missing]");
export const ErrMissingParameters = new ParserError("? was specified without any arguments");
export const ErrMissingEqualsSymbol = new ParserError(`missing equals symbol for [key=value] option`);
export const ErrInvalidAutorizationSection = new ParserError("authorization section must contain a username and password seperated by a colon character");
export const ErrMissingUsernamePasswordAuth = new ParserError("username and password must not be empty when authorization is specified");
export const ErrMissingHostField = new ParserError("host must be set for connection");
export const ErrInvalidPortType = new ParserError("port must be a valid number [\d+]");
export const ErrEmptyIDField = new ParserError("id must not empty");
export const ErrEmptyTokenField = new ParserError("token must not be empty");
export const ErrInvalidOptionKey = new ParserError("invalid or empty key name for options");
export const ErrInvalidOptionValue = new ParserError("invalid or empty value for options");
export const ErrMissingHostnamePortSection = new ParserError("missing hostname and port section");
export const ErrMissingPortField = new ParserError("missing port field");
export const ErrNoSourceArguments = new ParserError("no source arguments set [host/port || id/token]");
export const ErrMultipleSourceArguments = new ParserError("both id and host source have been specified");
