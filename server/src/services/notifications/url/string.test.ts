import assert from 'assert';

import { ToURL } from './string';
import { AuthConfig } from './url';

describe('stringify notification url scheme object', () => {
  it('should return a url string from an source and value field', () => {
    const source: AuthConfig = {
      service: 'discord',
      arguments: {
        source: '844625510511411242',
        value:
          'A1I_5JQQYBDlTMWdEOOCnc2peu6V7rgb6UytZK6avP1302ovkQ9J8LaMJY1bqgU73GQH',
      },
      options: {},
      isPath: true,
    };
    assert.equal(
      ToURL(source),
      'discord://844625510511411242/A1I_5JQQYBDlTMWdEOOCnc2peu6V7rgb6UytZK6avP1302ovkQ9J8LaMJY1bqgU73GQH',
    );
  });

  it('should return a url string from an source and value field with options', () => {
    const source: AuthConfig = {
      service: 'telegram',
      arguments: {
        source: '1622956969',
        value: '270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0',
      },
      options: {
        silent: 'true',
      },
      isPath: true,
    };
    assert.equal(
      ToURL(source),
      'telegram://1622956969/270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0?silent=true',
    );
  });

  it('should return a url string from an source, value and extra field', () => {
    const source: AuthConfig = {
      service: 'telegram',
      arguments: {
        source: '1622956969',
        value: '270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0',
        extra: '#channel',
      },
      options: {},
      isPath: true,
    };
    assert.equal(
      ToURL(source),
      'telegram://1622956969/270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0/#channel',
    );
  });

  it('should return a url string from an source, value and extra field with options', () => {
    const source: AuthConfig = {
      service: 'telegram',
      arguments: {
        source: '1622956969',
        value: '270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0',
        extra: '#channel',
      },
      options: {
        silent: 'true',
      },
      isPath: true,
    };
    assert.equal(
      ToURL(source),
      'telegram://1622956969/270485614:AAHfiqksKZ8WmR2zSjiQ7_v4TMAKdiHm9T0/#channel?silent=true',
    );
  });

  it('should return a url string from an source, value, identifier and secret fields', () => {
    const source: AuthConfig = {
      service: 'email',
      arguments: {
        source: 'localhost',
        value: '21',
        identifier: 'user',
        secret: '12345678',
      },
      options: {},
      isPath: false,
    };
    assert.equal(ToURL(source), 'email://user:12345678@localhost:21');
  });

  it('should return a url string from an source, value, identifier and secret field with options', () => {
    const source: AuthConfig = {
      service: 'email',
      arguments: {
        source: 'localhost',
        value: '21',
        identifier: 'user',
        secret: '12345678',
      },
      options: {
        tls: 'true',
        extra: 'false',
      },
      isPath: false,
    };
    assert.equal(
      ToURL(source),
      'email://user:12345678@localhost:21?tls=true&extra=false',
    );
  });
});
