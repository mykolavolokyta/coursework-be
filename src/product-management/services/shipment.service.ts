import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShipmentDto } from '../dto/create-shipment.dto';
import { Shipment } from '../entities/shipment.entity';
import { Product } from '../entities/product.entity';
import { ShipmentItem } from '../entities/shipment-item.entity';
import { IUserInfo } from '../../auth/interfaces';
import { UserService } from '../../user-management/services/user.service';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentItem)
    private shipmentItemRepository: Repository<ShipmentItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UserService,
  ) {}

  async createShipment(
    userInfo: IUserInfo,
    createShipmentDto: CreateShipmentDto,
  ) {
    const user = await this.userService.getUserByAuthId(userInfo.sub);

    if (!user) {
      return new NotFoundException();
    }

    const { recipient, items } = createShipmentDto;

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(
          `Product with ID ${item.productId} not found.`,
        );
      }

      if (product.quantityInStock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for product "${product.name}". Available: ${product.quantityInStock}, requested: ${item.quantity}.`,
        );
      }
    }

    const shipment = this.shipmentRepository.create({
      recipient,
      items: [],
      responsibleUser: user,
    } as Shipment);

    const savedShipment = await this.shipmentRepository.save(shipment);

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      const shipmentItem = this.shipmentItemRepository.create({
        shipment: savedShipment,
        product,
        quantity: item.quantity,
      });

      await this.shipmentItemRepository.save(shipmentItem);

      product.quantityInStock -= item.quantity;
      await this.productRepository.save(product);
    }

    return this.shipmentRepository.findOne({
      where: { id: savedShipment.id },
      relations: ['items', 'items.product'],
    });
  }

  async getAllShipments() {
    const shipments = await this.shipmentRepository.find({
      relations: ['items', 'items.product', 'responsibleUser'],
    });

    return shipments.map((shipment) => ({
      id: shipment.id,
      recipient: shipment.recipient,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
      items: shipment.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
      })),
      status: shipment.status,
      responsibleUser: {
        username: shipment.responsibleUser?.username,
      },
    }));
  }

  async findShipmentById(id: number): Promise<Shipment | null> {
    return await this.shipmentRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'responsibleUser'],
    });
  }

  async generateInvoice(id: number) {
    const shipment = await this.findShipmentById(id);

    if (!shipment) {
      throw new BadRequestException(`Product with ID ${id} not found.`);
    }

    const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf';
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const url2 =
      'https://db.onlinewebfonts.com/t/643e59524d730ce6c6f2384eebf945f8.ttf';
    const fontBytes = await fetch(url2).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    let customFont;
    if (fontBytes) {
      pdfDoc.registerFontkit(fontkit);
      await pdfDoc.embedFont(fontBytes);
      customFont = await pdfDoc.embedFont(fontBytes);
    }

    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();

    page.drawText(`Накладна: Відправлення №${shipment.id}`, {
      x: 50,
      y: height - 50,
      size: 18,
      font: customFont,
    });

    page.drawText(`Отримувач: ${shipment.recipient}`, {
      x: 50,
      y: height - 80,
      size: 14,
      font: customFont,
    });

    page.drawText(
      `Відповідальний: ${shipment.responsibleUser?.username || 'Невідомо'}`,
      {
        x: 50,
        y: height - 110,
        size: 14,
        font: customFont,
      },
    );

    page.drawText(`Статус: ${shipment.status}`, {
      x: 50,
      y: height - 140,
      size: 14,
      font: customFont,
    });

    page.drawText(
      `Час відправки: ${new Date(shipment.createdAt).toLocaleString()}`,
      {
        x: 50,
        y: height - 170,
        size: 14,
        font: customFont,
      },
    );

    let yPosition = height - 220;
    page.drawText('Товари:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: customFont,
    });
    yPosition -= 20;

    page.drawText('№', { x: 50, y: yPosition, size: 12, font: customFont });
    page.drawText('Назва товару', {
      x: 100,
      y: yPosition,
      size: 12,
      font: customFont,
    });
    page.drawText('Кількість', {
      x: 300,
      y: yPosition,
      size: 12,
      font: customFont,
    });
    page.drawText('Вага', { x: 400, y: yPosition, size: 12, font: customFont });

    yPosition -= 20;

    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 550, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    shipment.items.forEach((item, index) => {
      yPosition -= 20;

      page.drawText(`${index + 1}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: customFont,
      });
      page.drawText(item.product.name, {
        x: 100,
        y: yPosition,
        size: 12,
        font: customFont,
      });
      page.drawText(`${item.quantity}`, {
        x: 300,
        y: yPosition,
        size: 12,
        font: customFont,
      });
      page.drawText(`${item.product.weight || 'N/A'} кг`, {
        x: 400,
        y: yPosition,
        size: 12,
        font: customFont,
      });
    });

    yPosition -= 20;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 550, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    pdfDoc.removePage(0);
    return await pdfDoc.save();
  }
}
