import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post, Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AuthRoles } from 'src/auth/authRoles.enum';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductService } from '../services/product.service';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Success Create response' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Post('create')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Get('all')
  async getUsers() {
    return this.productService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Put(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() productDto: CreateProductDto,
  ) {
    return this.productService.update(id, productDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.WORKER, AuthRoles.ADMIN)
  @Delete('/:id')
  async deleteUser(@Param('id') id: number) {
    return this.productService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoles.ADMIN)
  @Get('/:id')
  async getUser(@Param('id') id: number) {
    return this.productService.findOne(id);
  }
}
