import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from 'src/auth/auth.service';
import { AuthRoles } from 'src/auth/authRoles.enum';
import omit from 'lodash/omit';
import { IUserInfo } from '../../auth/interfaces';
import { ResponseProfileDto } from '../dto/response-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
  ) {}

  async createUser(user_email: string) {
    try {
      const userFromAuth = await this.authService.createUser(user_email);
      const { userId, email } = userFromAuth;
      const user = this.userRepository.create({
        auth_user_id: userId,
        email,
        role: [AuthRoles.WORKER],
        username: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return await this.userRepository.save(user);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getUsers() {
    try {
      return await this.userRepository.find();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        return new NotFoundException();
      }
      return omit(user, ['auth_user_id']);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserByAuthId(auth_user_id: string) {
    try {
      const user = await this.userRepository.findOneBy({ auth_user_id });
      if (!user) {
        return new NotFoundException();
      }
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async updateUser(userId: string, userDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException();
      }

      if (!userDto.role) {
        await this.authService.removeRoleFromUser(user.email);
      }

      if (userDto.role == AuthRoles.WORKER) {
        console.log(1);
        await this.authService.setWorkerRoleToUser(user.email);
      }

      if (userDto.role == AuthRoles.ADMIN) {
        await this.authService.setAdminRoleToUser(user.email);
      }

      const updatedUser = {
        ...user,
        username: userDto.username ?? user.username,
        role: userDto.role ? [userDto.role] : [],
      } as User;

      await this.userRepository.save(updatedUser);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      await this.authService.deleteUser(user?.auth_user_id);
      return await this.userRepository.delete({ id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async createUserIfNotExists(userInfo: IUserInfo) {
    try {
      const user = await this.userRepository.findOneBy({
        auth_user_id: userInfo.sub,
      });
      if (!user) {
        return await this.userRepository.createRegisteredUser(userInfo);
      } else {
        return user;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getProfile(userInfo: IUserInfo) {
    try {
      if (!userInfo) {
        return new NotFoundException();
      }
      const user = await this.userRepository.findOneBy({
        auth_user_id: userInfo.sub,
      });
      const userData: ResponseProfileDto = {
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      };
      return userData;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async editProfile(updateUserDto: UpdateProfileDto, userInfo: IUserInfo) {
    try {
      if (!userInfo) {
        return new NotFoundException();
      }
      const user = await this.userRepository.findOneBy({
        auth_user_id: userInfo.sub,
      });
      const updatedUser = {
        ...user,
        username: updateUserDto.username ?? user.username,
      } as User;
      return await this.userRepository.save(updatedUser);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
