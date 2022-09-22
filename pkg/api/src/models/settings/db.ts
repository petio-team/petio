import { getModelForClass } from "@typegoose/typegoose";
import { defaultSettingsId, MakeSettings, Settings } from "./dto";
import ISettingsRepository from "./repository";
import SettingsSchema from "./schema";

export default class SettingsDB implements ISettingsRepository {
  private model = getModelForClass(SettingsSchema);

  async Get(): Promise<Settings> {
    const result = await this.model.findOne({ id: defaultSettingsId }).exec();
    if (!result) {
      return MakeSettings();
    }

    return result.toObject();
  }

  async Upsert(settings: Settings): Promise<Settings> {
    const result = await this.model.findOneAndUpdate(
      {
        id: defaultSettingsId,
      },
      settings,
      {
        upsert: true,
      }
    ).exec();
    if (!result) {
      return settings;
    }

    return result.toObject();
  }
}
