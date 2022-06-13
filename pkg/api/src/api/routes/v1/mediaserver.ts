import Router from '@koa/router';
import { Context } from 'koa';
import { MongoServerError } from 'mongodb';
import { container } from 'tsyringe';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import {
  MediaServerInput,
  MediaServerInputSchema,
} from '@/api/schemas/mediaserver';
import { StatusOk, handleCommonErrors } from '@/api/web/request';
import { IMediaServerRepository } from '@/models/mediaserver/repository';
import { Plex } from '@/services/plex/plex';

import { StatusBadRequest } from '../../web/request';

const route = new Router({ prefix: '/mediaserver' });

export default (app: Router) => {
  route.get(
    '/',
    validateRequest({
      query: z.object({
        deleted: z.string().max(0).optional(),
      }),
    }),
    listMediaServers,
  );
  route.get(
    '/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid().min(1),
      }),
      query: z.object({
        deleted: z.string().max(0).optional(),
      }),
    }),
    getMediaServerById,
  );
  route.post(
    '/',
    validateRequest({
      body: MediaServerInputSchema,
    }),
    createMediaServer,
  );
  route.patch(
    '/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid().min(1),
      }),
      body: MediaServerInputSchema.partial(),
    }),
    updateMediaServer,
  );
  route.delete(
    '/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid().min(1),
      }),
    }),
    deleteMediaServer,
  );
  route.delete(
    '/:id/remove',
    validateRequest({
      params: z.object({
        id: z.string().uuid().min(1),
      }),
    }),
    removeMediaServer,
  );

  app.use(route.routes()).use(route.allowedMethods());
};

const listMediaServers = async (ctx: Context) => {
  const deleted = ctx.request.query.deleted === undefined ? true : false;

  try {
    const repo = container.resolve<IMediaServerRepository>('MediaServer');
    const instances = await repo.getAll(deleted);

    StatusOk(ctx, instances);
  } catch (error) {
    handleCommonErrors(ctx, error);
  }
};

const getMediaServerById = async (ctx: Context) => {
  const deleted = ctx.request.query.deleted === undefined ? true : false;

  try {
    const repo = container.resolve<IMediaServerRepository>('MediaServer');
    const instance = await repo.getAll(deleted);

    StatusOk(ctx, instance);
  } catch (error) {
    handleCommonErrors(ctx, error);
  }
};

const createMediaServer = async (ctx: Context) => {
  const body = ctx.request.body as MediaServerInput;

  try {
    const repo = container.resolve<IMediaServerRepository>('MediaServer');
    const url = new URL(body.url);

    const plex = new Plex(url, body.token);
    if (!(await plex.testConnection())) {
      StatusBadRequest(ctx, 'failed to connect to plex server');
      return;
    }

    const exists = await repo.getAll();
    if (exists.length) {
      StatusBadRequest(ctx, 'media server already exists');
      return;
    }

    const instance = await repo.create(
      body.type,
      body.name,
      url,
      body.token,
      body.enabled,
    );

    StatusOk(ctx, instance);
  } catch (error) {
    handleCommonErrors(ctx, error);
  }
};

const updateMediaServer = async (ctx: Context) => {
  const id = ctx.params.id;
  const body = ctx.request.body as Partial<MediaServerInput>;

  try {
    const repo = container.resolve<IMediaServerRepository>('MediaServer');
    const instance = await repo.updateById(
      id,
      body.name,
      body.url ? new URL(body.url) : undefined,
      body.token,
      body.enabled,
    );

    StatusOk(ctx, instance);
  } catch (error) {
    handleCommonErrors(ctx, error);
  }
};

const deleteMediaServer = async (ctx: Context) => {
  const id = ctx.params.id;

  try {
    const repo = container.resolve<IMediaServerRepository>('MediaServer');
    const deleted = await repo.deleteById(id);

    StatusOk(ctx, deleted);
  } catch (error) {
    handleCommonErrors(ctx, error);
  }
};

const removeMediaServer = async (ctx: Context) => {
  const id = ctx.params.id;

  try {
    const repo = container.resolve<IMediaServerRepository>('MediaServer');
    const removed = await repo.removeById(id);

    StatusOk(ctx, { removed });
  } catch (error) {
    handleCommonErrors(ctx, error);
  }
};
