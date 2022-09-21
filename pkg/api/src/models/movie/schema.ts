import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { MovieDetails, MovieGuid, MovieMedia } from "./dto";

export class MovieSchema extends BaseSchema {
  @prop({ required: true })
  guids: MovieGuid;

  @prop({ required: true })
  details: MovieDetails;

  @prop({ required: true })
  media: MovieMedia;
}
