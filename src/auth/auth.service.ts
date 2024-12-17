import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppMetadata,
  AuthenticationClient,
  ManagementClient,
  Role,
  UserMetadata,
} from 'auth0';
import { AuthRoles } from './authRoles.enum';
import * as generator from 'generate-password';

@Injectable()
export class AuthService {
  private managementClient: ManagementClient<AppMetadata, UserMetadata>;
  private authClient: AuthenticationClient;
  private roles: Role[];
  constructor(private readonly configService: ConfigService) {
    this.managementClient = new ManagementClient({
      domain: configService.get('AUTH0_DOMAIN'),
      clientId: configService.get('AUTH0_CLIENT_ID'),
      clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
    });
    this.managementClient.getRoles(undefined, (err, roles) => {
      if (err) {
        throw err;
      }
      this.roles = roles;
    });
    this.authClient = new AuthenticationClient({
      domain: configService.get('AUTH0_DOMAIN'),
      clientId: configService.get('AUTH0_CLIENT_ID'),
      clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
    });
  }

  async setWorkerRoleToUser(email: string): Promise<void> {
    try {
      const [user] = await this.managementClient.getUsersByEmail(email);
      const employeeRole = this.roles.find(
        (role) => role.name === AuthRoles.WORKER,
      );
      await this.managementClient.assignRolestoUser(
        { id: user.user_id },
        { roles: [employeeRole.id] },
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async setViewerRoleToUser(email: string): Promise<void> {
    try {
      const [user] = await this.managementClient.getUsersByEmail(email);
      await this.managementClient.removeRolesFromUser(
        { id: user.user_id },
        {
          roles: this.roles.map((role) => role.id),
        },
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async createUser(email: string) {
    const password = generator.generate({
      length: 10,
      numbers: true,
      strict: true,
    });
    const user = {
      email,
      connection: 'Username-Password-Authentication',
      email_verified: false,
      password,
    };
    try {
      const res = await this.managementClient.createUser(user);
      await this.authClient.requestChangePasswordEmail({
        email,
        connection: 'Username-Password-Authentication',
      });
      return { userId: res.user_id, email };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async deleteUser(user_id: string) {
    try {
      return await this.managementClient.deleteUser({ id: user_id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserRoles(id: string) {
    const roles = await this.managementClient.getUserRoles({ id });
    return roles.map((role) => role.name);
  }
}
