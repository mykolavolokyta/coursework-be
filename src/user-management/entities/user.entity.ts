import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthRoles } from 'src/auth/authRoles.enum';
import { Shipment } from '../../product-management/entities/shipment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  auth_user_id: string;
  @Column()
  email: string;
  @Column()
  username: string;
  @Column({
    type: 'enum',
    enum: AuthRoles,
    array: true,
    default: [AuthRoles.WORKER],
  })
  role: AuthRoles[];
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @OneToMany(() => Shipment, (shipment) => shipment.responsibleUser)
  shipments: Shipment[];
}
