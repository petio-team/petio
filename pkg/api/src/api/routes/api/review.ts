import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import Review from '@/models/review';
import { UserModel } from '@/models/user';

const listReviews = async (ctx: Context) => {
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await Review.find();
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
    ctx.body = await Review.find({ tmdb_id: id });
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
    const userData = await UserModel.findOne({ id: user });
    if (!userData) {
      throw new Error('failed to get user data');
    }
    const existingReview = await Review.findOne({
      tmdb_id: item.id,
      user: userData.id,
    });
    let savedReview = {};
    if (existingReview) {
      existingReview.score = review.score;
      savedReview = await existingReview.save();
    } else {
      const newReview = new Review({
        tmdb_id: item.id,
        score: review.score,
        comment: review.comment,
        user: userData.id,
        date: new Date(),
        type: item.type,
        title: item.title,
      });

      savedReview = await newReview.save();
    }

    ctx.status = StatusCodes.OK;
    ctx.body = savedReview;
  } catch (err) {
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
