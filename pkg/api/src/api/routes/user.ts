import path from 'path';
import multer from '@koa/multer';
import Router from '@koa/router';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import send from 'koa-send';

import pathsConfig from '@/config/env/paths';
import logger from '@/loaders/logger';
import Profile from '@/models/profile';
import { UserModel, UserRole } from '@/models/user';
import { adminRequired } from "../middleware/auth";

const UPLOAD_DIR = path.join(pathsConfig.dataDir, './uploads');

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
  let userData: any;
  try {
    userData = await UserModel.find().exec();
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
    return;
  }

  if (userData) {
    const data = Object.values(Object.assign(userData));
    Object.keys(data).forEach((u) => {
      const user = data[u];
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
  const { body } = ctx.request;

  const { user } = body;
  if (!user) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
  }
  const dbUser = await UserModel.findOne({
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
      const newUser = new UserModel({
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
    logger.error("failed to get user to edit", err);
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
        const u = await UserModel.findOne({ _id: user }).exec();
        if (!u) {
          throw new Error(`failed to find user with id: ${user}`);
        }

        if (profile) {
          u.profileId = profile;
        } else {
          u.profileId = undefined;
        }

        u.disabled = !enabled;

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
    logger.error("failed to update user", err);
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
  const url = userData.thumbnail;

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
      `ROUTE: Unable to get user thumb - Got error: ${e.message}`,
      e,
    );
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'Unable to get user thumb';
  }
};

const getQuota = async (ctx: Context) => {
  const user = await UserModel.findOne({ _id: ctx.state.user.id }).exec();
  if (!user) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
    return;
  }
  const profile = user.profileId
    ? await Profile.findById(user.profileId).exec()
    : false;
  let total = 0;
  const current = user.quotaCount ? user.quotaCount : 0;
  if (profile) {
    total = profile.quota ? profile.quota : 0;
  }

  ctx.status = StatusCodes.OK;
  ctx.body = {
    current,
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
