import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { Interceptors } from './core/OpenAPI';
import { MovieService, MusicService, TvService } from './services.gen';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class FanartTvV3ApiClient {
  public readonly movie: MovieService;

  public readonly music: MusicService;

  public readonly tv: TvService;

  public readonly request: BaseHttpRequest;

  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = AxiosHttpRequest,
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? 'https://webservice.fanart.tv/v3',
      VERSION: config?.VERSION ?? '3.0.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
      interceptors: {
        request: config?.interceptors?.request ?? new Interceptors(),
        response: config?.interceptors?.response ?? new Interceptors(),
      },
    });

    this.movie = new MovieService(this.request);
    this.music = new MusicService(this.request);
    this.tv = new TvService(this.request);
  }
}
