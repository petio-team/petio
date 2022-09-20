import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import logger from '@/loaders/logger';
import Filter from '@/models/filter';

const getFilters = async (ctx: Context) => {
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await Filter.find();
  } catch {
    logger.warn('FILTER: Unable to load filters');
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const updateFilter = async (ctx: Context) => {
  const {body} = ctx.request;

  const movieFilter = body.movie;
  const tvFilter = body.tv;
  const existingMovie = await Filter.findOne({ id: 'movie_filters' });
  const existingTv = await Filter.findOne({ id: 'tv_filters' });

  try {
    if (existingMovie) {
      await Filter.findOneAndUpdate(
        { id: 'movie_filters' },
        {
          $set: {
            data: movieFilter,
          },
        },
        { useFindAndModify: false },
      );
      logger.verbose('FILTER: Movie Filter updated');
    } else {
      const newMovie = new Filter({
        id: 'movie_filters',
        data: movieFilter,
      });
      await newMovie.save();
      logger.verbose('FILTER: New Movie filter created');
    }
    if (existingTv) {
      await Filter.findOneAndUpdate(
        { id: 'tv_filters' },
        {
          $set: {
            data: tvFilter,
          },
        },
        { useFindAndModify: false },
      );
      logger.verbose('FILTER: TV Filter updated');
    } else {
      const newTv = new Filter({
        id: 'tv_filters',
        data: tvFilter,
      });
      await newTv.save();
      logger.verbose('FILTER: New TV filter created');
    }
    logger.info('FILTER: Filters updated');
    ctx.status = StatusCodes.OK;
  } catch (err) {
    logger.error('FILTER: Error saving filters');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const route = new Router({ prefix: '/filter' });
export default (app: Router) => {
  route.get('/', getFilters);
  route.post('/update', updateFilter);

  app.use(route.routes());
};