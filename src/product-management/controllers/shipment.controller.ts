import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post, Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ShipmentService } from '../services/shipment.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AuthRoles } from 'src/auth/authRoles.enum';
import { CreateShipmentDto } from '../dto/create-shipment.dto';
import { UserInfo } from '../../auth/user-info.decorator';
import { IUserInfo } from '../../auth/interfaces';
import { Response } from 'express';
import { UpdateShipmentStatusDto } from '../dto/update-shipment-status.dto';

@ApiTags('Shipment')
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Post('/create')
  async createShipment(
    @UserInfo() userInfo: IUserInfo,
    @Body() createShipmentDto: CreateShipmentDto,
  ) {
    return this.shipmentService.createShipment(userInfo, createShipmentDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Get('/all')
  async getAllShipments() {
    return this.shipmentService.getAllShipments();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Get(':id')
  async getShipmentById(@Param('id') id: number) {
    const shipment = await this.shipmentService.findShipmentById(id);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Get(':id/invoice')
  async generateInvoice(@Param('id') id: number, @Res() res: Response) {
    const pdfBytes = await this.shipmentService.generateInvoice(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(Buffer.from(pdfBytes));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Put(':id/status')
  async updateShipmentStatus(
    @Param('id') id: number,
    @Body() updateShipmentStatusDto: UpdateShipmentStatusDto,
  ) {
    const updatedShipment = await this.shipmentService.updateShipmentStatus(
      id,
      updateShipmentStatusDto.status,
    );

    if (!updatedShipment) {
      throw new NotFoundException('Shipment not found');
    }

    return updatedShipment;
  }
}
