import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import { PersonMapper } from '@/resources/person/mapper';
import { PersonService } from '@/services/person/person-service';

const lookupById = async (ctx: Context) => {
  const mapper = getFromContainer(PersonMapper);
  const results = await getFromContainer(PersonService).getDetails(
    ctx.params.id,
  );
  if (results.isNone()) {
    ctx.status = StatusCodes.NOT_FOUND;
    return;
  }
  const result = results.unwrap();
  ctx.status = StatusCodes.OK;
  ctx.body = {
    info: mapper.toResponse(result),
    movies: {
      id: ctx.params.id,
      cast: result.media.movies.map((movie) => ({
        id: movie.provider.tmdbId,
        name: movie.name,
      })),
      crew: [],
    },
    tv: {
      id: ctx.params.id,
      cast: result.media.shows.map((show) => ({
        id: show.provider.tmdbId,
        name: show.name,
      })),
      crew: [],
    },
  };
};

const route = new Router({ prefix: '/person' });

export default (app: Router) => {
  route.get('/lookup/:id', lookupById);

  app.use(route.routes());
};
