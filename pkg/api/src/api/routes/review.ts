import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { ReviewEntity } from '@/resources/review/entity';
import { ReviewRepository } from '@/resources/review/repository';
import { UserRepository } from '@/resources/user/repository';

const listReviews = async (ctx: Context) => {
  try {
    ctx.status = StatusCodes.OK;
    //     ctx.body = await Review.find();
    ctx.body = [];
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const getReviewById = async (ctx: Context) => {
  const { id } = ctx.params;
  if (!id) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'id required' };
    return;
  }
  try {
    ctx.status = StatusCodes.OK;
    // ctx.body = await Review.find({ tmdb_id: id });
    ctx.body = {};
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const addReview = async (ctx: Context) => {
  const { body } = ctx.request;

  const { item } = body;
  const { review } = body;
  const { user } = body;
  try {
    const userResult = await getFromContainer(UserRepository).findOne({
      id: user,
    });
    if (userResult.isNone()) {
      throw new Error('failed to get user data');
    }
    const userData = userResult.unwrap();
    const reviewResult = await getFromContainer(ReviewRepository).findOne({
      tmdb_id: item.id,
      user: userData.id,
    });
    if (reviewResult.isNone()) {
      throw new Error('review does not exist');
    }
    const existingReview = reviewResult.unwrap();
    let savedReview = {};
    if (existingReview) {
      await getFromContainer(ReviewRepository).updateMany(
        { id: existingReview.id },
        {
          score: review.score,
        },
      );
      savedReview = {
        ...existingReview.getProps(),
        score: review.score,
      };
    } else {
      const createResults = await getFromContainer(ReviewRepository).create(
        ReviewEntity.create({
          tmdbId: item.id,
          score: review.score,
          comment: review.comment,
          user: userData.id,
          date: new Date(),
          type: item.type,
          title: item.title,
        }),
      );
      savedReview = createResults.getProps();
    }

    ctx.status = StatusCodes.OK;
    ctx.body = savedReview;
  } catch (err) {
    logger.error('Failed to add review', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const route = new Router({ prefix: '/review' });
export default (app: Router) => {
  route.get('/all', listReviews);
  route.get('/all/:id', getReviewById);
  route.post('/add', addReview);

  app.use(route.routes());
};
