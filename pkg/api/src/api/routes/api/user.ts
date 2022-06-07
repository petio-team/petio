import multer from '@koa/multer';
import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import http from 'follow-redirects';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import send from 'koa-send';
import path from 'path';

import { dataFolder } from '@/config/env';
import { WriteConfig, config } from '@/config/index';
import logger from '@/loaders/logger';
import Profile from '@/models/profile';
import { UserModel, UserRole } from '@/models/user';

const UPLOAD_DIR = path.join(dataFolder, './uploads');
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
    userData = await UserModel.find();
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
    return;
  }

  if (userData) {
    let data = Object.values(Object.assign(userData));
    Object.keys(data).map((u) => {
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
    userData = await UserModel.findOne({ id: ctx.params.id });
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
  const body = ctx.request.body as any;

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
  });
  if (dbUser) {
    ctx.status = StatusCodes.OK;
    ctx.body = {
      error: 'User exists, please change the username or email',
    };
    return;
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
  const body = ctx.request.body as any;
  let user = body.user;

  if (!user) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'No user details',
    };
  }

  try {
    let userObj: any = {
      email: user.email,
      role: user.role,
      profile: user.profile,
      disabled: user.disabled,
    };

    if (user.password) {
      userObj.password = bcrypt.hashSync(user.password, 10);
    }

    if (user.clearPassword) {
      userObj.password = null;
    }

    if (user.role === UserRole.Admin && !user.password) {
      userObj.password =
        config.get('admin.password').substring(0, 3) === '$2a'
          ? config.get('admin.password')
          : bcrypt.hashSync(config.get('admin.password'), 10);
    }

    if (user.role === 'admin' && user.email) {
      config.set('admin.email', user.email);
      WriteConfig();
    }

    await UserModel.findOneAndUpdate(
      { _id: user.id },
      {
        $set: userObj,
      },
      { new: true, useFindAndModify: false },
    );

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
  const body = ctx.request.body as any;
  let users = body.users;
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
      users.map(async (user) => {
        await UserModel.updateMany(
          {
            _id: user,
          },
          {
            $set: {
              profile: profile,
              disabled: enabled ? false : true,
            },
          },
        );
      }),
    );

    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'Users saved',
    };
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'Error editing user',
    };
  }
};

const deleteUser = async (ctx: Context) => {
  const body = ctx.request.body as any;

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
    );

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
    userData = await UserModel.findOne({ id: ctx.params.id });
  } catch (err) {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = { error: err };
    return;
  }

  if (userData) {
    if (userData.custom_thumb) {
      send(ctx, `${UPLOAD_DIR}/${userData.custom_thumb}`);
      return;
    }
    let url = userData.thumb;

    var options = {
      host: 'plex.tv',
      path: url.replace('https://plex.tv', ''),
      method: 'GET',
      headers: {
        'content-type': 'image/png',
      },
    };

    var request = http
      .get(options, function (response) {
        ctx.response.header['Content-Type'] = response.headers['content-type'];
      })
      .on('error', function (e) {
        logger.log(
          'warn',
          'ROUTE: Unable to get user thumb - Got error: ' + e.message,
          e,
        );
      });
    request.end();
  }
};

const getQuota = async (ctx: Context) => {
  if (!ctx.state.user) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
    return;
  }
  const user = await UserModel.findOne({ id: ctx.state.user.id });
  if (!user) {
    return;
  }

  if (!user) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
    return;
  }
  const profile = user.profileId
    ? await Profile.findById(user.profileId)
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
