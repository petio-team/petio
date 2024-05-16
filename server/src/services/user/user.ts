import bcrypt from 'bcryptjs';
import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { ProfileRepository } from '@/resources/profile/repository';
import { UserEntity } from '@/resources/user/entity';
import { UserMapper } from '@/resources/user/mapper';
import { UserRepository } from '@/resources/user/repository';
import {
  CreateUserProps,
  UpdateMultipleUserProps,
  UpdateUserProps,
} from '@/services/user/types';

/**
 * Service class for managing user-related operations.
 */
@Service()
export class UserService {
  private logger: pino.Logger;

  /**
   * Represents the User service.
   */
  constructor(
    logger: Logger,
    private userRepository: UserRepository,
    private userMapper: UserMapper,
    private profileRepository: ProfileRepository,
  ) {
    this.logger = logger.child({ module: 'services.user' });
  }

  /**
   * Retrieves all users from the database.
   * @returns {Promise<Array<UserResponse>>} A promise that resolves to an array of user responses.
   */
  async getAllUsers() {
    const userResult = await this.userRepository.findAll();
    return userResult.map((u) => this.userMapper.toResponse(u));
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object if found, or null if not found or an error occurred.
   */
  async getUserById(id: string): Promise<any | null> {
    try {
      const userResult = await this.userRepository.findOne({ id });
      if (userResult.isNone()) {
        return null;
      }
      return this.userMapper.toResponse(userResult.unwrap());
    } catch (err) {
      this.logger.error(err, 'failed to get user by id');
      return null;
    }
  }

  /**
   * Creates a new user.
   * @param props - The properties of the user to be created.
   * @returns A Promise that resolves to the created user.
   */
  async createUser(props: CreateUserProps) {
    const userResult = await this.userRepository.findOne({
      $or: [
        { username: props.username },
        { email: props.email },
        { title: props.username },
      ],
    });
    if (userResult.isSome()) {
      throw new Error('User already exists');
    }
    const newUser = UserEntity.create({
      title: props.title,
      username: props.username,
      password: bcrypt.hashSync(props.password, 12),
      email: props.email,
      altId: props.linked,
    });
    return this.userMapper.toResponse(
      await this.userRepository.create(newUser),
    );
  }

  /**
   * Updates a user with the provided properties.
   * @param props - The properties to update the user with.
   * @returns A Promise that resolves to a boolean indicating whether the user was updated successfully.
   */
  async updateUser(props: UpdateUserProps) {
    const user = await this.userRepository.exists({ id: props.id });
    if (!user) {
      return false;
    }
    // eslint-disable-next-line prefer-const
    let { password, profile, ...rest } = props;

    if (!props.clearPassword && password) {
      password = bcrypt.hashSync(password, 12);
    } else {
      password = undefined;
    }

    return this.userRepository.updateMany(
      { id: props.id },
      {
        ...rest,
        profileId: profile,
        password,
      },
    );
  }

  /**
   * Updates multiple users.
   * @param users - The users to be updated.
   * @returns A promise that resolves to an array of updated users.
   */
  async updateMultipleUsers(users: UpdateMultipleUserProps) {
    return Promise.all(
      users.ids.map((u) =>
        this.updateUser({
          id: u,
          profile: users.profile,
          disabled: !users.enabled,
        }),
      ),
    );
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The ID of the user to delete.
   * @returns A boolean indicating whether the user was deleted successfully.
   * @throws An error if the user is not a custom user.
   */
  async deleteUser(id: string) {
    const userResult = await this.userRepository.findOne({ id });
    if (userResult.isNone()) {
      return false;
    }
    const user = userResult.unwrap();

    if (!user.custom) {
      throw new Error('Cannot delete non-custom user');
    }

    return this.userRepository.deleteManyByIds([id]);
  }

  /**
   * Updates the thumbnail path for a user.
   * @param id - The ID of the user.
   * @param thumbnailPath - The new thumbnail path.
   * @returns A boolean indicating whether the update was successful.
   */
  async updateUserThumbnail(id: string, thumbnailPath: string) {
    const userResult = await this.userRepository.findOne({ id });
    if (userResult.isNone()) {
      return false;
    }
    return this.userRepository.updateMany(
      { id },
      { customThumbnail: thumbnailPath },
    );
  }

  /**
   * Retrieves the thumbnail information for a user.
   * @param id - The ID of the user.
   * @returns An object containing the thumbnail and customThumbnail properties, or null if the user is not found.
   */
  async getUserThumbnail(id: string) {
    const userResult = await this.userRepository.findOne({ id });
    if (userResult.isNone()) {
      return null;
    }
    const { thumbnail, customThumbnail } = userResult.unwrap();
    return { thumbnail, customThumbnail };
  }

  /**
   * Retrieves the quota count for a user.
   * @param id - The ID of the user.
   * @returns An object containing the total quota and the current quota count.
   * If the user is not found, returns null.
   */
  async getQuotaCount(id: string) {
    const userResult = await this.userRepository.findOne({ id });
    if (userResult.isNone()) {
      return {
        total: 0,
        current: 0,
      };
    }
    const user = userResult.unwrap();
    let total = 0;
    if (user.profileId) {
      const profileResult = await this.profileRepository.findOne({
        id: user.profileId,
      });
      if (profileResult.isSome()) {
        total = profileResult.unwrap().quota;
      }
    }
    return {
      total,
      current: user.quotaCount,
    };
  }
}
