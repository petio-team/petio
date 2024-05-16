/* eslint-disable @typescript-eslint/naming-convention */
import multer from '@koa/multer';
import Router from '@koa/router';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import send from 'koa-send';
import path from 'path';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { DATA_DIR } from '@/infrastructure/config/env';
import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { UserService } from '@/services/user/user';

import { adminRequired } from '../middleware/auth';

const UPLOAD_DIR = path.join(DATA_DIR, './uploads');

const getAllUsers = async (ctx: Context) => {
  try {
    const service = getFromContainer(UserService);
    const usersResult = await service.getAllUsers();

    ctx.status = StatusCodes.OK;
    ctx.body = usersResult;
  } catch (err) {
    logger.debug('failed to get all users', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const getUserById = async (ctx: Context) => {
  try {
    const service = getFromContainer(UserService);
    const userResult = await service.getUserById(ctx.params.id);
    if (!userResult) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = {};
      return;
    }
    ctx.status = StatusCodes.OK;
    ctx.body = userResult;
  } catch (err) {
    logger.debug('failed to get user by id', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const createCustomUser = async (ctx: Context) => {
  const { body } = ctx.request;
  const { user } = body;

  try {
    const service = getFromContainer(UserService);
    const userData = await service.createUser(user);

    ctx.status = StatusCodes.OK;
    ctx.body = userData;
  } catch (err) {
    logger.error('failed to create custom user', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const editUser = async (ctx: Context) => {
  const { body } = ctx.request;
  const { user } = body;

  try {
    const service = getFromContainer(UserService);
    const updated = await service.updateUser(user);
    if (!updated) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = {
        error: 'Failed to update user',
      };
      return;
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'User edited',
    };
  } catch (err) {
    logger.error('failed to get user to edit', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'Error editing user',
    };
  }
};

const editMultipleUsers = async (ctx: Context) => {
  const { body } = ctx.request;
  const users = body.users as any[];
  const { enabled } = body;
  const { profile } = body;

  if (!users) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
    return;
  }

  try {
    const service = getFromContainer(UserService);
    const results = await service.updateMultipleUsers({
      ids: users,
      enabled,
      profile,
    });

    const updated = results.filter((r) => r === true);
    const failed = results.filter((r) => r === false);

    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'Users saved',
      data: {
        updated,
        failed,
      },
    };
  } catch (err) {
    logger.error(err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'Error editing user',
    };
  }
};

const deleteUser = async (ctx: Context) => {
  const { body } = ctx.request;
  const { user } = body;

  try {
    const service = getFromContainer(UserService);
    const deleted = await service.deleteUser(user.id);
    if (!deleted) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = {
        error: 'Failed to delete user',
      };
      return;
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'User deleted',
    };
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'Error deleting user',
    };
  }
};

const getThumbnailById = async (ctx: Context) => {
  try {
    const service = getFromContainer(UserService);
    const results = await service.getUserThumbnail(ctx.params.id);
    if (!results) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = {};
      return;
    }
    const { thumbnail, customThumbnail } = results;
    if (customThumbnail) {
      send(ctx, `${UPLOAD_DIR}/${customThumbnail}`);
      return;
    }
    if (!thumbnail) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = {};
      return;
    }
    const resp = await axios.get(thumbnail, {
      responseType: 'stream',
    });
    ctx.response.set('Content-Type', 'image/png');
    ctx.status = StatusCodes.OK;
    ctx.body = resp.data;
  } catch (err) {
    logger.error('failed to get user thumb', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'Unable to get user thumb';
  }
};

const updateUserThumbnail = async (ctx: Context) => {
  try {
    const service = getFromContainer(UserService);
    const updated = await service.updateUserThumbnail(
      ctx.params.id,
      ctx.newThumb,
    );
    if (!updated) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = {
        error: 'Failed to update user thumb',
      };
      return;
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error('failed to update user', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getQuota = async (ctx: Context) => {
  try {
    const service = getFromContainer(UserService);
    const quota = await service.getQuotaCount(ctx.state.user.id);
    ctx.status = StatusCodes.OK;
    ctx.body = quota;
  } catch (err) {
    logger.error('failed to get user quota', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'Unable to get user quota';
  }
};

const route = new Router({ prefix: '/user' });
export default (app: Router) => {
  route.get('/all', adminRequired, getAllUsers);
  route.get(
    '/:id',
    validateRequest({
      params: z.object({
        id: z.string().min(1),
      }),
    }),
    getUserById,
  );
  route.post(
    '/create_custom',
    adminRequired,
    validateRequest({
      body: z.object({
        user: z.object({
          username: z.string(),
          email: z.string(),
          password: z.string(),
          admin: z.boolean(),
          quota: z.number(),
          enabled: z.boolean(),
          title: z.string(),
        }),
      }),
    }),
    createCustomUser,
  );
  route.post(
    '/edit',
    validateRequest({
      body: z.object({
        user: z.object({
          id: z.string(),
          username: z.string(),
          email: z.string(),
          admin: z.boolean(),
          quota: z.number(),
          enabled: z.boolean(),
          title: z.string(),
        }),
      }),
    }),
    editUser,
  );
  route.post(
    '/bulk_edit',
    adminRequired,
    validateRequest({
      body: z.object({
        users: z.array(z.string()),
        enabled: z.boolean(),
        profile: z.string(),
      }),
    }),
    editMultipleUsers,
  );
  route.post(
    '/delete_user',
    adminRequired,
    validateRequest({
      body: z.object({
        user: z.object({
          id: z.string(),
        }),
      }),
    }),
    deleteUser,
  );
  route.get(
    '/thumb/:id',
    validateRequest({
      params: z.object({
        id: z.string().min(1),
      }),
    }),
    getThumbnailById,
  );
  route.post(
    '/thumb/:id',
    validateRequest({
      params: z.object({
        id: z.string().min(1),
      }),
    }),
    multer({
      storage: multer.diskStorage({
        destination(_req, _file, cb) {
          cb(null, UPLOAD_DIR);
        },
        filename(req: any, file, cb) {
          req.newThumb = `${file.fieldname}-${Date.now()}${path.extname(
            file.originalname,
          )}`;
          cb(null, req.newThumb);
        },
      }),
    }).single('img'),
    updateUserThumbnail,
  );
  route.get('/quota', getQuota);

  app.use(route.routes());
};
