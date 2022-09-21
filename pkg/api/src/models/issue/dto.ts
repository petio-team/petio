import { randomUUID } from 'crypto';
import { z } from 'zod';

import { DownloaderDTO } from '../downloader/dto';
import { UserDTO } from '../user/dto';

export const IssueDTO = z.object({
  id: z.string().default(randomUUID()),
  tmdb_id: z.string(),
  title: z.string(),
  user: z.union([UserDTO, z.string()]),
  downloaders: DownloaderDTO.array(),
  issue: z.string(),
  comment: z.string(),
});
export type Issue = z.infer<typeof IssueDTO>;
