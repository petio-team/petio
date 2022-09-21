import { prop, Ref, SubDocumentType } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { MediaServer } from "../mediaserver/dto";
import { MediaServerSchema } from "../mediaserver/schema";

export class ProfileSchema extends BaseSchema {
  @prop()
  name: string;

  @prop({ ref: () => MediaServerSchema })
  mediaservers: Ref<MediaServer>[];

  @prop({ type: () => ProfileApproveSchema })
  autoApprove: SubDocumentType<ProfileApproveSchema>;

  @prop()
  default: boolean;
}

export class ProfileApproveSchema {
  @prop()
  tv: boolean;

  @prop()
  movie: boolean;
}
