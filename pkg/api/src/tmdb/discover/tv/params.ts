import { z } from "zod";
import { SortByType, WatchMonetizationType } from "../types";

export const Parameters = [
    {
        name: "language",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "sort_by",
        type: "Query",
        schema: z.nativeEnum(SortByType).optional(),
    },
    {
        name: "air_date.gte",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "air_date.lte",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "first_air_date.gte",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "first_air_date.lte",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "first_air_date_year",
        type: "Query",
        schema: z.number().optional(),
    },
    {
        name: "page",
        type: "Query",
        schema: z.number().optional(),
    },
    {
        name: "timezone",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "vote_average.gte",
        type: "Query",
        schema: z.number().optional(),
    },
    {
        name: "vote_count.gte",
        type: "Query",
        schema: z.number().optional(),
    },
    {
        name: "with_genres",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "with_networks",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "without_genres",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "with_runtime.gte",
        type: "Query",
        schema: z.number().optional(),
    },
    {
        name: "with_runtime.lte",
        type: "Query",
        schema: z.number().optional(),
    },
    {
        name: "include_null_first_air_dates",
        type: "Query",
        schema: z.boolean().optional(),
    },
    {
        name: "with_original_language",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "without_keywords",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "screened_theatrically",
        type: "Query",
        schema: z.boolean().optional(),
    },
    {
        name: "with_companies",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "with_keywords",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "with_watch_providers",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "watch_region",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "with_watch_monetization_types",
        type: "Query",
        schema: z.nativeEnum(WatchMonetizationType).optional(),
    },
    {
        name: "with_status",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "with_type",
        type: "Query",
        schema: z.string().optional(),
    },
    {
        name: "without_companies",
        type: "Query",
        schema: z.string().optional(),
    },
] as const;