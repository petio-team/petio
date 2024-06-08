import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreatePersonProps, PersonProps } from './types';

/**
 * Represents a Person entity.
 */
export class PersonEntity extends BaseEntity<PersonProps> {
  /**
   * Creates a new Person entity.
   * @param create - The properties to create the Person entity.
   * @returns The newly created Person entity.
   */
  static create(create: CreatePersonProps): PersonEntity {
    const id = nanoid();
    const props: PersonProps = {
      ...create,
    };
    return new PersonEntity({ id, props });
  }

  get name(): string {
    return this.props.name;
  }

  get gender(): string {
    return this.props.gender;
  }

  get bio(): string {
    return this.props.bio;
  }

  get role(): string {
    return this.props.role;
  }

  get birthDate(): string {
    return this.props.birthDate;
  }

  get deathDate(): string | undefined {
    return this.props.deathDate;
  }

  get popularity(): { tmdb: number } {
    return this.props.popularity;
  }

  get artwork(): { poster?: { url: string; source: string } } {
    return this.props.artwork;
  }

  get media(): {
    movies: { name: string; provider: { tmdbId: number } }[];
    shows: { name: string; provider: { tmdbId: number } }[];
  } {
    return this.props.media;
  }

  get provider(): { tmdbId: number } {
    return this.props.provider;
  }

  get source(): string {
    return this.props.source;
  }

  /**
   * Validates the Person entity.
   */
  public validate(): void {}
}
