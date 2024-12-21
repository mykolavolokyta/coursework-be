import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receivement } from '../../product-management/entities/receivement.entity';
import { Repository } from 'typeorm';
import { Product } from '../../product-management/entities/product.entity';
import { ProductRepository } from '../../product-management/repositories/product.repository';
import { Shipment } from '../../product-management/entities/shipment.entity';
import { User } from '../../user-management/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    @InjectRepository(Receivement)
    private readonly receivementRepository: Repository<Receivement>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAnalytics() {
    const totalReceivings = await this.receivementRepository.count();

    const totalShipments = await this.shipmentRepository.count();

    const topProducts = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .select(
        'product.name, SUM(items.quantity) as productsShipped, COUNT(shipment.id) as shipmentsCount',
      )
      .groupBy('product.id')
      .orderBy('productsShipped', 'DESC')
      .limit(5)
      .getRawMany();

    const totalWorkers = await this.userRepository
      .createQueryBuilder('user')
      .where(':role = ANY (user.role)', { role: 'worker' })
      .getCount();

    return {
      totalReceivings,
      totalShipments,
      totalWorkers,
      topProducts,
    };
  }
}
