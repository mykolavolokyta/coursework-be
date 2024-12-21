import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receivement } from '../entities/receivement.entity';
import { Product } from '../entities/product.entity';
import { CreateReceivementDto } from '../dto/create-receivement.dto';

@Injectable()
export class ReceivementService {
  constructor(
    @InjectRepository(Receivement)
    private receivementRepository: Repository<Receivement>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async receiveGoods(createReceivingDto: CreateReceivementDto) {
    let product = await this.productRepository.findOne({
      where: { name: createReceivingDto.productName },
    });

    if (
      !product &&
      (!createReceivingDto.category || !createReceivingDto.weight)
    ) {
      return { newProductRequired: true };
    }

    if (!product) {
      product = this.productRepository.create({
        name: createReceivingDto.productName,
        quantityInStock: createReceivingDto.quantity,
        category: createReceivingDto.category,
        weight: createReceivingDto.weight,
      });
      await this.productRepository.save(product);
    } else {
      product.quantityInStock += Number(createReceivingDto.quantity);
      await this.productRepository.save(product);
    }

    const receivement = this.receivementRepository.create({
      product,
      quantity: createReceivingDto.quantity,
      supplier: createReceivingDto.supplier,
    });

    await this.receivementRepository.save(receivement);

    return receivement;
  }

  async getAllReceivements() {
    const receivements = await this.receivementRepository.find({
      relations: ['product'],
    });

    return receivements.map((receivement) => ({
      id: receivement.id,
      supplier: receivement.supplier,
      product: receivement.product.name,
      quantity: receivement.quantity,
      createdAt: receivement.createdAt,
    }));
  }
}
