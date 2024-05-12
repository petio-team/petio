import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { IssueEntity } from '@/resources/issue/entity';
import { IssueMapper } from '@/resources/issue/mapper';
import { IssueRepository } from '@/resources/issue/repository';
import { UserRepository } from '@/resources/user/repository';
import Mailer from '@/services/mail/mailer';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const listAllIssues = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  const issues = await getFromContainer(IssueRepository).findAll();
  ctx.body = issues.map((issue) =>
    getFromContainer(IssueMapper).toResponse(issue),
  );
};

async function mailIssue(
  user_id: any,
  media_id: any,
  type: string,
  title: any,
) {
  const userResult = await getFromContainer(UserRepository).findOne({
    id: user_id,
  });
  if (userResult.isNone()) {
    logger.log('warn', 'MAILER: User not found');
    return;
  }
  const userData = userResult.unwrap();
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
  const typeF = type === 'series' ? 'TV Show' : 'Movie';
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
  const userResult = await getFromContainer(UserRepository).findOne({
    id: user_id,
  });
  if (userResult.isNone()) {
    logger.log('warn', 'MAILER: User not found');
    return;
  }
  const userData = userResult.unwrap();
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
  const typeF = type === 'series' ? 'TV Show' : 'Movie';
  new Mailer().mail(
    `Issue closed for the ${typeF} ${title}`,
    `Issue closed for ${typeF}: ${title}`,
    `The issue you reported has now been closed. <p style='text-align:center;color:#fff;'> Admin Message: ${message}</p>`,
    `https://image.tmdb.org/t/p/w500${media.poster_path}`,
    [userData.email as never],
    [userData.title as never],
  );
}

const deleteIssues = async (ctx: Context) => {
  const body = ctx.request.body as any;
  const issueId = body.id;
  const { message } = body;

  try {
    const issueResult = await getFromContainer(IssueRepository).findOne({
      id: issueId,
    });
    if (issueResult.isNone()) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = { error: 'error no issue found' };
      return;
    }
    const issue = issueResult.unwrap();

    mailIssueResolve(issue.id, issue.user, issue.type, issue.title, message);
    await getFromContainer(IssueRepository).deleteManyByIds([issueId]);

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
  const body = ctx.request.body as any;

  try {
    const issueResult = await getFromContainer(IssueRepository).create(
      new IssueEntity({
        id: body.mediaId,
        props: {
          type: body.type,
          title: body.title,
          user: body.user,
          tmdbId: 0,
          sonarrs: [],
          radarrs: [],
          issue: body.issue,
          comment: body.comment,
        },
      }),
    );
    mailIssue(body.user, body.mediaId, body.type, body.title);
    ctx.status = StatusCodes.OK;
    ctx.body = getFromContainer(IssueMapper).toResponse(issueResult);
  } catch (err) {
    logger.error(err);
    logger.log('warn', 'ROUTE: Error addding issue');
    logger.log('error', err.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'error adding issue' };
  }
};

const route = new Router({ prefix: '/issue' });
export default (app: Router) => {
  route.get('/all', listAllIssues);
  route.post('/add', addIssue);
  route.post('/remove', deleteIssues);

  app.use(route.routes());
};
