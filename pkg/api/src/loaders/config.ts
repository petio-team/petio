import { LoadConfig } from "@/config/index";
import { migrateConfigs } from "@/config/migration";

export default async (): Promise<boolean> => {
  let exists = await LoadConfig();

  if (!exists) {
    // check for old config files
    await migrateConfigs();

    // reload config
    exists = await LoadConfig();
  }

  return exists;
};
