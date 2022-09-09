import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { Downloader } from "../downloader/dto";
import { User } from "../user/dto";

export class IssueSchema extends BaseSchema {
  @prop()
  tmdb_id: string;

  @prop()
  type: string;

  @prop()
  user: User;

  @prop()
  downloaders: Downloader[];

  @prop()
  issue: string;

  @prop()
  comment: string;
}
