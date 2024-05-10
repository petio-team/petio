import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { adminRequired } from '@/api/middleware/auth';
import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import { ProfileEntity } from '@/resources/profile/entity';
import { ProfileMapper } from '@/resources/profile/mapper';
import { ProfileRepository } from '@/resources/profile/repository';
import { UserRepository } from '@/resources/user/repository';

const listProfiles = async (ctx: Context) => {
  try {
    const profileResults = await getFromContainer(ProfileRepository).findAll();
    ctx.status = StatusCodes.OK;
    ctx.body = profileResults.map((p) =>
      getFromContainer(ProfileMapper).toResponse(p),
    );
    return;
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
  const profileRepo = getFromContainer(ProfileRepository);

  if (profile.isDefault) {
    try {
      await profileRepo.updateMany(
        { isDefault: true },
        {
          $set: {
            isDefault: false,
          },
        },
      );
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
      await profileRepo.updateMany(
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
      );
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
      const newProfile = ProfileEntity.create({
        name: profile.name,
        sonarr: profile.sonarr,
        radarr: profile.radarr,
        autoApprove: profile.autoApprove,
        autoApproveTv: profile.autoApproveTv,
        quota: profile.quota,
        isDefault: profile.isDefault,
      });
      await profileRepo.create(newProfile);

      ctx.status = StatusCodes.OK;
      ctx.body = getFromContainer(ProfileMapper).toResponse(newProfile);
    } catch (err) {
      logger.error(err, 'ROUTE: Profile failed to save');
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
    await getFromContainer(UserRepository).updateMany(
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
    logger.error(err, 'ROUTE: Profile failed to delete');
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: 'failed to unset profile' };
    return;
  }

  try {
    await getFromContainer(ProfileRepository).deleteMany({ id: profile.id });
    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'Profile deleted',
    };
  } catch (err) {
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
