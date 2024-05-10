import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateReviewProps, ReviewProps } from './types';

/**
 * Represents a Review entity.
 */
export class ReviewEntity extends BaseEntity<ReviewProps> {
  /**
   * Creates a new Review entity.
   * @param create - The properties to create the Review entity.
   * @returns The newly created Review entity.
   */
  static create(create: CreateReviewProps): ReviewEntity {
    const id = nanoid();
    const props: ReviewProps = {
      ...create,
    };
    return new ReviewEntity({ id, props });
  }

  /**
   * Gets the title of the review.
   * @returns The title of the review.
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Gets the score of the review.
   * @returns The score of the review.
   */
  get score(): number {
    return this.props.score;
  }

  /**
   * Gets the comment of the review.
   * @returns The comment of the review.
   */
  get comment(): string {
    return this.props.comment;
  }

  /**
   * Gets the user of the review.
   * @returns The user of the review.
   */
  get user(): string {
    return this.props.user;
  }

  /**
   * Gets the date of the review.
   * @returns The date of the review.
   */
  get date(): Date {
    return this.props.date;
  }

  /**
   * Gets the tmdbId of the review.
   * @returns The tmdbId of the review.
   */
  get tmdbId(): string {
    return this.props.tmdbId;
  }

  /**
   * Validates the Review entity.
   */
  public validate(): void {}
}
