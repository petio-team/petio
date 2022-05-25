import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import logger from '@/loaders/logger';
import Mailer from '@/mail/mailer';
import Issue from '@/models/issue';
import { UserModel } from '@/models/user';
import { movieLookup } from '@/tmdb/movie';
import { showLookup } from '@/tmdb/show';

const route = new Router({ prefix: '/issue' });

export default (app: Router) => {
  route.get('/all', listAllIssues);
  route.post('/add', addIssue);
  route.post('/remove', deleteIssues);

  app.use(route.routes());
};

const listAllIssues = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await Issue.find();
};

const deleteIssues = async (ctx: Context) => {
  const body = ctx.body as any;
  const issue_id = body.id;
  const message = body.message;

  try {
    let issue = await Issue.findById(issue_id);
    mailIssueResolve(
      issue.user,
      issue.mediaId,
      issue.type,
      issue.title,
      message,
    );
    await Issue.findByIdAndDelete(issue_id);

    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error(err);
    logger.log('warn', 'ROUTE: Error removing issue');
    logger.log('error', err.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'error removing issue' };
  }
};

const addIssue = async (ctx: Context) => {
  const body = ctx.body as any;

  const newIssue = new Issue({
    mediaId: body.mediaId,
    type: body.type,
    title: body.title,
    user: body.user,
    sonarrId: false,
    radarrId: false,
    issue: body.issue,
    comment: body.comment,
  });

  try {
    const savedIssue = await newIssue.save();
    mailIssue(body.user, body.mediaId, body.type, body.title);
    ctx.status = StatusCodes.OK;
    ctx.body = savedIssue;
  } catch (err) {
    logger.error(err);
    logger.log('warn', 'ROUTE: Error addding issue');
    logger.log('error', err.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'error adding issue' };
  }
};

async function mailIssue(user_id, media_id, type, title) {
  let userData = await UserModel.findOne({ id: user_id });
  let media: any = false;
  if (type === 'series') {
    media = await showLookup(media_id, true);
  } else {
    media = await movieLookup(media_id, true);
  }
  if (!media) {
    logger.log('warn', 'MAILER: Media not found');
    return;
  }
  if (!userData) {
    logger.log('warn', 'MAILER: User not found');
    return;
  }
  if (!userData.email) {
    logger.log('warn', 'MAILER: No user email');
    return;
  }
  let typeF = type === 'series' ? 'TV Show' : 'Movie';
  new Mailer().mail(
    `Issue reported for the ${type} ${title}`,
    `Issue reported for ${typeF}: ${title}`,
    `Your issue has been logged and you'll receive another email once it has been addressed`,
    `https://image.tmdb.org/t/p/w500${media.poster_path}`,
    [userData.email as never],
    [title as never],
  );
}

async function mailIssueResolve(user_id, media_id, type, title, message) {
  let userData = await UserModel.findOne({ id: user_id });
  let media: any = false;
  if (type === 'series') {
    media = await showLookup(media_id, true);
  } else {
    media = await movieLookup(media_id, true);
  }
  if (!media) {
    logger.log('warn', 'MAILER: Media not found');
    return;
  }
  if (!userData) {
    logger.log('warn', 'MAILER: User not found');
    return;
  }
  if (!userData.email) {
    logger.log('warn', 'MAILER: No user email');
    return;
  }
  let typeF = type === 'series' ? 'TV Show' : 'Movie';
  new Mailer().mail(
    `Issue closed for the ${typeF} ${title}`,
    `Issue closed for ${typeF}: ${title}`,
    `The issue you reported has now been closed. <p style='text-align:center;color:#fff;'> Admin Message: ${message}</p>`,
    `https://image.tmdb.org/t/p/w500${media.poster_path}`,
    [userData.email as never],
    [userData.title as never],
  );
}
