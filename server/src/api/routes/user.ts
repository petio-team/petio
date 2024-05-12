/* eslint-disable @typescript-eslint/naming-convention */
import multer from '@koa/multer';
import Router from '@koa/router';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import send from 'koa-send';
import path from 'path';

import { DATA_DIR } from '@/infrastructure/config/env';
import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { ProfileRepository } from '@/resources/profile/repository';
import { UserEntity } from '@/resources/user/entity';
import { UserMapper } from '@/resources/user/mapper';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';

import { adminRequired } from '../middleware/auth';

const UPLOAD_DIR = path.join(DATA_DIR, './uploads');

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req: any, file, cb) {
    req.newThumb = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname,
    )}`;
    cb(null, req.newThumb);
  },
});

const upload = multer({
  storage,
});

const getAllUsers = async (ctx: Context) => {
  try {
    const userResult = await getFromContainer(UserRepository).findAll();
    if (!userResult.length) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = {};
      return;
    }
    ctx.status = StatusCodes.OK;
    ctx.body = userResult.map((u) =>
      getFromContainer(UserMapper).toResponse(u),
    );
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const getUserById = async (ctx: Context) => {
  try {
    const userResult = await getFromContainer(UserRepository).findOne({
      id: ctx.params.id,
    });
    if (userResult.isNone()) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = {};
      return;
    }
    const userData = userResult.unwrap();
    ctx.status = StatusCodes.OK;
    ctx.body = getFromContainer(UserMapper).toResponse(userData);
  } catch (err) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = { error: err };
  }
};

const createCustomUser = async (ctx: Context) => {
  const { body } = ctx.request;
  const { user } = body;

  const dbUser = await getFromContainer(UserRepository).findOne({
    $or: [
      { username: user.username },
      { email: user.email },
      { title: user.username },
    ],
  });
  if (dbUser) {
    ctx.status = StatusCodes.OK;
    ctx.body = {
      error: 'User exists, please change the username or email',
    };
  } else {
    try {
      const newUser = UserEntity.create({
        title: user.username,
        username: user.username,
        password: bcrypt.hashSync(user.password, 12),
        email: user.email,
        thumbnail: '',
        altId: user.linked,
      });
      const data = await getFromContainer(UserRepository).create(newUser);
      ctx.status = StatusCodes.OK;
      ctx.body = getFromContainer(UserMapper).toResponse(data);
    } catch (err) {
      logger.error(err, 'ROUTE: Unable to create custom user');
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = {
        error: 'Error creating user',
      };
    }
  }
};

const editUser = async (ctx: Context) => {
  const { body } = ctx.request;
  const { user } = body;

  if (!user) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
  }

  try {
    const userResult = await getFromContainer(UserRepository).findOne({
      id: user.id,
    });
    if (userResult.isNone()) {
      throw new Error(`failed to find user with id: ${user.id}`);
    }
    const u = userResult.unwrap();
    const props = getFromContainer(UserMapper).toPeristence(u);

    if (user.clearPassword && u.role !== UserRole.ADMIN) {
      props.password = undefined;
    }

    if (user.password) {
      props.password = bcrypt.hashSync(user.password, 12);
    }

    if (user.profile) {
      props.profileId = user.profile;
    } else {
      props.profileId = undefined;
    }

    if (user.email) {
      props.email = user.email;
    }

    if (user.role) {
      props.role = user.role;
    }

    if (user.disabled) {
      props.disabled = user.disabled;
    }

    const { id, ...rest } = user;
    const results = await getFromContainer(UserRepository).updateMany(
      {
        id: user.id,
      },
      {
        $set: rest,
      },
    );
    if (!results) {
      throw new Error(`failed to save user with id: ${user.id}`);
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
  const users = body.users as [];
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
    await Promise.all(
      users.map(async (user: string) => {
        const userResult = await getFromContainer(UserRepository).findOne({
          id: user,
        });
        if (userResult.isNone()) {
          throw new Error(`failed to find user with id: ${user}`);
        }
        const u = userResult.unwrap();
        const props = getFromContainer(UserMapper).toPeristence(u);

        if (profile) {
          props.profileId = profile;
        } else {
          props.profileId = undefined;
        }

        props.disabled = !enabled;

        const { _id, ...rest } = props;
        const results = getFromContainer(UserRepository).updateMany(
          { _id },
          {
            $set: rest,
          },
        );
        if (!results) {
          throw new Error(`failed to save user with id: ${user}`);
        }
      }),
    );

    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'Users saved',
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
  if (!user) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
    return;
  }

  if (!user.custom) {
    ctx.status = StatusCodes.UNAUTHORIZED;
    ctx.body = {
      error: 'Cannot delete non custom users',
    };
    return;
  }

  try {
    // eslint-disable-next-line no-underscore-dangle
    await getFromContainer(UserRepository).deleteManyByIds([user._id]);
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

const updateUserThumbnail = async (ctx: Context) => {
  if (!ctx.params.id) {
    logger.warn('ROUTE: No user ID');

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {};
    return;
  }
  try {
    await getFromContainer(UserRepository).updateMany(
      { id: ctx.params.id },
      {
        $set: {
          custom_thumb: ctx.file.path,
        },
      },
    );
    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error('failed to update user', err);
    logger.warn('ROUTE: Failed to update user thumb in db');

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getThumbnailById = async (ctx: Context) => {
  try {
    const userResult = await getFromContainer(UserRepository).findOne({
      id: ctx.params.id,
    });
    if (userResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = {};
      return;
    }
    const userData = userResult.unwrap();

    if (userData.customThumbnail) {
      send(ctx, `${UPLOAD_DIR}/${userData.customThumbnail}`);
      return;
    }
    const url = userData.thumbnail;
    if (url) {
      const resp = await axios.get(url, {
        responseType: 'stream',
      });
      ctx.response.set('Content-Type', 'image/png');
      ctx.status = StatusCodes.OK;
      ctx.body = resp.data;
    }
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  } catch (e) {
    logger.log(
      'warn',
      `ROUTE: Unable to get user thumb - Got error: ${e.message}`,
      e,
    );
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'Unable to get user thumb';
  }
};

const getQuota = async (ctx: Context) => {
  const userResult = await getFromContainer(UserRepository).findOneById(
    ctx.state.user.id,
  );
  if (userResult.isNone()) {
    ctx.status = StatusCodes.OK;
    ctx.body = {
      current: 0,
      total: 0,
    };
    return;
  }
  const user = userResult.unwrap();
  let total = 0;
  if (user.profileId) {
    const profileResult = await getFromContainer(ProfileRepository).findOne({
      id: user.profileId,
    });
    if (profileResult.isSome()) {
      const profile = profileResult.unwrap();
      total = profile.quota;
    }
  }
  ctx.status = StatusCodes.OK;
  ctx.body = {
    current: user.quotaCount,
    total,
  };
};

const route = new Router({ prefix: '/user' });
export default (app: Router) => {
  route.get('/all', getAllUsers, adminRequired);
  route.get('/quota', getQuota);
  route.get('/thumb/:id', getThumbnailById);
  route.get('/:id', getUserById);
  route.post('/create_custom', createCustomUser, adminRequired);
  route.post('/edit', editUser);
  route.post('/bulk_edit', editMultipleUsers, adminRequired);
  route.post('/delete_user', deleteUser, adminRequired);
  route.post('/thumb/:id', upload.single('img'), updateUserThumbnail);

  app.use(route.routes());
};
