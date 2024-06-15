import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import { NetworkMapper } from '@/resources/network/mapper';
import { ShowMapper } from '@/resources/show/mapper';
import { NetworkService } from '@/services/network/network-service';
import { ShowService } from '@/services/show/show-service';
import { discoverSeries, network } from '@/services/tmdb/show';

const lookupById = async (ctx: Context) => {
  const service = getFromContainer(ShowService);
  const mapper = getFromContainer(ShowMapper);
  const details = await service.getShow(ctx.params.id, {
    withArtwork: true,
    withServer: true,
  });
  if (details.isNone()) {
    ctx.status = StatusCodes.NOT_FOUND;
    return;
  }
  ctx.status = StatusCodes.OK;
  ctx.body = mapper.toResponse(details.unwrap());
};

const lookupByIdMinified = async (ctx: Context) => {
  const service = getFromContainer(ShowService);
  const mapper = getFromContainer(ShowMapper);
  const details = await service.getShow(ctx.params.id, {
    withArtwork: true,
    withServer: true,
  });
  if (details.isNone()) {
    ctx.status = StatusCodes.NOT_FOUND;
    return;
  }
  ctx.status = StatusCodes.OK;
  ctx.body = mapper.toResponse(details.unwrap());
};

const discoverSeriesData = async (ctx: Context) => {
  const service = getFromContainer(ShowService);
  const mapper = getFromContainer(ShowMapper);

  const { page, params } = (ctx.request.body as any) || 1;
  const { with_networks } = params;

  const results = await service.getDiscover({
    page,
    limit: 30,
    filterByNetworkId: with_networks
      ? parseInt(with_networks as string)
      : undefined,
  });

  ctx.status = StatusCodes.OK;
  ctx.body = {
    results: results.map((show) => mapper.toResponse(show)),
  };
};

const getNetworkById = async (ctx: Context) => {
  const networkResult = await getFromContainer(
    NetworkService,
  ).getNetworkDetails(ctx.params.id);
  if (networkResult.isNone()) {
    ctx.status = StatusCodes.NOT_FOUND;
    return;
  }
  const network = networkResult.unwrap();

  ctx.status = StatusCodes.OK;
  ctx.body = getFromContainer(NetworkMapper).toResponse(network);
};

const route = new Router({ prefix: '/show' });
export default (app: Router) => {
  route.get('/lookup/:id', lookupById);
  route.get('/lookup/:id/minified', lookupByIdMinified);
  route.post('/discover', discoverSeriesData);
  route.get('/network/:id', getNetworkById);

  app.use(route.routes());
};
