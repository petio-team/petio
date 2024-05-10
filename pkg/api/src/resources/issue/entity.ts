import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateIssueProps, IssueProps } from './types';

/**
 * Represents a Issue entity.
 */
export class IssueEntity extends BaseEntity<IssueProps> {
  /**
   * Creates a new Issue entity.
   * @param create - The properties to create the Issue entity.
   * @returns The newly created Issue entity.
   */
  static create(create: CreateIssueProps): IssueEntity {
    const id = nanoid();
    const props: IssueProps = {
      ...create,
    };
    return new IssueEntity({ id, props });
  }

  /**
   * Gets the type of the issue.
   * @returns The type of the issue.
   */
  get type(): string {
    return this.props.type;
  }

  /**
   * Gets the title of the issue.
   * @returns The title of the issue.
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Gets the issue.
   * @returns The issue.
   */
  get issue(): string {
    return this.props.issue;
  }

  /**
   * Gets the comment.
   * @returns The comment.
   */
  get comment(): string {
    return this.props.comment;
  }

  /**
   * Gets the tmdbId.
   * @returns The tmdbId.
   */
  get tmdbId(): number {
    return this.props.tmdbId;
  }

  /**
   * Gets the user.
   * @returns The user.
   */
  get user(): string {
    return this.props.user;
  }

  /**
   * Gets the sonarrs.
   * @returns The sonarrs.
   */
  get sonarrs(): string[] {
    return this.props.sonarrs;
  }

  /**
   * Gets the radarrs.
   * @returns The radarrs.
   */
  get radarrs(): string[] {
    return this.props.radarrs;
  }

  /**
   * Validates the Issue entity.
   */
  public validate(): void {}
}
