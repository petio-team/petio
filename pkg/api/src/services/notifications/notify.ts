import { RequestEntity } from '@/resources/request/entity';
import { UserEntity } from '@/resources/user/entity';

export enum NotifyEvent {
  // Request
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

export interface INotify {
  Send(type: NotifyEvent, data: NotifyPayload): Promise<void>;
}

export type NotifyPayload = {
  title: string;
  content: string;
  media?: {
    image?: string;
    url?: string;
  };
  request?: RequestEntity;
  user?: UserEntity;
  issue?: unknown;
  review?: unknown;
};
