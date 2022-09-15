import multer from '@koa/multer';
import Router from '@koa/router';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import Bluebird from 'bluebird';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import send from 'koa-send';
import path from 'path';

import env from '@/config/env';
import { WriteConfig, config } from '@/config/index';
import logger from '@/loaders/logger';
import Profile from '@/models/profile';
import { UserModel, UserRole } from '@/models/user';

const UPLOAD_DIR = path.join(env.paths.data, './uploads');
const route = new Router({ prefix: '/user' });

let storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req: any, file, cb) {
    req.newThumb =
      file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, req.newThumb);
  },
});

const upload = multer({
  storage,
});

export default (app: Router) => {
  route.get('/all', getAllUsers);
  route.get('/quota', getQuota);
  route.get('/thumb/:id', getThumbnailById);
  route.get('/:id', getUserById);
  route.post('/create_custom', createCustomUser);
  route.post('/edit', editUser);
  route.post('/bulk_edit', editMultipleUsers);
  route.post('/delete_user', deleteUser);
  route.post('/thumb/:id', upload.single('img'), updateUserThumbnail);

  app.use(route.routes());
};

const getAllUsers = async (ctx: Context) => {
  let userData: any;
  try {
    userData = await UserModel.find().exec();
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
    return;
  }

  if (userData) {
    let data = Object.values(Object.assign(userData));
    Object.keys(data).forEach((u) => {
      let user = data[u];
      if (user) {
        if (user.password) user.password = 'removed';
      }
    });

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } else {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
};

const getUserById = async (ctx: Context) => {
  let userData: any;
  try {
    userData = await UserModel.findOne({ id: ctx.params.id }).exec();
  } catch (err) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = { error: err };
    return;
  }
  if (userData) {
    if (userData.password) userData.password = 'removed';
    ctx.status = StatusCodes.OK;
    ctx.body = userData;
  } else {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
};

const createCustomUser = async (ctx: Context) => {
  const body = ctx.request.body;

  let user = body.user;
  if (!user) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
  }
  let dbUser = await UserModel.findOne({
    $or: [
      { username: user.username },
      { email: user.email },
      { title: user.username },
    ],
  }).exec();
  if (dbUser) {
    ctx.status = StatusCodes.OK;
    ctx.body = {
      error: 'User exists, please change the username or email',
    };
  } else {
    try {
      let newUser = new UserModel({
        id: user.id,
        title: user.username,
        username: user.username,
        password: bcrypt.hashSync(user.password, 12),
        email: user.email,
        recommendationsPlaylistId: false,
        thumbnail: '',
        altId: user.linked,
        isOwner: false,
      });
      await newUser.save();
      ctx.status = StatusCodes.OK;
      ctx.body = newUser;
    } catch (err) {
      logger.log('error', 'ROUTE: Unable to create custom user');
      logger.log({ level: 'error', message: err });
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = {
        error: 'Error creating user',
      };
    }
  }
};

const editUser = async (ctx: Context) => {
  const body = ctx.request.body;
  const user = body.user;

  if (!user) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
  }

  try {
    const u = await UserModel.findOne({ _id: user.id }).exec();
    if (!u) {
      throw new Error(`failed to find user with id: ${user.id}`);
    }

    if (user.clearPassword && u.role !== UserRole.Admin) {
      u.password = undefined;
    }

    if (user.password) {
      u.password = bcrypt.hashSync(user.password, 10);
    }

    if (user.profile) {
      u.profileId = user.profile;
    } else {
      u.profileId = undefined;
    }

    if (user.email) {
      u.email = user.email;
    }

    if (user.role) {
      u.role = user.role;
    }

    if (user.disabled) {
      u.disabled = user.disabled;
    }

    const results = await u.save();
    if (!results) {
      throw new Error(`failed to save user with id: ${user.id}`);
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'User edited',
    };
  } catch (err) {
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'Error editing user',
    };
  }
};

const editMultipleUsers = async (ctx: Context) => {
  const body = ctx.request.body;
  let users = body.users as [];
  let enabled = body.enabled;
  let profile = body.profile;

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
        const u = await UserModel.findOne({ _id: user }).exec();
        if (!u) {
          throw new Error(`failed to find user with id: ${user}`);
        }

        if (profile) {
          u.profileId = profile;
        } else {
          u.profileId = undefined;
        }

        u.disabled = enabled ? false : true;

        const results = u.save();
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
  const body = ctx.request.body;

  let user = body.user;
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
    await UserModel.findByIdAndDelete(user._id);
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
    await UserModel.findOneAndUpdate(
      { id: ctx.params.id },
      {
        $set: {
          custom_thumb: ctx.file.path,
        },
      },
      { useFindAndModify: false },
    ).exec();

    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.log({ level: 'error', message: err });
    logger.warn('ROUTE: Failed to update user thumb in db');

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getThumbnailById = async (ctx: Context) => {
  let userData: any = false;
  try {
    userData = await UserModel.findOne({ _id: ctx.params.id }).exec();
  } catch (err) {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = { error: err };
    return;
  }

  if (!userData) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'user data missing';
    return;
  }

  if (userData.custom_thumb) {
    send(ctx, `${UPLOAD_DIR}/${userData.custom_thumb}`);
    return;
  }
  let url = userData.thumbnail;

  try {
    const resp = await axios.get(url, {
      responseType: 'stream',
    });
    ctx.response.set('Content-Type', 'image/png');
    ctx.status = StatusCodes.OK;
    ctx.body = resp.data;
  } catch (e) {
    logger.log(
      'warn',
      'ROUTE: Unable to get user thumb - Got error: ' + e.message,
      e,
    );
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'Unable to get user thumb';
  }
};

const getQuota = async (ctx: Context) => {
  if (!ctx.state.user) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
    return;
  }
  const user = await UserModel.findOne({ id: ctx.state.user.id }).exec();
  if (!user) {
    return;
  }

  if (!user) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
    return;
  }
  const profile = user.profileId
    ? await Profile.findById(user.profileId).exec()
    : false;
  let total = 0;
  let current = user.quotaCount ? user.quotaCount : 0;
  if (profile) {
    total = profile.quota ? profile.quota : 0;
  }

  ctx.status = StatusCodes.NOT_FOUND;
  ctx.body = {
    current: current,
    total: total,
  };
};
