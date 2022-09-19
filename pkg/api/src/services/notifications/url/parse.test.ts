import assert from "assert";
import {
  ErrEmptyURL,
  ErrInvalidSource,
  ErrMissingServiceIdentifier,
} from "./errors";
import { ParseURL } from "./parse";
import { AuthConfig } from "./url";

describe('parse notification url scheme to object', () => {
  it('should return a valid source and value field', () => {
    const expectedValue: AuthConfig = {
      service: 'discord',
      arguments: {
        source: '844625510511411242',
        value: 'A1I_5JQQYBDlTMWdEOOCnc2peu6V7rgb6UytZK6avP1302ovkQ9J8LaMJY1bqgU73GQH'
      },
      options: {},
      isPath: true,
    };

    const toParse = ParseURL("discord://844625510511411242/A1I_5JQQYBDlTMWdEOOCnc2peu6V7rgb6UytZK6avP1302ovkQ9J8LaMJY1bqgU73GQH");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should return a valid source and value field with options', () => {
    const expectedValue: AuthConfig = {
      service: "telegram",
      arguments: {
        source: '1622956969',
        value: '270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0',
      },
      options: {
        silent: "true",
      },
      isPath: true,
    };
    const toParse = ParseURL("telegram://1622956969/270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0?silent=true");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should return a valid source, value and extra fields', () => {
    const expectedValue: AuthConfig = {
      service: "telegram",
      arguments: {
        source: '1622956969',
        value: '270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0',
        extra: '#channel'
      },
      options: {},
      isPath: true,
    };
    const toParse = ParseURL("telegram://1622956969/270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0/#channel");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should return a valid source, value and extra field with options', () => {
    const expectedValue: AuthConfig = {
      service: "telegram",
      arguments: {
        source: '1622956969',
        value: '270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0',
        extra: '#channel'
      },
      options: {
        silent: "true",
      },
      isPath: true,
    };
    const toParse = ParseURL("telegram://1622956969/270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0/#channel?silent=true");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should return a valid source and value field', () => {
    const expectedValue: AuthConfig = {
      service: "email",
      arguments: {
        source: "localhost",
        value: "21",
      },
      options: {},
      isPath: false,
    };
    const toParse = ParseURL("email://localhost:21");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should return a valid source, value, identifier and secret fields', () => {
    const expectedValue: AuthConfig = {
      service: "email",
      arguments: {
        source: "localhost",
        value: "21",
        identifier: "user",
        secret: "12345678",
      },
      options: {},
      isPath: false,
    };
    const toParse = ParseURL("email://user:12345678@localhost:21");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should return a valid source, value, identifier and secret fields with options', () => {
    const expectedValue: AuthConfig = {
      service: "email",
      arguments: {
        source: "localhost",
        value: "21",
        identifier: "user",
        secret: "12345678",
      },
      options: {
        tls: "true",
        extra: "false",
      },
      isPath: false,
    };
    const toParse = ParseURL("email://user:12345678@localhost:21?tls=true&extra=false");
    assert.deepStrictEqual(toParse, expectedValue);
  });

  it('should fail due to invalid format', () => {
    assert.throws(() => ParseURL(""), ErrEmptyURL);
    assert.throws(() => ParseURL("error"), ErrMissingServiceIdentifier);
    assert.throws(() => ParseURL("error://"), ErrInvalidSource);
  });
});
