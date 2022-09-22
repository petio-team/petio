import { Settings } from "./dto";

export default interface ISettingsRepository {
  Get(): Promise<Settings>;
  Upsert(settings: Settings): Promise<Settings>;
}
