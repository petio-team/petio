import { MakeRequest, Request } from '@/models/request/dto';
import { User } from '@/models/user/dto';
import { MakeUser } from '@/models/user/dto';

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
  request?: Request;
  user?: User;
  issue?: unknown;
  review?: unknown;
};

export const TestNotificationPayload: NotifyPayload = {
  title: 'Test Notification',
  content:
    'This is a test notification to make sure this provider is working as expected for you',
  media: {
    image:
      'https://image.tmdb.org/t/p/w533_and_h300_bestv2/5wQG7raxg1N6jBNU5nBFXUQVqnQ.jpg',
    url: 'https://www.themoviedb.org/tv/99966',
  },
  request: MakeRequest({ title: 'Media 101 Requested' }),
  user: MakeUser({ username: 'TestUser' }),
};
