// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from './core/CancelablePromise';
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { GetMoviesLatestData, GetMoviesLatestResponse, GetMovieImagesData, GetMovieImagesResponse, GetTvLatestData, GetTvLatestResponse, GetTvImagesData, GetTvImagesResponse, GetArtistsLatestData, GetArtistsLatestResponse, GetArtistImagesData, GetArtistImagesResponse, GetAlbumData, GetAlbumResponse, GetLabelData, GetLabelResponse } from './types.gen';

export class MovieService {
    constructor(public readonly httpRequest: BaseHttpRequest) { }
    
    /**
     * Get Latest Movies
     * Gets the latest movies
     * @param data The data for the request.
     * @param data.date The unix timestamp used to get results after
     * @returns unknown Latest Movies
     * @throws ApiError
     */
    public getMoviesLatest(data: GetMoviesLatestData = {}): CancelablePromise<GetMoviesLatestResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/movies/latest',
            query: {
                date: data.date
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
    /**
     * Get Images for Movie
     * Retrieves images about a specific movie
     * @param data The data for the request.
     * @param data.movieId The ID of the movie
     * @param data.date The unix timestamp used to get results after
     * @returns unknown Movie Images
     * @throws ApiError
     */
    public getMovieImages(data: GetMovieImagesData): CancelablePromise<GetMovieImagesResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/movies/{movieId}',
            path: {
                movieId: data.movieId
            },
            query: {
                date: data.date
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
}

export class TvService {
    constructor(public readonly httpRequest: BaseHttpRequest) { }
    
    /**
     * Get Latest Shows
     * Retrieves images about a specific show
     * @param data The data for the request.
     * @param data.date The unix timestamp used to get results after
     * @returns unknown Latest Shows
     * @throws ApiError
     */
    public getTvLatest(data: GetTvLatestData = {}): CancelablePromise<GetTvLatestResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tv/latest',
            query: {
                date: data.date
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
    /**
     * Get Images for Show
     * Retrieves images about a specific show
     * @param data The data for the request.
     * @param data.showId The ID of the show
     * @param data.date The unix timestamp used to get results after
     * @returns unknown Show Results
     * @throws ApiError
     */
    public getTvImages(data: GetTvImagesData): CancelablePromise<GetTvImagesResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tv/{showId}',
            path: {
                showId: data.showId
            },
            query: {
                date: data.date
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
}

export class MusicService {
    constructor(public readonly httpRequest: BaseHttpRequest) { }
    
    /**
     * Get Latest Artists
     * Gets the latest artists
     * @param data The data for the request.
     * @param data.date The unix timestamp used to get results after
     * @returns unknown Latest Artists
     * @throws ApiError
     */
    public getArtistsLatest(data: GetArtistsLatestData = {}): CancelablePromise<GetArtistsLatestResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/music/latest',
            query: {
                date: data.date
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
    /**
     * Get Images for Artist
     * Retrieves images about a specific artist
     * @param data The data for the request.
     * @param data.artistId The ID of the artist
     * @param data.date The unix timestamp used to get results after
     * @returns unknown Artist Images
     * @throws ApiError
     */
    public getArtistImages(data: GetArtistImagesData): CancelablePromise<GetArtistImagesResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/music/{artistId}',
            path: {
                artistId: data.artistId
            },
            query: {
                date: data.date
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
    /**
     * Get Album
     * Retrieves album by id
     * @param data The data for the request.
     * @param data.albumId The ID of the album
     * @returns unknown Album Results
     * @throws ApiError
     */
    public getAlbum(data: GetAlbumData): CancelablePromise<GetAlbumResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/music/albums/{albumId}',
            path: {
                albumId: data.albumId
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
    /**
     * Get Label
     * Retrieves album by id
     * @param data The data for the request.
     * @param data.labelId The ID of the label
     * @returns unknown Label Results
     * @throws ApiError
     */
    public getLabel(data: GetLabelData): CancelablePromise<GetLabelResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/music/labels/{labelId}',
            path: {
                labelId: data.labelId
            },
            errors: {
                404: 'Not Found'
            }
        });
    }
    
}