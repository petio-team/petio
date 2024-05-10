import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the properties of a Issue.
 */
export type IssueProps = {
  type: string;
  title: string;
  issue: string;
  comment: string;
  tmdbId: number;
  user: string;
  sonarrs: string[];
  radarrs: string[];
};

/**
 * Represents the properties for creating a Issue.
 */
export type CreateIssueProps = Override<
  IssueProps,
  {
    // TODO: add fields to override
  }
>;
