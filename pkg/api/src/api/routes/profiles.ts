import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { adminRequired } from '@/api/middleware/auth';
import logger from '@/loaders/logger';
import Profile from '@/models/profile';
import { UserModel } from '@/models/user';

const listProfiles = async (ctx: Context) => {
  let data: any;
  try {
    data = await Profile.find();
    if (data) {
      ctx.status = StatusCodes.OK;
      ctx.body = data;
      return;
    }

    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = { error: 'not found' };
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };

  }
};

const saveProfile = async (ctx: Context) => {
  const body = ctx.request.body as any;
  const { profile } = body;
  if (!profile) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'no profile details' };
  }

  if (profile.isDefault) {
    try {
      await Profile.findOneAndUpdate(
        { isDefault: true },
        {
          $set: {
            isDefault: false,
          },
        },
        { new: true, useFindAndModify: false },
      ).exec();
    } catch {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = {
        error: 'failed to update, error removing defaults',
      };
      return;
    }
  }

  if (profile.id) {
    try {
      await Profile.findOneAndUpdate(
        { _id: profile.id },
        {
          $set: {
            name: profile.name,
            sonarr: profile.sonarr,
            radarr: profile.radarr,
            autoApprove: profile.autoApprove,
            autoApproveTv: profile.autoApproveTv,
            quota: profile.quota,
            isDefault: profile.isDefault,
          },
        },
        { new: true, useFindAndModify: false },
      ).exec();
      ctx.status = StatusCodes.OK;
      ctx.body = {
        message: 'profile updated',
      };
    } catch {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = {
        error: 'failed to update',
      };
    }
  } else {
    try {
      const newProfile = new Profile({
        name: profile.name,
        sonarr: profile.sonarr,
        radarr: profile.radarr,
        autoApprove: profile.autoApprove,
        autoApproveTv: profile.autoApproveTv,
        quota: profile.quota,
        isDefault: profile.isDefault,
      });
      await newProfile.save();

      ctx.status = StatusCodes.OK;
      ctx.body = newProfile;
    } catch (err) {
      logger.log('error', 'ROUTE: Profile failed to save');
      logger.log({ level: 'error', message: err });

      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = {
        error: 'error creating user',
      };
    }
  }
};

const deleteProfile = async (ctx: Context) => {
  const body = ctx.request.body as any;

  const { profile } = body;
  if (!profile || !profile.id) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'no profile details',
    };
  }

  try {
    await UserModel.updateMany(
      {
        profileId: profile.id,
      },
      {
        $unset: {
          profile: '',
        },
      },
    );
  } catch (err) {
    logger.log('error', 'ROUTE: Profile failed to delete');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'failed to unset profile' };
    return;
  }

  try {
    await Profile.findOneAndRemove({ _id: profile.id });
    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'Profile deleted',
    };
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'Failed to delete',
    };
  }
};

const route = new Router({ prefix: '/profiles' });

export default (app: Router) => {
  route.get('/all', adminRequired, listProfiles);
  route.post('/save_profile', adminRequired, saveProfile);
  route.post('/delete_profile', adminRequired, deleteProfile);

  app.use(route.routes());
};