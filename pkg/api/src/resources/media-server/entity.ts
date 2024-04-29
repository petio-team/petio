import { BaseEntity } from "@/infra/entity/entity";
import { nanoid } from 'napi-nanoid';
import { CreateMediaServerProps, MediaServerProps } from "./types";

export class MediaServerEntity extends BaseEntity<MediaServerProps> {
  /**
   * Creates a new MediaServerEntity based on the provided properties.
   * @param create - The properties used to create the MediaServerEntity.
   * @returns A new instance of MediaServerEntity.
   */
  static create(create: CreateMediaServerProps): MediaServerEntity {
    const id = nanoid();
    const props: MediaServerProps = {
      ...create,
      libraries: create.libraries || [],
      users: create.users || [],
    };
    return new MediaServerEntity({ id, props });
  }

  // TODO: add validation for fields or zod
  public validate(): void {}
}
