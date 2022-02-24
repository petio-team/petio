import fs from 'fs';

import { dataFolder } from '../app/env';

export default () => {
    try {
        fs.accessSync(dataFolder, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        throw new Error("data folder is not readable and writable");
    }
};