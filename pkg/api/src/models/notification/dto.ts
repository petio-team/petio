import { randomUUID } from 'crypto';
import { z } from 'zod';

export const NotificationDTO = z.object({
  id: z.string().default(randomUUID()),
  url: z.string(),
  enabled: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Notification = z.infer<typeof NotificationDTO>;

// Make a notification object with default values applied
export const MakeNotification = (
  notification?: Partial<Notification>,
): Notification => {
  const defaults = NotificationDTO.parse({});
  return { ...defaults, ...notification };
};
