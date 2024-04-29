import path from 'path';

import configSchema from '@/config/schema';
import { DATA_DIR } from '@/infra/config/env';
import logger from '@/infra/logger/logger';
import { fileExists, writeFile } from '@/utils/file';

/**
 * The name of the config file to use
 */
const PETIO_CONFIG_FILE = 'petio.json';

/**
 * Gets the path of the config file
 * @returns the path of the config file
 */
export const getConfigPath = (): string =>
  path.join(DATA_DIR, PETIO_CONFIG_FILE);

/**
 * Attempts to write the config data to the config file
 * @returns true if the config was written and false if it failed
 */
export const WriteConfig = async (): Promise<Object | null> => {
  try {
    const properties = configSchema.getProperties();
    const data = JSON.stringify(properties, null, 2);
    await writeFile(getConfigPath(), data);
    return properties;
  } catch (error) {
    logger.error('failed to write config file', error);
    return null;
  }
};

/**
 * Attempts to load the config file and validate it
 * @param path the path to the file to load
 * @returns void
 */
const loadAndValidateConfig = async (file: string): Promise<boolean> => {
  const stat = await fileExists(file);
  if (stat) {
    configSchema.loadFile(file).validate();
    // We call this here to make sure we write new values to config
    await WriteConfig();
    return true;
  }
  return false;
};

/**
 * Load the config file if it exists
 * @returns true if the config was loaded and false if not
 */
export const LoadConfig = async (): Promise<boolean> => {
  try {
    return await loadAndValidateConfig(getConfigPath());
  } catch (error) {
    logger.error(error);
    return false;
  }
};

/**
 * Checks if the config has been loaded
 * @returns true if config had been loaded else false
 */
export const HasConfig = async (): Promise<boolean> =>
  fileExists(getConfigPath());

/**
 * Get the properties of the config
 * @returns an object of config properties
 */
export const toObject = (): Object => configSchema.getProperties();
