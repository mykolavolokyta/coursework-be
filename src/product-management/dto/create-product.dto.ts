import { IsNotEmpty, IsString, IsInt, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  quantityInStock: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsPositive()
  weight: number;
}
