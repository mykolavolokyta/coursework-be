import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Receivement } from './receivement.entity';
import { ShipmentItem } from './shipment-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('int')
  quantityInStock: number;

  @Column({ length: 100 })
  category: string;

  @Column('float')
  weight: number;

  @OneToMany(() => Receivement, (receiving) => receiving.product)
  receivings: Receivement[];

  @OneToMany(() => ShipmentItem, (shipmentItem) => shipmentItem.product)
  shipmentItems: ShipmentItem[];
}
