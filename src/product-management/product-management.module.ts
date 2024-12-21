import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './services/product.service';
import { ProductRepository } from './repositories/product.repository';
import { ProductController } from './controllers/product.controller';
import { ConfigModule } from '@nestjs/config';
import { Receivement } from './entities/receivement.entity';
import { ReceivementController } from './controllers/receivementController';
import { ReceivementService } from './services/receivement.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentService } from './services/shipment.service';
import { ShipmentController } from './controllers/shipment.controller';
import { ShipmentItem } from './entities/shipment-item.entity';
import { UserManagementModule } from '../user-management/user-management.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Product, Receivement, Shipment, ShipmentItem]),
    UserManagementModule,
  ],
  providers: [
    ProductService,
    ProductRepository,
    ReceivementService,
    ShipmentService,
  ],
  controllers: [ProductController, ReceivementController, ShipmentController],
})
export class ProductManagementModule {}
