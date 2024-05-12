import { Newable } from 'diod';

import { MediaServerType } from '@/resources/media-server/types';
import { PlexScannerProvider } from '@/services/scanner/providers/plex';

export type ScannerProviders = {
  [key in MediaServerType]: Newable<any>;
};

export const scannerProviders: ScannerProviders = {
  [MediaServerType.PLEX]: PlexScannerProvider,
};
