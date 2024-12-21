import { ApiProperty } from '@nestjs/swagger';
import { AuthRoles } from '../../auth/authRoles.enum';

export class UpdateUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  role?: AuthRoles;
}
