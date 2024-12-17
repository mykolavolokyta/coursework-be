import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.entity';
import { DataSource, Repository } from 'typeorm';
import { IUserInfo } from 'src/auth/interfaces';
import { AuthRoles } from 'src/auth/authRoles.enum';
import { ConfigService } from '@nestjs/config';
//import { UserFilterDto } from 'src/user-management/dto/user-filter.dto';
//import { IPaginated } from 'src/user-management/interfaces/paginated.interface';

@Injectable()
export class UserRepository extends Repository<User> {
  private jwtRolesKey = `${this.configService.get('JWT_CUSTOM_NAMESPACE')}/roles`;

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async createRegisteredUser(userInfo: IUserInfo): Promise<User> {
    const user = this.create({
      auth_user_id: userInfo.sub,
      email: userInfo.email,
      role: userInfo[this.jwtRolesKey] ?? [AuthRoles.WORKER],
      username: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as User);
    try {
      await this.save(user);
      return user;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  // async getUsers(filter: UserFilterDto, withPagination = false) {
  //   const { search, orderBy, groupId } = filter;
  //
  //   const page = Number(filter.page) || 1;
  //   const limit = Number(filter.limit) || 10;
  //
  //   const query = this.createQueryBuilder('user');
  //   query.leftJoinAndSelect('user.groups', 'group');
  //   query.select([
  //     'user.id',
  //     'user.username',
  //     'user.email',
  //     'user.role',
  //     'user.createdAt',
  //     'user.updatedAt',
  //     'group.id',
  //     'group.name',
  //     'group.description',
  //   ]);
  //   if (search) {
  //     query.andWhere(
  //       '((LOWER(user.username) LIKE LOWER(:search)) OR (LOWER(user.email) LIKE LOWER(:search)))',
  //       {
  //         search: `%${search}%`,
  //       },
  //     );
  //   }
  //   if (groupId) {
  //     query.andWhere('group.id = :groupId', { groupId });
  //   }
  //   if (orderBy) {
  //     const order = (filter.sortOrder?.toUpperCase() as any) || 'ASC';
  //     if (orderBy === 'group') {
  //       query.orderBy(`group.name`, order);
  //     } else {
  //       query.orderBy(`user.${orderBy}`, order);
  //     }
  //   } else {
  //     const order = (filter.sortOrder?.toUpperCase() as any) || 'DESC';
  //     query.orderBy(`user.createdAt`, order);
  //   }
  //   try {
  //     if (withPagination) {
  //       query.take(limit);
  //       query.skip((page - 1) * limit);
  //       const [result, total] = await query.getManyAndCount();
  //       const paginatedResult: IPaginated<User> = {
  //         items: result,
  //         meta: {
  //           itemsPerPage: limit,
  //           itemCount: limit,
  //           totalItems: total,
  //           totalPages: Math.ceil(total / limit),
  //           currentPage: page,
  //         },
  //       };
  //       return paginatedResult;
  //     } else {
  //       return await query.getMany();
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     throw new InternalServerErrorException();
  //   }
  // }

  async getUserById(id: string): Promise<User> {
    const query = this.createQueryBuilder('user');
    query.where('user.id = :id', { id });
    query.select([
      'user.id',
      'user.username',
      'user.email',
      'user.role',
      'user.createdAt',
      'user.updatedAt',
    ]);
    try {
      return await query.getOne();
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
}
