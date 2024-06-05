import { Newable } from 'diod';

import { MediaServerType } from '@/resources/media-server/types';
import { ScannerProvider } from '@/services/scanner/provider';
import { PlexScannerProvider } from '@/services/scanner/providers/plex';

export type ScannerProviders = {
  [key in MediaServerType]: Newable<ScannerProvider>;
};

export const scannerProviders: ScannerProviders = {
  [MediaServerType.PLEX]: PlexScannerProvider,
};
