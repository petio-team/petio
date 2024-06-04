// This file is auto-generated by @hey-api/openapi-ts

export type GetMovieByIdData = {
    /**
     * The ID of the movie
     */
    movieId: number;
};

export type GetMovieByIdResponse = {
    ImdbId: string;
    Overview: string;
    Title: string;
    OriginalTitle: string;
    TitleSlug: string;
    Ratings: Array<{
        Count: number;
        Value: number;
        Origin: string;
        Type: string;
    }>;
    MovieRatings: {
        Tmdb: {
            Count: number;
            Value: number;
            Type: string;
        };
        Imdb: {
            Count: number;
            Value: number;
            Type: string;
        } | null;
        Metacritic: {
            Count: number;
            Value: number;
            Type: string;
        } | null;
        RottenTomatoes: {
            Count: number;
            Value: number;
            Type: string;
        } | null;
    };
    Runtime: number;
    Images: Array<{
        CoverType: string;
        Url: string;
    }>;
    Genres: Array<(string)>;
    Popularity: number;
    Premier: string | null;
    InCinema: string | null;
    PhysicalRelease: string | null;
    DigitalRelease: string | null;
    Year: number;
    AlternativeTitles: Array<{
        Title: string;
        Type: string;
        Language: string;
    }>;
    Translations: Array<{
        Title: string;
        Overview: string;
        Language: string;
    }>;
    Recommendations: Array<{
        TmdbId: number;
        Title: string;
    }>;
    Credits: {
        Cast: Array<{
            Name: string;
            Order: number;
            Character: string;
            TmdbId: number;
            CreditId: string;
            Images: Array<{
                CoverType: string;
                Url: string;
            }>;
        }>;
        Crew: Array<{
            Name: string;
            Job: string;
            Department: string;
            TmdbId: number;
            CreditId: string;
            Images: Array<{
                CoverType: string;
                Url: string;
            }>;
        }>;
    };
    Studio: string;
    YoutubeTrailerId: string;
    Certifications: Array<{
        Country: string;
        Certification: string;
    }>;
    Status: string | null;
    Collection: {
        Name: string;
        Images: Array<{
            CoverType: string;
            Url: string;
        }> | null;
        Overview: string | null;
        Translations: Array<{
            Title: string;
            Overview: string;
            Language: string;
        }> | null;
        Parts: unknown[] | null;
        TmdbId: number;
    } | null;
    OriginalLanguage: string;
    Homepage: string;
    TmdbId: number;
};

export type $OpenApiTs = {
    '/movie/{movieId}': {
        get: {
            req: {
                /**
                 * The ID of the movie
                 */
                movieId: number;
            };
            res: {
                /**
                 * OK
                 */
                200: {
                    ImdbId: string;
                    Overview: string;
                    Title: string;
                    OriginalTitle: string;
                    TitleSlug: string;
                    Ratings: Array<{
                        Count: number;
                        Value: number;
                        Origin: string;
                        Type: string;
                    }>;
                    MovieRatings: {
                        Tmdb: {
                            Count: number;
                            Value: number;
                            Type: string;
                        };
                        Imdb: {
                            Count: number;
                            Value: number;
                            Type: string;
                        } | null;
                        Metacritic: {
                            Count: number;
                            Value: number;
                            Type: string;
                        } | null;
                        RottenTomatoes: {
                            Count: number;
                            Value: number;
                            Type: string;
                        } | null;
                    };
                    Runtime: number;
                    Images: Array<{
                        CoverType: string;
                        Url: string;
                    }>;
                    Genres: Array<(string)>;
                    Popularity: number;
                    Premier: string | null;
                    InCinema: string | null;
                    PhysicalRelease: string | null;
                    DigitalRelease: string | null;
                    Year: number;
                    AlternativeTitles: Array<{
                        Title: string;
                        Type: string;
                        Language: string;
                    }>;
                    Translations: Array<{
                        Title: string;
                        Overview: string;
                        Language: string;
                    }>;
                    Recommendations: Array<{
                        TmdbId: number;
                        Title: string;
                    }>;
                    Credits: {
                        Cast: Array<{
                            Name: string;
                            Order: number;
                            Character: string;
                            TmdbId: number;
                            CreditId: string;
                            Images: Array<{
                                CoverType: string;
                                Url: string;
                            }>;
                        }>;
                        Crew: Array<{
                            Name: string;
                            Job: string;
                            Department: string;
                            TmdbId: number;
                            CreditId: string;
                            Images: Array<{
                                CoverType: string;
                                Url: string;
                            }>;
                        }>;
                    };
                    Studio: string;
                    YoutubeTrailerId: string;
                    Certifications: Array<{
                        Country: string;
                        Certification: string;
                    }>;
                    Status: string | null;
                    Collection: {
                        Name: string;
                        Images: Array<{
                            CoverType: string;
                            Url: string;
                        }> | null;
                        Overview: string | null;
                        Translations: Array<{
                            Title: string;
                            Overview: string;
                            Language: string;
                        }> | null;
                        Parts: unknown[] | null;
                        TmdbId: number;
                    } | null;
                    OriginalLanguage: string;
                    Homepage: string;
                    TmdbId: number;
                };
                /**
                 * Not Found
                 */
                404: unknown;
            };
        };
    };
};