import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShipmentItem } from './shipment-item.entity';
import { User } from '../../user-management/entities/user.entity';

export enum ShipmentStatus {
  PENDING = 'Pending',
  DELIVERED = 'Delivered',
  LOST = 'Lost',
}

@Entity()
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipient: string;

  @OneToMany(() => ShipmentItem, (item) => item.shipment, { cascade: true })
  items: ShipmentItem[];

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @ManyToOne(() => User, (user) => user.shipments, { nullable: true })
  responsibleUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
