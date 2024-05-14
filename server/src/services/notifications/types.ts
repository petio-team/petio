import { IssueEntity } from '@/resources/issue/entity';
import { RequestEntity } from '@/resources/request/entity';
import { ReviewEntity } from '@/resources/review/entity';
import { UserEntity } from '@/resources/user/entity';

/**
 * Enum representing different types of notification events.
 */
export enum NotifyEvent {
  // Request
  REQUEST_ADDED = 'Request Added',
  REQUEST_REMOVED = 'Request Removed',
  REQUEST_APPROVED = 'Request Approved',
  REQUEST_REJECTED = 'Request Rejected',
  REQUEST_FAILED = 'Request Failed',
  REQUEST_COMPLETED = 'Request Completed',
  REQUEST_PENDING = 'Request Pending',
  // Issue
  ISSUE_OPENED = 'Issue Opened',
  ISSUE_CLOSED = 'Issue Closed',
  ISSUE_ACTIVITY = 'Issue Activity',
  ISSUE_REOPENED = 'Issue Re-Opened',
  ISSUE_REJECTED = 'Issue Rejected',
  // Test
  TEST_NOTIFICATION = 'Test Notification',
}

/**
 * Represents the payload for a notification.
 */
export type NotifyPayload = {
  title: string;
  description: string;
  content: string;
  media?: {
    image?: string;
    url?: string;
  };
  request?: RequestEntity;
  user?: UserEntity;
  issue?: IssueEntity;
  review?: ReviewEntity;
};
