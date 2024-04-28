import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const CalendarSchema = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    originalTitle: z.string(),
    originalLanguage: z.object({ id: z.number(), name: z.string() }),
    alternateTitles: z.array(
      z.object({
        id: z.number(),
        sourceType: z.string(),
        movieMetadataId: z.number(),
        title: z.string(),
        cleanTitle: z.string().optional(),
        sourceId: z.number(),
        votes: z.number(),
        voteCount: z.number(),
        language: z.object({ id: z.number(), name: z.string() }),
      }),
    ),
    secondaryYear: z.number().optional(),
    secondaryYearSourceId: z.number(),
    sortTitle: z.string(),
    sizeOnDisk: z.number(),
    status: z.string(),
    overview: z.string(),
    inCinemas: z.string().optional(),
    physicalRelease: z.string().optional(),
    digitalRelease: z.string().optional(),
    physicalReleaseNote: z.string().optional(),
    images: z.array(
      z.object({
        coverType: z.string(),
        url: z.string(),
        remoteUrl: z.string().optional(),
      }),
    ),
    website: z.string(),
    remotePoster: z.string().optional(),
    year: z.number(),
    hasFile: z.boolean(),
    youTubeTrailerId: z.string(),
    studio: z.string(),
    path: z.string(),
    qualityProfileId: z.number(),
    monitored: z.boolean(),
    minimumAvailability: z.string(),
    isAvailable: z.boolean(),
    folderName: z.string(),
    runtime: z.number(),
    cleanTitle: z.string(),
    imdbId: z.string(),
    tmdbId: z.number(),
    titleSlug: z.string(),
    rootFolderPath: z.string().optional(),
    folder: z.string().optional(),
    certification: z.string().optional(),
    genres: z.array(z.string()),
    tags: z.array(z.number()),
    added: z.string(),
    addOptions: z
      .object({
        ignoreEpisodesWithFiles: z.boolean(),
        ignoreEpisodesWithoutFiles: z.boolean(),
        searchForMovie: z.boolean(),
      })
      .optional(),
    ratings: z.object({
      imdb: z
        .object({
          votes: z.number(),
          value: z.number(),
          type: z.string(),
        })
        .optional(),
      tmdb: z.object({
        votes: z.number(),
        value: z.number(),
        type: z.string(),
      }),
      metacritic: z
        .object({
          votes: z.number(),
          value: z.number(),
          type: z.string(),
        })
        .optional(),
      rottenTomatoes: z
        .object({
          votes: z.number(),
          value: z.number(),
          type: z.string(),
        })
        .optional(),
    }),
    movieFile: z
      .object({
        id: z.number(),
        movieId: z.number(),
        relativePath: z.string(),
        path: z.string(),
        size: z.number(),
        dateAdded: z.string(),
        sceneName: z.string().optional(),
        indexerFlags: z.number(),
        quality: z.object({
          quality: z.object({
            id: z.number(),
            name: z.string(),
            source: z.string(),
            resolution: z.number(),
            modifier: z.string(),
          }),
          revision: z.object({
            version: z.number(),
            real: z.number(),
            isRepack: z.boolean(),
          }),
          hardcodedSubs: z.string().optional(),
        }),
        customFormats: z
          .array(
            z.object({
              id: z.number(),
              name: z.string(),
              includeCustomFormatWhenRenaming: z.boolean(),
              specifications: z.array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                  implementation: z.string(),
                  implementationName: z.string(),
                  infoLink: z.string(),
                  negate: z.boolean(),
                  required: z.boolean(),
                  fields: z.array(
                    z.object({
                      order: z.number(),
                      name: z.string(),
                      module: z.string(),
                      unit: z.string(),
                      helpText: z.string(),
                      helpLink: z.string(),
                      type: z.string(),
                      advanced: z.boolean(),
                      selectOptions: z.array(
                        z.object({
                          value: z.number(),
                          name: z.string(),
                          order: z.number(),
                          hint: z.string(),
                          dividerAfter: z.boolean(),
                        }),
                      ),
                      selectOptionsProviderAction: z.string(),
                      section: z.string(),
                      hidden: z.string(),
                      placeholder: z.string(),
                    }),
                  ),
                  presets: z.array(z.null()),
                }),
              ),
            }),
          )
          .optional(),
        mediaInfo: z.object({
          id: z.number().optional(),
          audioBitrate: z.number(),
          audioChannels: z.number(),
          audioCodec: z.string(),
          audioLanguages: z.string(),
          audioStreamCount: z.number(),
          videoBitDepth: z.number(),
          videoBitrate: z.number(),
          videoCodec: z.string(),
          videoDynamicRangeType: z.string(),
          videoFps: z.number(),
          resolution: z.string(),
          runTime: z.string(),
          scanType: z.string(),
          subtitles: z.string(),
        }),
        originalFilePath: z.string().optional(),
        qualityCutoffNotMet: z.boolean(),
        languages: z.array(z.object({ id: z.number(), name: z.string() })),
        releaseGroup: z.string(),
        edition: z.string(),
      })
      .optional(),
    collection: z
      .object({
        name: z.string().optional(),
        tmdbId: z.number(),
        images: z.array(
          z.object({
            coverType: z.string(),
            url: z.string(),
            remoteUrl: z.string(),
          }),
        ),
      })
      .optional(),
    popularity: z.number(),
  }),
);
export type Calendar = z.infer<typeof CalendarSchema>;

export const CalendarEndpoint = makeApi([
  {
    method: 'get',
    path: '/api/v3/calendar',
    parameters: [
      {
        name: 'start',
        type: 'Query',
        schema: z.date().optional(),
      },
      {
        name: 'end',
        type: 'Query',
        schema: z.date().optional(),
      },
      {
        name: 'unmonitored',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'includeArtist',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: CalendarSchema,
  },
]);
