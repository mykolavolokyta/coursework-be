import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), AuthModule],
  providers: [UserService, UserRepository],
  controllers: [UserController, AuthController],
})
export class UserManagementModule {}
