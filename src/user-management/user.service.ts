import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { AuthService } from 'src/auth/auth.service';
import { AuthRoles } from 'src/auth/authRoles.enum';
import omit from 'lodash/omit';
import { IUserInfo } from '../auth/interfaces';

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
        role: AuthRoles.WORKER,
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
}
