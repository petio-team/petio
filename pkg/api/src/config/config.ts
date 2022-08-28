import fs from 'fs/promises';
import path from 'path';
import { container } from 'tsyringe';

import { dataFolder } from '@/config/env';
import { config } from '@/config/schema';
import { IPC } from '@/infra/clusters/ipc';
import logger from '@/loaders/logger';
import { fileExists } from '@/utils/file';

/**
 * The name of the config file to use
 */
const PETIO_CONFIG_FILE = 'petio.json';

/**
 * Gets the path of the config file
 * @returns the path of the config file
 */
export const getConfigPath = (): string => {
  return path.join(dataFolder, PETIO_CONFIG_FILE);
};

/**
 * Attempts to load the config file and validate it
 * @param path the path to the file to load
 * @returns void
 */
const loadAndValidateConfig = async (file: string): Promise<boolean> => {
  const stat = await fileExists(file);
  if (stat) {
    config.loadFile(file).validate();
    // We call this here to make sure we write new values to config
    WriteConfig(false);
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
    return loadAndValidateConfig(getConfigPath());
  } catch (error) {
    logger.error(error);
    return false;
  }
};

/**
 * Checks if the config has been loaded
 * @returns true if config had been loaded else false
 */
export const HasConfig = async (): Promise<boolean> => {
  return fileExists(getConfigPath());
};

/**
 * Get the properties of the config
 * @returns an object of config properties
 */
export const toObject = (): Object => {
  return config.getProperties();
};

/**
 * Attempts to write the config data to the config file
 * @returns true if the config was written and false if it failed
 */
export const WriteConfig = async (
  updateClusters: boolean = true,
): Promise<boolean> => {
  try {
    const properties = config.getProperties();
    const data = JSON.stringify(properties, null, 2);
    await fs.writeFile(getConfigPath(), data);

    if (updateClusters) {
      // update other clusters with new config changes
      container
        .resolve(IPC)
        .messageSiblings({ action: 'onConfigUpdate', data: properties });
    }

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};
