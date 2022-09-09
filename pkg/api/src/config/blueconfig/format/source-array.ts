import Blueconfig from '..';
import { LISTOFERRORS } from '../error';

export default {
  name: 'source-array',
  validate: function (children, schema, fullname) {
    const errors = Array<any>();

    if (!Array.isArray(children)) {
      throw new Error('must be an Array');
    }

    children.forEach((_child, keyname) => {
      try {
        const conf = Blueconfig(schema.children)
          .merge(children[keyname])
          .validate();
        this.set(fullname + '.' + keyname, conf.getProperties());
      } catch (err) {
        err.parent = fullname + '.' + keyname;
        errors.push(err);
      }
    });

    if (errors.length !== 0) {
      throw new LISTOFERRORS(errors);
    }
  },
};
