import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infra/entity/entity';

import { CreateImdbProps, ImdbProps } from './types';

/**
 * Represents a Imdb entity.
 */
export class ImdbEntity extends BaseEntity<ImdbProps> {
  /**
   * Creates a new Imdb entity.
   * @param create - The properties to create the Imdb entity.
   * @returns The newly created Imdb entity.
   */
  static create(create: CreateImdbProps): ImdbEntity {
    const id = nanoid();
    const props: ImdbProps = {
      ...create,
    };
    return new ImdbEntity({ id, props });
  }

  /**
   * Gets the rating of the Imdb entity.
   * @returns The rating of the Imdb entity.
   */
  get rating(): string {
    return this.props.rating;
  }

  /**
   * Validates the Imdb entity.
   */
  public validate(): void {}
}
