import fs from "fs/promises";
import path from "path";

import { dataFolder } from "@/config/env";
import { config } from "@/config/schema";
import logger from "@/loaders/logger";

/**
 * The name of the config file to use
 */
const PETIO_CONFIG_FILE = "petio.json";

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
const loadAndValidateConfig = async (path: string): Promise<void> => {
  const stat = await fileExists(path);
  if (stat) {
    config.loadFile(path).validate();
  }
};

/**
 * Load the config file if it exists
 * @returns true if the config was loaded and false if not
 */
export const LoadConfig = async (): Promise<boolean> => {
  try {
    await loadAndValidateConfig(getConfigPath());
    return true;
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
 * Attempts to write the config data to the config file
 * @returns true if the config was written and false if it failed
 */
export const WriteConfig = async (): Promise<boolean> => {
  try {
    const data = JSON.stringify(config.getProperties(), null, 4);
    await fs.writeFile(getConfigPath(), data);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

const fileExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(path);
    return stats.isFile();
  } catch (_error) {
    return false;
  }
};
