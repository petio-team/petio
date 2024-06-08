import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import { CompanyMapper } from '@/resources/company/mapper';
import { MovieMapper } from '@/resources/movie/mapper';
import { NetworkMapper } from '@/resources/network/mapper';
import { PersonMapper } from '@/resources/person/mapper';
import { ShowMapper } from '@/resources/show/mapper';
import { CacheService } from '@/services/cache/cache-service';

const getTrending = async (ctx: Context) => {
  const service = getFromContainer(CacheService);
  const movieMapper = getFromContainer(MovieMapper);
  const showMapper = getFromContainer(ShowMapper);
  const personMapper = getFromContainer(PersonMapper);
  const networkMapper = getFromContainer(NetworkMapper);
  const companyMapper = getFromContainer(CompanyMapper);
  const trending = await service.getCommonResources();

  ctx.status = StatusCodes.OK;
  ctx.body = {
    movies: trending.movies.map((movie) => movieMapper.toResponse(movie)),
    tv: trending.shows.map((show) => showMapper.toResponse(show)),
    people: trending.people.map((person) => personMapper.toResponse(person)),
    networks: trending.networks.map((network) =>
      networkMapper.toResponse(network),
    ),
    companies: trending.companies.map((company) =>
      companyMapper.toResponse(company),
    ),
  };
};

const route = new Router({ prefix: '/trending' });
export default (app: Router) => {
  route.get('/', getTrending);

  app.use(route.routes());
};
