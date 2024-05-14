import { Override } from '@/infrastructure/utils/override';
import { NotificationProps } from '@/resources/notification/types';

export type TelegramNotificationProps = Override<
  NotificationProps,
  {
    metadata: {
      botId: string;
      chatId: string;
      isSilent: boolean;
    };
  }
>;
