import { makeParameters } from "@zodios/core";
import { z } from "zod";

// eslint-disable-next-line import/prefer-default-export
export const commonSharedHeaders = makeParameters([
  {
    name: 'X-Plex-Token',
    description: 'Plex Token',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Client-Identifier',
    description: 'Plex Client Identifier',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Product',
    description: 'Plex Product',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Version',
    description: 'Plex Version',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Platform',
    description: 'Plex Platform',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Platform-Version',
    description: 'Plex Platform Version',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Device-Name',
    description: 'Plex Device Name',
    type: 'Header',
    schema: z.string().optional(),
  },
  {
    name: 'X-Plex-Device',
    description: 'Plex Device',
    type: 'Header',
    schema: z.string().optional(),
  }
]);
