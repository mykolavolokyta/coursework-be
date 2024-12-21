import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post, Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AuthRoles } from 'src/auth/authRoles.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserInfo } from '../../auth/user-info.decorator';
import { IUserInfo } from '../../auth/interfaces';
import { ResponseProfileDto } from '../dto/response-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.ADMIN)
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.ADMIN)
  @Get('all')
  async getUsers() {
    return this.userService.getUsers();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.ADMIN)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseProfileDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Get('/profile')
  async getProfile(@UserInfo() userInfo: IUserInfo) {
    return await this.userService.getProfile(userInfo);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseProfileDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Put('/profile')
  async editProfile(
    @Body() updateUserDto: UpdateProfileDto,
    @UserInfo() userInfo: IUserInfo,
  ) {
    return await this.userService.editProfile(updateUserDto, userInfo);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.ADMIN)
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Success Update response' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.ADMIN)
  @Put('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
