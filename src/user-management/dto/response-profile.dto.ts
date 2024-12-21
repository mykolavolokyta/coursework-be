import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  role: string[];

  @ApiProperty()
  createdAt: Date;
}
