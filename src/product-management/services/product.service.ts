import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(search?: string): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where(
        'product.name ILIKE :search OR product.id::text ILIKE :search OR product.category ILIKE :search',
        { search: `%${search}%` },
      );
    }
    queryBuilder.orderBy('product.id', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: CreateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    try {
      return await this.productRepository.delete({ id });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
