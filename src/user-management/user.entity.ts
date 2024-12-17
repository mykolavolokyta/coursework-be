import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuthRoles } from 'src/auth/authRoles.enum';

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
  @Column()
  role: AuthRoles;
  @Column()
  createdAt: string;
  @Column()
  updatedAt: string;
}
