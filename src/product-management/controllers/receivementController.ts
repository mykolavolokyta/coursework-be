import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { ReceivementService } from '../services/receivement.service';
import { CreateReceivementDto } from '../dto/create-receivement.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt.auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { AuthRoles } from '../../auth/authRoles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

@Controller('receivement')
export class ReceivementController {
  constructor(private readonly receivementService: ReceivementService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Post('/create')
  async receiveGoods(@Body() createReceivingDto: CreateReceivementDto) {
    return this.receivementService.receiveGoods(createReceivingDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Get('/all')
  async getAllShipments() {
    return this.receivementService.getAllReceivements();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Post('/upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const requiredHeaders = [
      'productName',
      'quantity',
      'supplier',
      'category',
      'weight',
    ];

    const rows = await this.parseCSV(file.buffer);

    const headers = Object.keys(rows[0] || {});
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );
    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Missing headers: ${missingHeaders.join(', ')}`,
      );
    }
    rows.forEach((row, index) => {
      if (isNaN(Number(row.quantity)) || Number(row.quantity) < 0) {
        throw new BadRequestException(`Invalid quantity at row ${index + 1}`);
      }
    });

    for (const row of rows) {
      await this.receiveGoods(row);
    }
  }

  private async parseCSV(buffer: Buffer): Promise<any[]> {
    const rows: any[] = [];
    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csvParser())
        .on('data', (data) => rows.push(data))
        .on('end', () => resolve(rows))
        .on('error', (error) => reject(error));
    });
  }
}
