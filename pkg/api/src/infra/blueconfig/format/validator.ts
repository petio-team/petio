/**
 * blueconfig-format-with-validator
 * Format 'email', 'ipaddress' and 'url' for blueconfig
 */
import isEmail from 'validator/lib/isEmail';
import isIP from 'validator/lib/isIP';
import isURL from 'validator/lib/isURL';

function assert(assertion, err_msg) {
  if (!assertion) {
    throw new Error(err_msg);
  }
}

const email = {
  name: 'email',
  validate (x) {
    assert(isEmail(x), 'must be an email address');
  },
};

const ipaddress = {
  name: 'ipaddress',
  validate (x) {
    assert(isIP(x), 'must be an IP address');
  },
};

const url = {
  name: 'url',
  validate (x) {
    assert(isURL(x, { require_tld: false }), 'must be a URL');
  },
};

export { email, ipaddress, url };
