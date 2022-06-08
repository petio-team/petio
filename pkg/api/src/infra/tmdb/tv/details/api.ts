import { asApi } from '@zodios/core';
import * as z from 'zod';

export const TvDetailsSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  created_by: z.array(z.unknown()),
  episode_run_time: z.array(z.number()),
  first_air_date: z.string(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  in_production: z.boolean(),
  languages: z.array(z.string()),
  last_air_date: z.string().or(z.null()),
  last_episode_to_air: z
    .object({
      air_date: z.string(),
      episode_number: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      production_code: z.string(),
      runtime: z.number().or(z.null()),
      season_number: z.number(),
      still_path: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
    })
    .or(z.null()),
  name: z.string(),
  next_episode_to_air: z.union([
    z.object({
      air_date: z.string(),
      episode_number: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      production_code: z.string(),
      runtime: z.number().or(z.null()),
      season_number: z.number(),
      still_path: z.string().or(z.null()),
      vote_average: z.number(),
      vote_count: z.number(),
    }),
    z.null(),
  ]),
  networks: z.array(
    z.object({
      name: z.string(),
      id: z.number(),
      logo_path: z.string(),
      origin_country: z.string(),
    }),
  ),
  number_of_episodes: z.number(),
  number_of_seasons: z.number(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  production_companies: z
    .array(
      z.object({
        id: z.number(),
        logo_path: z.string().or(z.null()),
        name: z.string(),
        origin_country: z.string(),
      }),
    )
    .optional(),
  production_countries: z.array(
    z.object({ iso_3166_1: z.string(), name: z.string() }),
  ),
  seasons: z.array(
    z.object({
      air_date: z.string().or(z.null()),
      episode_count: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      poster_path: z.string().or(z.null()),
      season_number: z.number(),
    }),
  ),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  type: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  videos: z
    .object({
      results: z.array(
        z.object({
          iso_639_1: z.string(),
          iso_3166_1: z.string(),
          name: z.string(),
          key: z.string(),
          site: z.string(),
          size: z.number(),
          type: z.string(),
          official: z.boolean(),
          published_at: z.string(),
          id: z.string(),
        }),
      ),
    })
    .optional(),
  aggregate_credits: z
    .object({
      cast: z
        .array(
          z.union([
            z.object({
              adult: z.boolean(),
              gender: z.number(),
              id: z.number(),
              known_for_department: z.string(),
              name: z.string(),
              original_name: z.string(),
              popularity: z.number(),
              profile_path: z.string(),
              roles: z.array(
                z.object({
                  credit_id: z.string(),
                  character: z.string(),
                  episode_count: z.number(),
                }),
              ),
              total_episode_count: z.number(),
              order: z.number(),
            }),
            z.object({
              adult: z.boolean(),
              gender: z.number(),
              id: z.number(),
              known_for_department: z.string(),
              name: z.string(),
              original_name: z.string(),
              popularity: z.number(),
              profile_path: z.null(),
              roles: z.array(
                z.object({
                  credit_id: z.string(),
                  character: z.string(),
                  episode_count: z.number(),
                }),
              ),
              total_episode_count: z.number(),
              order: z.number(),
            }),
          ]),
        )
        .optional(),
      crew: z.array(
        z.union([
          z.object({
            adult: z.boolean(),
            gender: z.number(),
            id: z.number(),
            known_for_department: z.string(),
            name: z.string(),
            original_name: z.string(),
            popularity: z.number(),
            profile_path: z.null(),
            jobs: z.array(
              z.object({
                credit_id: z.string(),
                job: z.string(),
                episode_count: z.number(),
              }),
            ),
            department: z.string(),
            total_episode_count: z.number(),
          }),
          z.object({
            adult: z.boolean(),
            gender: z.number(),
            id: z.number(),
            known_for_department: z.string(),
            name: z.string(),
            original_name: z.string(),
            popularity: z.number(),
            profile_path: z.string(),
            jobs: z.array(
              z.object({
                credit_id: z.string(),
                job: z.string(),
                episode_count: z.number(),
              }),
            ),
            department: z.string(),
            total_episode_count: z.number(),
          }),
        ]),
      ),
    })
    .optional(),
  keywords: z
    .object({
      results: z.array(z.object({ name: z.string(), id: z.number() })),
    })
    .optional(),
  content_ratings: z
    .object({
      results: z.array(
        z.object({ iso_3166_1: z.string(), rating: z.string() }),
      ),
    })
    .optional(),
  credits: z
    .object({
      cast: z.array(
        z.object({
          adult: z.boolean(),
          gender: z.number(),
          id: z.number(),
          known_for_department: z.string(),
          name: z.string(),
          original_name: z.string(),
          popularity: z.number(),
          profile_path: z.string(),
          character: z.string(),
          credit_id: z.string(),
          order: z.number(),
        }),
      ),
      crew: z.array(
        z.union([
          z.object({
            adult: z.boolean(),
            gender: z.number(),
            id: z.number(),
            known_for_department: z.string(),
            name: z.string(),
            original_name: z.string(),
            popularity: z.number(),
            profile_path: z.null(),
            credit_id: z.string(),
            department: z.string(),
            job: z.string(),
          }),
          z.object({
            adult: z.boolean(),
            gender: z.number(),
            id: z.number(),
            known_for_department: z.string(),
            name: z.string(),
            original_name: z.string(),
            popularity: z.number(),
            profile_path: z.string(),
            credit_id: z.string(),
            department: z.string(),
            job: z.string(),
          }),
        ]),
      ),
    })
    .optional(),
});
export type TvDetails = z.infer<typeof TvDetailsSchema>;

export const TvDetailsAPI = asApi([
  {
    method: 'get',
    path: '/tv/:id',
    parameters: [
      {
        name: 'append_to_response',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: TvDetailsSchema,
  },
] as const);
