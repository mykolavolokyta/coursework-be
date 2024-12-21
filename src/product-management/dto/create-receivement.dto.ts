import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReceivementDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  supplier: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  weight: number;
}
