import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShipmentStatus } from '../entities/shipment.entity';

export class UpdateShipmentStatusDto {
  @ApiProperty()
  @IsEnum(ShipmentStatus, {
    message: 'Status must be one of: Pending, Shipped, Lost',
  })
  status: ShipmentStatus;
}