import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { DownloaderLanguage, DownloaderMediaType, DownloaderPath, DownloaderProfile, DownloaderType } from "./dto";

export class DownloaderSchema extends BaseSchema {
  @prop()
  name: string;

  @prop()
  type: DownloaderType;

  @prop()
  url: string;

  @prop()
  token: string;

  @prop()
  path: DownloaderPath;

  @prop()
  profile: DownloaderProfile;

  @prop()
  language: DownloaderLanguage;

  @prop()
  media_type: DownloaderMediaType;

  @prop()
  enabled: boolean;
}
